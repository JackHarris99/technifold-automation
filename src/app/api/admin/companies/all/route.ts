/**
 * GET /api/admin/companies/all
 * Fetch all companies for dropdowns/selectors
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Fetch ALL companies in batches (Supabase has 1000 row hard limit)
    let allCompanies: any[] = [];
    let start = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('companies')
        .select('company_id, company_name')
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

    console.log(`[companies/all] Fetched ${allCompanies.length} total companies`);
    return NextResponse.json({ companies: allCompanies });
  } catch (err) {
    console.error('[companies/all] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
