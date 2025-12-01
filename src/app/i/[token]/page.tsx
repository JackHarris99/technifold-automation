/**
 * Invoice Viewer Route
 * /i/[token] - HMAC-signed token for viewing invoices
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

interface InvoiceViewerProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvoiceViewerPage({ params }: InvoiceViewerProps) {
  const { token } = await params;

  // 1. Verify HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-8">
            This invoice link is no longer valid.
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

  const { company_id, contact_id } = payload;
  const supabase = getSupabaseClient();

  // 2. Fetch company
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name, address_line1, address_line2, city, county, postcode, country')
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

  // 4. Fetch invoices (recent completed orders)
  const { data: invoices } = await supabase
    .from('orders')
    .select('order_id, total_amount, subtotal, tax_amount, shipping_amount, currency, payment_status, created_at')
    .eq('company_id', company_id)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(10);

  // 5. Track page view
  if (contact) {
    supabase
      .from('engagement_events')
      .insert({
        contact_id: contact.contact_id,
        company_id: company.company_id,
        event_type: 'invoice_view',
        event_name: 'invoice_page_view',
        source: 'vercel',
        url: `/i/${token}`,
        meta: {
          contact_name: contact.full_name,
          company_name: company.company_name,
          invoices_shown: invoices?.length || 0
        }
      })
      .then(() => console.log(`[Invoice] Tracked view by ${contact.full_name}`))
      .catch(err => console.error('[Invoice] Tracking failed:', err));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
              <p className="text-gray-600">{company.company_name}</p>
              {contact && <p className="text-gray-500 text-sm">{contact.full_name}</p>}
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="font-semibold text-gray-900">Technifold Ltd</div>
              <div>World-Leading Print Finishing</div>
            </div>
          </div>

          {/* Company Address */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
            <div className="text-sm text-gray-600">
              <div>{company.company_name}</div>
              {company.address_line1 && <div>{company.address_line1}</div>}
              {company.address_line2 && <div>{company.address_line2}</div>}
              {company.city && <div>{company.city}</div>}
              {company.county && <div>{company.county}</div>}
              {company.postcode && <div>{company.postcode}</div>}
              {company.country && <div>{company.country}</div>}
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
          </div>

          {!invoices || invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No invoices found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <div key={invoice.order_id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        Invoice #{invoice.order_id.substring(0, 12).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(invoice.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-lg">
                        {invoice.currency} {invoice.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="border-t border-gray-100 pt-3 mt-3 text-sm">
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Subtotal:</span>
                      <span>{invoice.currency} {(invoice.subtotal || 0).toFixed(2)}</span>
                    </div>
                    {invoice.shipping_amount > 0 && (
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span>Shipping:</span>
                        <span>{invoice.currency} {invoice.shipping_amount.toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span>Tax:</span>
                        <span>{invoice.currency} {invoice.tax_amount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Questions about an invoice? <a href="/contact" className="text-blue-600 hover:text-blue-700">Contact us</a></p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: InvoiceViewerProps) {
  const { token } = await params;
  const payload = verifyToken(token);

  if (!payload) {
    return { title: 'Invalid Link' };
  }

  const supabase = getSupabaseClient();
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('company_id', payload.company_id)
    .single();

  return {
    title: `Invoices - ${company?.company_name || 'Your Company'} - Technifold`,
    description: 'View your Technifold invoices',
  };
}
