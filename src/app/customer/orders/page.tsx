/**
 * Customer Order History Page
 * Shows pending orders and invoices for logged-in customer
 * /customer/orders
 */

import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';
import OrdersPageClient from './OrdersPageClient';

// Only show invoices from this date onwards (avoids old problematic invoices)
const INVOICE_CUTOFF_DATE = '2026-02-11'; // Today - adjust as needed

export default async function CustomerOrdersPage() {
  // Check authentication
  const session = await getCustomerSession();

  if (!session) {
    redirect('/customer/login');
  }

  const supabase = getSupabaseClient();

  // Fetch invoices for this company (only recent ones)
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      invoice_id,
      invoice_number,
      invoice_date,
      total_amount,
      currency,
      status,
      payment_status,
      invoice_url,
      invoice_pdf_url,
      paid_at,
      created_at
    `)
    .eq('company_id', session.company_id)
    .gte('created_at', INVOICE_CUTOFF_DATE)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Customer Orders] Error fetching invoices:', error);
  }

  // Fetch pending orders (awaiting review or approval)
  const { data: pendingOrdersData, error: ordersError } = await supabase
    .from('distributor_orders')
    .select(`
      order_id,
      po_number,
      created_at,
      status,
      subtotal,
      predicted_shipping,
      vat_amount,
      total_amount,
      currency,
      shipping_address_line_1,
      shipping_city,
      shipping_postal_code,
      shipping_country
    `)
    .eq('company_id', session.company_id)
    .eq('order_type', 'customer')
    .in('status', ['pending_review', 'approved'])
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('[Customer Orders] Error fetching pending orders:', ordersError);
  }

  // Fetch items for each pending order
  const pendingOrders = await Promise.all(
    (pendingOrdersData || []).map(async (order) => {
      const { data: items } = await supabase
        .from('distributor_order_items')
        .select('product_code, description, quantity, unit_price, line_total')
        .eq('order_id', order.order_id)
        .order('product_code');

      return {
        ...order,
        items: items || [],
      };
    })
  );

  return (
    <OrdersPageClient
      invoices={invoices || []}
      pendingOrders={pendingOrders}
      userName={session.first_name}
    />
  );
}
