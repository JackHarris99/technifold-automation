/**
 * GET /api/admin/companies/all
 * Fetch all companies with tool/subscription counts (for directors)
 * Optimized with bulk queries
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // 1. Fetch ALL companies in batches (Supabase has 1000 row limit per query)
    let allCompanies: any[] = [];
    let start = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('companies')
        .select('company_id, company_name, country, account_owner, category')
        .order('company_name')
        .range(start, start + batchSize - 1);

      if (error) {
        console.error('[companies/all] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
      }

      if (batch && batch.length > 0) {
        allCompanies = allCompanies.concat(batch);
        start += batchSize;
        hasMore = batch.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    if (allCompanies.length === 0) {
      return NextResponse.json({ companies: [], count: 0 });
    }

    const companyIds = allCompanies.map(c => c.company_id);

    // 2. Fetch ALL tools in batches
    let allTools: any[] = [];
    for (let i = 0; i < companyIds.length; i += 500) {
      const batch = companyIds.slice(i, i + 500);
      const { data: tools } = await supabase
        .from('company_tools')
        .select('company_id, total_units')
        .in('company_id', batch);
      if (tools) allTools = allTools.concat(tools);
    }

    // 3. Fetch ALL subscriptions in batches
    let allSubscriptions: any[] = [];
    for (let i = 0; i < companyIds.length; i += 500) {
      const batch = companyIds.slice(i, i + 500);
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('company_id, status')
        .in('company_id', batch)
        .in('status', ['active', 'trial']);
      if (subs) allSubscriptions = allSubscriptions.concat(subs);
    }

    // 4. Aggregate in memory
    const toolsByCompany = new Map<string, number>();
    allTools.forEach(t => {
      const current = toolsByCompany.get(t.company_id) || 0;
      toolsByCompany.set(t.company_id, current + (t.total_units || 0));
    });

    const subsByCompany = new Map<string, { total: number; trials: number }>();
    allSubscriptions.forEach(s => {
      const current = subsByCompany.get(s.company_id) || { total: 0, trials: 0 };
      current.total++;
      if (s.status === 'trial') current.trials++;
      subsByCompany.set(s.company_id, current);
    });

    // 5. Enrich companies
    const enrichedCompanies = allCompanies.map(company => ({
      ...company,
      machine_count: toolsByCompany.get(company.company_id) || 0,
      subscription_count: subsByCompany.get(company.company_id)?.total || 0,
      has_trial: (subsByCompany.get(company.company_id)?.trials || 0) > 0,
    }));

    console.log(`[companies/all] Fetched ${enrichedCompanies.length} companies`);
    return NextResponse.json({
      companies: enrichedCompanies,
      count: enrichedCompanies.length,
    });
  } catch (err) {
    console.error('[companies/all] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
