/**
 * TechniCrease Quote Review & Approval
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TechnicreaseQuoteApprovalClient from '@/components/admin/TechnicreaseQuoteApprovalClient';

export default async function TechnicreaseQuoteApprovalPage({
  params,
}: {
  params: Promise<{ quote_id: string }>;
}) {
  const { quote_id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch quote with all details
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select(`
      *,
      companies!inner(company_name, billing_address_line_1, billing_city, billing_postal_code, billing_country, vat_number),
      contacts!inner(full_name, email, phone)
    `)
    .eq('quote_id', quote_id)
    .single();

  if (quoteError || !quote) {
    return <div className="p-8 text-center text-red-600">Quote not found</div>;
  }

  // Fetch line items
  const { data: lineItems, error: itemsError } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quote_id)
    .order('line_number');

  if (itemsError) {
    return <div className="p-8 text-center text-red-600">Error loading quote items</div>;
  }

  return (
    <TechnicreaseQuoteApprovalClient
      quote={quote}
      lineItems={lineItems || []}
      user={user}
    />
  );
}
