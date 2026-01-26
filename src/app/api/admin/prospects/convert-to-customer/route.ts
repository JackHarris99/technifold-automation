/**
 * POST /api/admin/prospects/convert-to-customer
 * Convert a prospect company to a customer
 * Directors only - manual conversion by Jack
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Directors only
    const user = await getCurrentUser();
    if (!user || user.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized - Directors only' }, { status: 403 });
    }

    const body = await request.json();
    const { prospect_company_id } = body;

    if (!prospect_company_id) {
      return NextResponse.json(
        { error: 'prospect_company_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Fetch prospect company data
    const { data: prospectCompany, error: prospectError } = await supabase
      .from('prospect_companies')
      .select('*')
      .eq('prospect_company_id', prospect_company_id)
      .single();

    if (prospectError || !prospectCompany) {
      return NextResponse.json(
        { error: 'Prospect company not found' },
        { status: 404 }
      );
    }

    // 2. Fetch prospect contacts
    const { data: prospectContacts } = await supabase
      .from('prospect_contacts')
      .select('*')
      .eq('prospect_company_id', prospect_company_id);

    // 3. Get all ACTIVE sales reps for fair assignment
    const { data: salesReps, error: repsError } = await supabase
      .from('users')
      .select('sales_rep_id, full_name')
      .eq('role', 'sales_rep')
      .eq('is_active', true)
      .order('sales_rep_id');

    if (repsError || !salesReps || salesReps.length === 0) {
      console.error('[Prospect Convert] No active sales reps:', repsError);
      return NextResponse.json(
        { error: 'No active sales reps available for assignment' },
        { status: 500 }
      );
    }

    // 4. Count TOTAL companies per rep for fair assignment
    let allCompanies: { account_owner: string | null }[] = [];
    let start = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('companies')
        .select('account_owner')
        .not('account_owner', 'is', null)
        .range(start, start + batchSize - 1);

      if (batchError) {
        console.error('[Prospect Convert] Error counting companies:', batchError);
        return NextResponse.json(
          { error: 'Failed to calculate assignment' },
          { status: 500 }
        );
      }

      if (batch && batch.length > 0) {
        allCompanies = allCompanies.concat(batch);
        start += batchSize;
        hasMore = batch.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    // 5. Calculate fair assignment
    const repCounts: { [key: string]: number } = {};
    salesReps.forEach(rep => {
      repCounts[rep.sales_rep_id] = 0;
    });

    allCompanies.forEach(company => {
      if (company.account_owner && repCounts[company.account_owner] !== undefined) {
        repCounts[company.account_owner]++;
      }
    });

    const minCount = Math.min(...Object.values(repCounts));
    const repsWithFewest = Object.keys(repCounts).filter(
      rep => repCounts[rep] === minCount
    );
    const randomIndex = Math.floor(Math.random() * repsWithFewest.length);
    const assignedRep = repsWithFewest[randomIndex];

    console.log('[Prospect Convert] Fair assignment:', repCounts, 'Assigned:', assignedRep);

    // 6. Create company in main companies table
    const newCompanyId = randomUUID();
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        company_id: newCompanyId,
        company_name: prospectCompany.company_name,
        website: prospectCompany.website,
        country: prospectCompany.country,
        type: 'customer',
        source: `prospect_conversion_${prospectCompany.source}`,
        status: 'active',
        account_owner: assignedRep,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (companyError) {
      console.error('[Prospect Convert] Error creating company:', companyError);
      return NextResponse.json(
        { error: companyError.message },
        { status: 500 }
      );
    }

    // 7. Migrate contacts from prospect_contacts to contacts
    let migratedContacts = 0;
    if (prospectContacts && prospectContacts.length > 0) {
      const contactsToInsert = prospectContacts.map(pc => ({
        company_id: newCompanyId,
        first_name: pc.first_name,
        last_name: pc.last_name,
        full_name: pc.full_name || `${pc.first_name || ''} ${pc.last_name || ''}`.trim(),
        email: pc.email,
        phone: pc.phone,
        role: pc.role,
        marketing_status: pc.marketing_status || 'subscribed',
        source: 'prospect_conversion',
        status: 'active',
        token: crypto.randomUUID(),
      }));

      const { error: contactsError } = await supabase
        .from('contacts')
        .insert(contactsToInsert);

      if (contactsError) {
        console.error('[Prospect Convert] Error migrating contacts:', contactsError);
        // Don't fail the whole operation - contacts can be added manually
      } else {
        migratedContacts = contactsToInsert.length;
      }
    }

    // 8. Update prospect company to mark as converted
    await supabase
      .from('prospect_companies')
      .update({
        lead_status: 'converted',
        converted_at: new Date().toISOString(),
        converted_to_company_id: newCompanyId,
      })
      .eq('prospect_company_id', prospect_company_id);

    // 9. Create activity log entry
    await supabase
      .from('company_activities')
      .insert({
        company_id: newCompanyId,
        activity_type: 'conversion',
        activity_title: 'Converted from Prospect',
        activity_description: `Company converted from prospect to customer. Originally sourced from: ${prospectCompany.source}. Assigned to ${assignedRep}.`,
        performed_by: user.user_id,
        performed_at: new Date().toISOString(),
      });

    const assignedRepData = salesReps.find(r => r.sales_rep_id === assignedRep);

    return NextResponse.json({
      success: true,
      company: newCompany,
      assigned_to: {
        sales_rep_id: assignedRep,
        full_name: assignedRepData?.full_name || assignedRep,
      },
      migrated_contacts: migratedContacts,
      message: `Successfully converted "${prospectCompany.company_name}" to customer and assigned to ${assignedRepData?.full_name}`,
    });

  } catch (error: any) {
    console.error('[Prospect Convert] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
