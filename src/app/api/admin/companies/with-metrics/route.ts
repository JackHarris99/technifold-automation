/**
 * GET /api/admin/companies/with-metrics
 * Fetch all companies with order metrics for categorization
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Get ALL companies (handle pagination)
    let allCompanies: any[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('companies')
        .select('company_id, company_name, category, first_invoice_at, last_invoice_at')
        .range(from, from + batchSize - 1);

      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        allCompanies = [...allCompanies, ...data];
        hasMore = data.length === batchSize;
        from += batchSize;
      }
    }

    // Get ALL order metrics (handle pagination)
    let allOrders: any[] = [];
    from = 0;
    hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('orders')
        .select('company_id, total_amount, created_at')
        .eq('payment_status', 'paid')
        .range(from, from + batchSize - 1);

      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        allOrders = [...allOrders, ...data];
        hasMore = data.length === batchSize;
        from += batchSize;
      }
    }

    // Aggregate metrics by company
    const metricsMap = new Map();
    allOrders.forEach(order => {
      if (!metricsMap.has(order.company_id)) {
        metricsMap.set(order.company_id, {
          lifetime_value: 0,
          order_count: 0,
          first_order: null,
          last_order: null
        });
      }

      const m = metricsMap.get(order.company_id);
      m.lifetime_value += order.total_amount;
      m.order_count++;

      const orderDate = order.created_at?.split('T')[0];
      if (!m.first_order || orderDate < m.first_order) m.first_order = orderDate;
      if (!m.last_order || orderDate > m.last_order) m.last_order = orderDate;
    });

    // Combine and sort by lifetime value
    const enriched = allCompanies.map(c => ({
      ...c,
      ...metricsMap.get(c.company_id) || {
        lifetime_value: 0,
        order_count: 0,
        first_order: null,
        last_order: null
      }
    })).sort((a, b) => b.lifetime_value - a.lifetime_value);  // Sort by value DESC

    console.log(`[with-metrics] Fetched ${enriched.length} companies`);

    return NextResponse.json({ companies: enriched });
  } catch (err) {
    console.error('[admin/companies/with-metrics] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
