/**
 * GET /api/admin/companies/with-metrics
 * Fetch all companies with order metrics for categorization
 *
 * OPTIMIZED: Uses database aggregation instead of JavaScript
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const maxDuration = 60; // Vercel: allow up to 60s for this endpoint

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Try materialized view first (if it exists)
    let { data: companies, error } = await supabase
      .from('company_metrics_view')
      .select('*')
      .order('lifetime_value', { ascending: false })
      .limit(2000);

    // Fallback: If view doesn't exist, use optimized query with limited data
    if (error && error.code === 'PGRST204') {
      console.log('[with-metrics] View not found, using fallback query');

      // Just get companies with basic info (fast, no aggregation)
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('company_id, company_name, category, account_owner, first_invoice_at, last_invoice_at')
        .order('company_name')
        .limit(1000); // Reasonable limit

      if (companiesError) {
        console.error('[with-metrics] Error:', companiesError);
        return NextResponse.json({ error: companiesError.message }, { status: 500 });
      }

      // Return with placeholder metrics (to be calculated on demand)
      companies = (companiesData || []).map(c => ({
        ...c,
        lifetime_value: 0,
        order_count: 0,
        first_order: null,
        last_order: null,
      }));
    } else if (error) {
      console.error('[with-metrics] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      // Transform dates for frontend compatibility
      companies = (companies || []).map(c => ({
        ...c,
        first_order: c.first_order_date ? new Date(c.first_order_date).toISOString().split('T')[0] : null,
        last_order: c.last_order_date ? new Date(c.last_order_date).toISOString().split('T')[0] : null,
      }));
    }

    console.log(`[with-metrics] Fetched ${companies.length} companies`);

    return NextResponse.json({ companies });
  } catch (err) {
    console.error('[admin/companies/with-metrics] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
