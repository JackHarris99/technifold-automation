/**
 * Quote Viewer Route
 * /q/[token] - HMAC-signed token containing quote_id + company_id + contact_id
 * Fetches quote from database and displays in PortalPage-style UI
 */

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, getCompanyQueryField } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { StaticQuotePortal } from '@/components/quotes/StaticQuotePortal';
import { InteractiveQuotePortal } from '@/components/quotes/InteractiveQuotePortal';
import { TechnicreaseQuotePortal } from '@/components/quotes/TechnicreaseQuotePortal';
import { notifyQuoteViewed } from '@/lib/salesNotifications';

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
          <p className="text-gray-800 mb-8">
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

  // 4. Fetch company with billing address and VAT (with backward compatibility for old TEXT company_id values)
  const companyQuery = getCompanyQueryField(company_id);
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('company_id, company_name, billing_address_line_1, billing_address_line_2, billing_city, billing_state_province, billing_postal_code, billing_country, vat_number')
    .eq(companyQuery.column, companyQuery.value)
    .single();

  if (companyError || !company) {
    console.error('[Quote] Company not found:', company_id);
    notFound();
  }

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

  // 6. Check if quote has already been accepted
  if (quote.accepted_at && quote.invoice_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Already Accepted</h1>
            <p className="text-gray-800 mb-2">
              This quote was accepted on {new Date(quote.accepted_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}.
            </p>
            <p className="text-gray-800 mb-8">
              Your invoice has been sent. If you need assistance or have questions, please contact us.
            </p>
          </div>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  // 7. Check if current user is an authenticated admin (do this BEFORE updating viewed_at)
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('current_user');
  let isInternalView = false;
  let internalUser = null;

  if (userCookie) {
    try {
      const session = JSON.parse(userCookie.value);
      if (session.user_id && session.email) {
        isInternalView = true;
        internalUser = session.email;
        console.log('[Quote] Internal view detected:', session.email);
      }
    } catch (e) {
      // Invalid cookie, treat as customer view
    }
  }

  // 8. Update quote viewed_at timestamp on first view (ONLY for customer views, NOT internal)
  if (!quote.viewed_at && !isInternalView) {
    console.log('[Quote] Updating viewed_at for customer view');
    await supabase
      .from('quotes')
      .update({ status: 'viewed', viewed_at: new Date().toISOString() })
      .eq('quote_id', quote_id);

    // Notify sales rep that quote was viewed
    if (quote.created_by) {
      // Fetch user details for notification
      const { data: user } = await supabase
        .from('users')
        .select('user_id, email, full_name')
        .eq('sales_rep_id', quote.created_by)
        .single();

      if (user) {
        // Fire-and-forget notification (don't block page render)
        notifyQuoteViewed({
          user_id: user.user_id,
          user_email: user.email,
          user_name: user.full_name || user.email,
          quote_id: quote.quote_id,
          company_id: company.company_id,
          company_name: company.company_name,
          contact_name: contact?.full_name,
          total_amount: quote.total_amount || 0,
        }).catch(err => console.error('[Quote] Notification failed:', err));
      }
    }
  } else if (isInternalView) {
    console.log('[Quote] Skipping viewed_at update for internal view');
  }

  // 9. Track quote view engagement event
  if (contact) {

    // Log engagement event with internal_view flag
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
          total_amount: quote.total_amount,
          internal_view: isInternalView,
          internal_user: internalUser
        }
      })
      .then(() => {
        if (isInternalView) {
          console.log(`[Quote] Internal view by ${internalUser} (not counted as customer engagement)`);
        } else {
          console.log(`[Quote] Customer view tracked: ${contact.full_name}`);
        }
      })
      .catch(err => console.error('[Quote] Tracking failed:', err));
  }

  // 8. Render correct portal component based on quote_type and product_type
  const portalProps = {
    quote,
    lineItems,
    company,
    contact,
    token,
    isTest: is_test || false,
    readOnly: isInternalView, // Read-only mode for admin previews
    previewMode: isInternalView ? ('admin' as const) : undefined,
  };

  // Check if this is a TechniCrease quote
  const isTechnicreaseQuote = lineItems.some(item => item.product_type === 'technicrease');

  if (isTechnicreaseQuote) {
    // Use TechniCrease-specific portal (no quantity changes, hierarchical display)
    return <TechnicreaseQuotePortal {...portalProps} />;
  } else if (quote.quote_type === 'static') {
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
  const companyQuery = getCompanyQueryField(payload.company_id);
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq(companyQuery.column, companyQuery.value)
    .single();

  return {
    title: `Quote for ${company?.company_name || 'Your Company'} - Technifold`,
    description: 'View your custom quote from Technifold',
  };
}
