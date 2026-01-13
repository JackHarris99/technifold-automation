/**
 * POST /api/admin/companies/create
 * Create new company with automatic fair assignment to sales rep
 * Assignment logic: Assign to rep with fewest TOTAL companies (active + inactive + dead)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const body = await request.json();
    const {
      company_name,
      website,
      country,
      billing_address_line_1,
      billing_address_line_2,
      billing_city,
      billing_state_province,
      billing_postal_code,
      billing_country,
      vat_number,
      company_reg_number,
    } = body;

    if (!company_name) {
      return NextResponse.json(
        { error: 'company_name is required' },
        { status: 400 }
      );
    }

    // 1. Fetch all ACTIVE sales reps only
    const { data: salesReps, error: repsError } = await supabase
      .from('users')
      .select('sales_rep_id, full_name, is_active')
      .eq('role', 'sales_rep')
      .eq('is_active', true)  // ONLY active sales reps
      .order('sales_rep_id');

    if (repsError || !salesReps || salesReps.length === 0) {
      console.error('[companies/create] Error fetching sales reps:', repsError);
      return NextResponse.json(
        { error: 'No active sales reps available for assignment' },
        { status: 500 }
      );
    }

    console.log('[companies/create] Active sales reps found:', salesReps.map(r => `${r.full_name} (${r.sales_rep_id})`));

    // 2. Count TOTAL companies per rep (regardless of status - ensures fairness)
    // IMPORTANT: Use batching to get ALL companies (Supabase default limit is 1000)
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
        console.error('[companies/create] Error counting companies:', batchError);
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

    console.log('[companies/create] Total companies counted:', allCompanies.length);

    // 3. Count companies per rep
    const repCounts: { [key: string]: number } = {};
    salesReps.forEach(rep => {
      repCounts[rep.sales_rep_id] = 0;
    });

    allCompanies?.forEach(company => {
      if (company.account_owner && repCounts[company.account_owner] !== undefined) {
        repCounts[company.account_owner]++;
      }
    });

    // 4. Find rep(s) with fewest total assignments
    const minCount = Math.min(...Object.values(repCounts));
    const repsWithFewest = Object.keys(repCounts).filter(
      rep => repCounts[rep] === minCount
    );

    // 5. If multiple reps tied for fewest, pick randomly
    const randomIndex = Math.floor(Math.random() * repsWithFewest.length);
    const assignedRep = repsWithFewest[randomIndex];

    // Detailed logging for debugging
    console.log('[companies/create] ===== ASSIGNMENT CALCULATION =====');
    console.log('[companies/create] Current company counts per rep:', repCounts);
    console.log('[companies/create] Minimum count:', minCount);
    console.log('[companies/create] Reps with fewest companies:', repsWithFewest);
    console.log('[companies/create] Randomly selected:', assignedRep);
    const assignedRepName = salesReps.find(r => r.sales_rep_id === assignedRep)?.full_name;
    console.log('[companies/create] Assigned to:', `${assignedRepName} (${assignedRep})`);

    // 6. Generate unique company_id (MAN prefix for manually created)
    const companyId = `MAN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // 7. Create company with assigned rep
    const { data: newCompany, error: createError } = await supabase
      .from('companies')
      .insert({
        company_id: companyId,
        company_name,
        website: website || null,
        country: country || null,
        billing_address_line_1: billing_address_line_1 || null,
        billing_address_line_2: billing_address_line_2 || null,
        billing_city: billing_city || null,
        billing_state_province: billing_state_province || null,
        billing_postal_code: billing_postal_code || null,
        billing_country: billing_country || null,
        vat_number: vat_number || null,
        company_reg_number: company_reg_number || null,
        account_owner: assignedRep,
        type: 'customer',
        source: 'manual_entry',
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('[companies/create] Error creating company:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // 8. Get assigned rep name for response
    const assignedRepData = salesReps.find(r => r.sales_rep_id === assignedRep);

    return NextResponse.json({
      success: true,
      company: newCompany,
      assigned_to: {
        sales_rep_id: assignedRep,
        full_name: assignedRepData?.full_name || assignedRep,
      },
      assignment_counts: repCounts,
    });
  } catch (error) {
    console.error('[companies/create] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
