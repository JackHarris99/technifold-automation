/**
 * Quote Viewer Route
 * /q/[token] - HMAC-signed token containing quote_id + company_id + contact_id
 * Fetches quote from database and displays in PortalPage-style UI
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { StaticQuotePortal } from '@/components/quotes/StaticQuotePortal';
import { InteractiveQuotePortal } from '@/components/quotes/InteractiveQuotePortal';

interface QuoteViewerProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function QuoteViewerPage({ params }: QuoteViewerProps) {
  const { token } = await params;

  // 1. Verify and decode HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-8">
            This quote link is no longer valid. Please contact us for an updated quote.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  const { quote_id, company_id, contact_id, is_test } = payload;

  if (!quote_id) {
    console.error('[Quote] Token missing quote_id');
    notFound();
  }

  const supabase = getSupabaseClient();

  // 2. Fetch quote from database
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*')
    .eq('quote_id', quote_id)
    .single();

  if (quoteError || !quote) {
    console.error('[Quote] Quote not found:', quote_id, quoteError);
    notFound();
  }

  // 3. Fetch quote line items
  const { data: lineItems, error: itemsError } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quote_id)
    .order('line_number', { ascending: true });

  if (itemsError || !lineItems) {
    console.error('[Quote] Line items error:', itemsError);
    notFound();
  }

  // 4. Fetch company with billing address and VAT
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('company_id, company_name, billing_address_line_1, billing_address_line_2, billing_city, billing_state_province, billing_postal_code, billing_country, vat_number')
    .eq('company_id', company_id)
    .single();

  if (companyError || !company) {
    console.error('[Quote] Company not found:', company_id);
    notFound();
  }

  // 4b. Fetch default shipping address
  const { data: shippingAddress } = await supabase
    .from('shipping_addresses')
    .select('address_id, address_line_1, address_line_2, city, state_province, postal_code, country, is_default')
    .eq('company_id', company_id)
    .eq('is_default', true)
    .single();

  // 5. Fetch contact
  let contact = null;
  if (contact_id) {
    const { data: contactData } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email, company_id')
      .eq('contact_id', contact_id)
      .single();

    // Verify contact belongs to company
    if (contactData && contactData.company_id === company.company_id) {
      contact = contactData;
    }
  }

  // 6. Update quote viewed_at timestamp on first view
  if (!quote.viewed_at) {
    await supabase
      .from('quotes')
      .update({ status: 'viewed', viewed_at: new Date().toISOString() })
      .eq('quote_id', quote_id);
  }

  // 7. Track quote view engagement event
  if (contact) {
    supabase
      .from('engagement_events')
      .insert({
        contact_id: contact.contact_id,
        company_id: company.company_id,
        event_type: 'quote_view',
        event_name: 'quote_portal_view',
        source: 'vercel',
        url: `/q/${token}`,
        meta: {
          quote_id,
          contact_name: contact.full_name,
          company_name: company.company_name,
          item_count: lineItems.length,
          quote_type: quote.quote_type,
          total_amount: quote.total_amount
        }
      })
      .then(() => console.log(`[Quote] Tracked view by ${contact.full_name}`))
      .catch(err => console.error('[Quote] Tracking failed:', err));
  }

  // 8. Render correct portal component based on quote_type
  const portalProps = {
    quote,
    lineItems,
    company,
    contact,
    token,
    isTest: is_test || false,
    shippingAddress: shippingAddress || null,
  };

  // Load StaticQuotePortal for static quotes, InteractiveQuotePortal for interactive
  if (quote.quote_type === 'static') {
    return <StaticQuotePortal {...portalProps} />;
  } else {
    return <InteractiveQuotePortal {...portalProps} />;
  }
}

export async function generateMetadata({ params }: QuoteViewerProps) {
  const { token } = await params;
  const payload = verifyToken(token);

  if (!payload) {
    return { title: 'Invalid Quote' };
  }

  const supabase = getSupabaseClient();
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('company_id', payload.company_id)
    .single();

  return {
    title: `Quote for ${company?.company_name || 'Your Company'} - Technifold`,
    description: 'View your custom quote from Technifold',
  };
}
