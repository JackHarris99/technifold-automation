/**
 * Order Tracking Route
 * /o/[token] - HMAC-signed token for order tracking
 */

import { notFound } from 'next/navigation';
import { verifyToken, getCompanyQueryField } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

interface OrderTrackingProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function OrderTrackingPage({ params }: OrderTrackingProps) {
  const { token } = await params;

  // 1. Verify HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-800 mb-8">
            This order tracking link is no longer valid.
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

  // 2. Fetch company (with backward compatibility for old TEXT company_id values)
  const companyQuery = getCompanyQueryField(company_id);
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq(companyQuery.column, companyQuery.value)
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

  // 4. Fetch recent orders (using UUID company_id)
  const { data: orders } = await supabase
    .from('orders')
    .select('order_id, total_amount, currency, payment_status, fulfillment_status, created_at')
    .eq('company_id', company.company_id)
    .order('created_at', { ascending: false })
    .limit(10);

  // 5. Track page view
  if (contact) {
    supabase
      .from('engagement_events')
      .insert({
        contact_id: contact.contact_id,
        company_id: company.company_id,
        event_type: 'order_tracking_view',
        event_name: 'order_tracking_page_view',
        source: 'vercel',
        url: `/o/${token}`,
        meta: {
          contact_name: contact.full_name,
          company_name: company.company_name,
          orders_shown: orders?.length || 0
        }
      })
      .then(() => console.log(`[Order Tracking] Tracked view by ${contact.full_name}`))
      .catch(err => console.error('[Order Tracking] Tracking failed:', err));
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      shipped: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-800">{company.company_name}</p>
          {contact && <p className="text-gray-700 text-sm">{contact.full_name}</p>}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>

          {!orders || orders.length === 0 ? (
            <div className="p-8 text-center text-gray-700">
              No orders found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.order_id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          Order #{order.order_id.substring(0, 8)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.fulfillment_status || 'pending')}`}>
                          {order.fulfillment_status || 'Pending'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status || 'pending')}`}>
                          {order.payment_status || 'Pending'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {order.currency} {order.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Questions about your order? Contact us
          </a>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: OrderTrackingProps) {
  const { token } = await params;
  const payload = verifyToken(token);

  if (!payload) {
    return { title: 'Invalid Link' };
  }

  const supabase = getSupabaseClient();
  const companyQuery = getCompanyQueryField(payload.company_id);
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq(companyQuery.column, companyQuery.value)
    .single();

  return {
    title: `Order Tracking - ${company?.company_name || 'Your Orders'} - Technifold`,
    description: 'Track your Technifold orders',
  };
}
