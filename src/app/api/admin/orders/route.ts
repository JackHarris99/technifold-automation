/**
 * GET /api/admin/orders
 * Fetch all orders with company and contact details
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Fetch all orders with batch fetching to handle >1000 orders
    let allOrders: any[] = [];
    let start = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          company_id,
          contact_id,
          stripe_checkout_session_id,
          stripe_payment_intent_id,
          items,
          subtotal,
          tax_amount,
          total_amount,
          currency,
          status,
          payment_status,
          created_at,
          paid_at,
          completed_at,
          zoho_invoice_id
        `)
        .order('created_at', { ascending: false })
        .range(start, start + batchSize - 1);

      if (error) {
        console.error('[orders-api] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
      }

      if (batch && batch.length > 0) {
        allOrders = allOrders.concat(batch);
        start += batchSize;
        hasMore = batch.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    // Enrich with company and contact names
    const companyIds = [...new Set(allOrders.map(o => o.company_id))];
    const contactIds = [...new Set(allOrders.map(o => o.contact_id).filter(Boolean))];

    const { data: companies } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .in('company_id', companyIds);

    const { data: contacts } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email')
      .in('contact_id', contactIds);

    const companyMap = new Map(companies?.map(c => [c.company_id, c.company_name]) || []);
    const contactMap = new Map(contacts?.map(c => [c.contact_id, { name: c.full_name, email: c.email }]) || []);

    const enrichedOrders = allOrders.map(order => ({
      ...order,
      company_name: companyMap.get(order.company_id) || 'Unknown',
      contact_name: contactMap.get(order.contact_id)?.name || 'Unknown',
      contact_email: contactMap.get(order.contact_id)?.email || null,
    }));

    console.log(`[orders-api] Fetched ${enrichedOrders.length} total orders`);
    return NextResponse.json({ orders: enrichedOrders });
  } catch (err) {
    console.error('[orders-api] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
