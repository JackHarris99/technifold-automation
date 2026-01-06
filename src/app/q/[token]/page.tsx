/**
 * Quote Viewer Route
 * /q/[token] - HMAC-signed token for viewing custom quotes
 * Supports both new interactive quotes (with quote_items) and legacy quotes (with products)
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import InteractiveQuoteViewer from '@/components/InteractiveQuoteViewer';
import StaticToolQuoteViewer from '@/components/StaticToolQuoteViewer';

interface QuoteViewerProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function QuoteViewerPage({ params }: QuoteViewerProps) {
  const { token } = await params;

  // 1. Verify HMAC token
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

  const { company_id, contact_id, products = [], quote_items, pricing_mode, quote_type, is_test } = payload;
  const supabase = getSupabaseClient();

  // 2. Fetch company
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('company_id', company_id)
    .single();

  if (!company) {
    notFound();
  }

  // 3. Fetch contact
  let contact = null;
  if (contact_id) {
    const { data } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email')
      .eq('contact_id', contact_id)
      .single();
    contact = data;
  }

  // NEW: If this is a quote with line items, render appropriate viewer
  if (quote_items && Array.isArray(quote_items) && quote_items.length > 0) {
    // Track quote view
    if (contact) {
      supabase
        .from('engagement_events')
        .insert({
          contact_id: contact.contact_id,
          company_id: company.company_id,
          event_type: 'quote_view',
          event_name: quote_type === 'tool_static' ? 'static_tool_quote_view' : 'interactive_consumable_quote_view',
          source: 'vercel',
          url: `/q/${token}`,
          meta: {
            contact_name: contact.full_name,
            company_name: company.company_name,
            item_count: quote_items.length,
            quote_type: quote_type || 'unknown'
          }
        })
        .then(() => console.log(`[Quote] Tracked ${quote_type} view by ${contact.full_name}`))
        .catch(err => console.error('[Quote] Tracking failed:', err));
    }

    // Render static viewer for tool quotes, interactive for consumable quotes
    if (quote_type === 'tool_static') {
      return (
        <StaticToolQuoteViewer
          items={quote_items}
          companyName={company.company_name}
          companyId={company_id}
          contactName={contact?.full_name}
          token={token}
          isTest={is_test || false}
        />
      );
    }

    // Default to interactive viewer for consumables
    return (
      <InteractiveQuoteViewer
        initialItems={quote_items}
        pricingMode={pricing_mode || 'standard'}
        companyName={company.company_name}
        companyId={company_id}
        contactName={contact?.full_name}
        token={token}
        isTest={is_test || false}
      />
    );
  }

  // 4. Fetch products from payload
  const productCodes = Array.isArray(products) ? products : [];
  let quoteProducts: any[] = [];

  if (productCodes.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('product_code, description, price, rental_price_monthly, currency, type, category')
      .in('product_code', productCodes);

    quoteProducts = data || [];
  }

  // 5. Track quote view
  if (contact) {
    supabase
      .from('engagement_events')
      .insert({
        contact_id: contact.contact_id,
        company_id: company.company_id,
        event_type: 'quote_view',
        event_name: 'quote_page_view',
        source: 'vercel',
        url: `/q/${token}`,
        meta: {
          contact_name: contact.full_name,
          company_name: company.company_name,
          product_count: quoteProducts.length
        }
      })
      .then(() => console.log(`[Quote] Tracked view by ${contact.full_name}`))
      .catch(err => console.error('[Quote] Tracking failed:', err));
  }

  // 6. Calculate totals
  const subtotal = quoteProducts.reduce((sum, p) => sum + (p.rental_price_monthly || p.price || 0), 0);
  const currency = quoteProducts[0]?.currency || 'GBP';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote</h1>
              <p className="text-gray-600">For {company.company_name}</p>
              {contact && <p className="text-gray-500 text-sm">Attn: {contact.full_name}</p>}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Valid for 7 days</div>
              <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Products */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>

            {quoteProducts.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No products in this quote</p>
            ) : (
              <div className="space-y-4">
                {quoteProducts.map((product) => (
                  <div key={product.product_code} className="flex justify-between py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.description}</div>
                      <div className="text-sm text-gray-500">Code: {product.product_code}</div>
                      {product.type === 'tool' && product.rental_price_monthly && (
                        <div className="text-sm text-blue-600 font-medium mt-1">Monthly Rental</div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-gray-900">
                        {currency} {(product.rental_price_monthly || product.price || 0).toFixed(2)}
                        {product.rental_price_monthly && <span className="text-sm font-normal">/mo</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {quoteProducts.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{currency} {subtotal.toFixed(2)}{quoteProducts.some(p => p.rental_price_monthly) && '/mo'}</span>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          {quoteProducts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <a
                href="/contact"
                className="w-full block text-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Accept Quote & Start Order
              </a>
              <p className="text-center text-sm text-gray-500 mt-3">
                Or contact us to discuss further
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Tech-ni-Fold Ltd • World-Leading Print Finishing Solutions</p>
        </div>
      </div>
    </div>
  );
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
