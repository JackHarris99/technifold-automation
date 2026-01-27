/**
 * GET /api/admin/companies/all
 * Fetch all customer companies with tool/subscription counts (excludes distributors, suppliers, etc.)
 * Optimized with bulk queries
 * SECURITY: Requires authentication
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // 1. Fetch ALL customer companies in batches (Supabase has 1000 row limit per query)
    let allCompanies: any[] = [];
    let start = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('companies')
        .select('company_id, company_name, country, account_owner, category')
        .eq('type', 'customer')
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
        .select('company_id, tool_code, total_units')
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
    const toolsByCompany = new Map<string, number>(); // Sum of total_units
    const uniqueToolsByCompany = new Map<string, Set<string>>(); // Unique tool codes

    allTools.forEach(t => {
      // Sum total_units for machine_count
      const current = toolsByCompany.get(t.company_id) || 0;
      toolsByCompany.set(t.company_id, current + (t.total_units || 1));

      // Track unique tool codes per company
      if (!uniqueToolsByCompany.has(t.company_id)) {
        uniqueToolsByCompany.set(t.company_id, new Set());
      }
      uniqueToolsByCompany.get(t.company_id)!.add(t.tool_code);
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
      unique_tool_count: uniqueToolsByCompany.get(company.company_id)?.size || 0,
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
