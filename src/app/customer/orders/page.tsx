/**
 * Customer Order History Page
 * Shows all invoices for logged-in customer
 * /customer/orders
 */

import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';
import OrderHistoryClient from './OrderHistoryClient';

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

  return (
    <OrderHistoryClient
      invoices={invoices || []}
      userName={session.first_name}
    />
  );
}
