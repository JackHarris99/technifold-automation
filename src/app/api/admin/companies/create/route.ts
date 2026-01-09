/**
 * POST /api/admin/companies/create
 * Create new company with automatic fair assignment to sales rep
 * Assignment logic: Assign to rep with fewest TOTAL companies (active + inactive + dead)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('current_user');

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(userCookie.value);
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

    // 1. Fetch all active sales reps
    const { data: salesReps, error: repsError } = await supabase
      .from('users')
      .select('sales_rep_id, full_name')
      .eq('role', 'sales_rep')
      .order('sales_rep_id');

    if (repsError || !salesReps || salesReps.length === 0) {
      console.error('[companies/create] Error fetching sales reps:', repsError);
      return NextResponse.json(
        { error: 'No sales reps available for assignment' },
        { status: 500 }
      );
    }

    // 2. Count TOTAL companies per rep (regardless of status - ensures fairness)
    const { data: allCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('account_owner')
      .not('account_owner', 'is', null);

    if (companiesError) {
      console.error('[companies/create] Error counting companies:', companiesError);
      return NextResponse.json(
        { error: 'Failed to calculate assignment' },
        { status: 500 }
      );
    }

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

    console.log('[companies/create] Assignment counts:', repCounts);
    console.log('[companies/create] Assigned to:', assignedRep);

    // 6. Create company with assigned rep
    const { data: newCompany, error: createError } = await supabase
      .from('companies')
      .insert({
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

    // 7. Get assigned rep name for response
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
