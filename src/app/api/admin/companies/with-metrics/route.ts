/**
 * GET /api/admin/companies/with-metrics
 * Fetch all companies with order metrics for categorization
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Get all companies
    const { data: companies } = await supabase
      .from('companies')
      .select('company_id, company_name, category, first_invoice_at, last_invoice_at')
      .order('last_invoice_at', { ascending: false, nullsFirst: false });

    if (!companies) {
      return NextResponse.json({ companies: [] });
    }

    // Get order metrics for each (batch by company_id)
    const companyIds = companies.map(c => c.company_id);

    const { data: orderMetrics } = await supabase
      .from('orders')
      .select('company_id, total_amount, created_at')
      .in('company_id', companyIds)
      .eq('payment_status', 'paid');

    // Aggregate metrics
    const metricsMap = new Map();
    orderMetrics?.forEach(order => {
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

    // Combine
    const enriched = companies.map(c => ({
      ...c,
      ...metricsMap.get(c.company_id) || {
        lifetime_value: 0,
        order_count: 0,
        first_order: null,
        last_order: null
      }
    }));

    return NextResponse.json({ companies: enriched });
  } catch (err) {
    console.error('[admin/companies/with-metrics] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
