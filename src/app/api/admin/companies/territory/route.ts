/**
 * API: Get companies for specific territory (account_owner filtered)
 * GET /api/admin/companies/territory?user_id={sales_rep_id}
 *
 * Optimized to use bulk queries instead of N+1
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const maxDuration = 60; // Vercel: allow up to 60s for this endpoint

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();

    // 1. Fetch all companies for this territory in ONE query (with reasonable limit)
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('company_id, company_name, country, account_owner, category')
      .eq('account_owner', userId)
      .order('company_name')
      .limit(1000); // Reasonable limit per territory

    if (companiesError) {
      console.error('[territory] Error fetching companies:', companiesError);
      return NextResponse.json({ error: companiesError.message }, { status: 500 });
    }

    if (!companies || companies.length === 0) {
      return NextResponse.json({ companies: [], count: 0 });
    }

    const companyIds = companies.map(c => c.company_id);

    // 2. Fetch ALL tools for these companies in ONE query
    const { data: allTools } = await supabase
      .from('company_tools')
      .select('company_id, total_units')
      .in('company_id', companyIds);

    // 3. Fetch ALL subscriptions for these companies in ONE query
    const { data: allSubscriptions } = await supabase
      .from('subscriptions')
      .select('company_id, status')
      .in('company_id', companyIds)
      .in('status', ['active', 'trial']);

    // 4. Aggregate in memory (fast)
    const toolsByCompany = new Map<string, number>();
    allTools?.forEach(t => {
      const current = toolsByCompany.get(t.company_id) || 0;
      toolsByCompany.set(t.company_id, current + (t.total_units || 0));
    });

    const subsByCompany = new Map<string, { total: number; trials: number }>();
    allSubscriptions?.forEach(s => {
      const current = subsByCompany.get(s.company_id) || { total: 0, trials: 0 };
      current.total++;
      if (s.status === 'trial') current.trials++;
      subsByCompany.set(s.company_id, current);
    });

    // 5. Enrich companies with counts
    const enrichedCompanies = companies.map(company => ({
      ...company,
      machine_count: toolsByCompany.get(company.company_id) || 0,
      subscription_count: subsByCompany.get(company.company_id)?.total || 0,
      has_trial: (subsByCompany.get(company.company_id)?.trials || 0) > 0,
    }));

    return NextResponse.json({
      companies: enrichedCompanies,
      count: enrichedCompanies.length,
    });
  } catch (error) {
    console.error('[territory] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
