/**
 * Admin Quote Preview Page
 * Read-only preview of how the quote will appear to customers
 * Does NOT trigger view tracking or notifications
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { StaticQuotePortal } from '@/components/quotes/StaticQuotePortal';
import { InteractiveQuotePortal } from '@/components/quotes/InteractiveQuotePortal';

interface AdminQuotePreviewProps {
  params: Promise<{
    quote_id: string;
  }>;
}

export default async function AdminQuotePreviewPage({ params }: AdminQuotePreviewProps) {
  const { quote_id } = await params;

  const supabase = getSupabaseClient();

  // 1. Fetch quote from database
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*')
    .eq('quote_id', quote_id)
    .single();

  if (quoteError || !quote) {
    console.error('[AdminPreview] Quote not found:', quote_id, quoteError);
    notFound();
  }

  // 2. Fetch quote line items
  const { data: lineItems, error: itemsError } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quote_id)
    .order('line_number', { ascending: true });

  if (itemsError || !lineItems) {
    console.error('[AdminPreview] Line items error:', itemsError);
    notFound();
  }

  // 3. Fetch company with billing address and VAT
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('company_id, company_name, billing_address_line_1, billing_address_line_2, billing_city, billing_state_province, billing_postal_code, billing_country, vat_number')
    .eq('company_id', quote.company_id)
    .single();

  if (companyError || !company) {
    console.error('[AdminPreview] Company not found:', quote.company_id);
    notFound();
  }

  // 4. Fetch default shipping address
  const { data: shippingAddress } = await supabase
    .from('shipping_addresses')
    .select('address_id, address_line_1, address_line_2, city, state_province, postal_code, country, is_default')
    .eq('company_id', quote.company_id)
    .eq('is_default', true)
    .single();

  // 5. Fetch contact (if available)
  let contact = null;
  if (quote.contact_id) {
    const { data: contactData } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email, company_id')
      .eq('contact_id', quote.contact_id)
      .single();

    // Verify contact belongs to company
    if (contactData && contactData.company_id === company.company_id) {
      contact = contactData;
    }
  }

  // 6. Render correct portal component based on quote_type with readOnly=true
  const portalProps = {
    quote,
    lineItems,
    company,
    contact,
    token: 'admin-preview', // Placeholder token for admin preview
    isTest: false,
    readOnly: true,
    previewMode: 'admin' as const,
    shippingAddress: shippingAddress || null,
  };

  // Load StaticQuotePortal for static quotes, InteractiveQuotePortal for interactive
  if (quote.quote_type === 'static') {
    return <StaticQuotePortal {...portalProps} />;
  } else {
    return <InteractiveQuotePortal {...portalProps} />;
  }
}

export async function generateMetadata({ params }: AdminQuotePreviewProps) {
  const { quote_id } = await params;

  const supabase = getSupabaseClient();
  const { data: quote } = await supabase
    .from('quotes')
    .select('company_id')
    .eq('quote_id', quote_id)
    .single();

  if (!quote) {
    return { title: 'Quote Not Found' };
  }

  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('company_id', quote.company_id)
    .single();

  return {
    title: `Preview: Quote for ${company?.company_name || 'Unknown'} - Admin`,
    description: 'Admin preview of customer-facing quote',
  };
}
