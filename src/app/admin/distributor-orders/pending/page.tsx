/**
 * Distributor Orders - Pending Review
 * List all distributor orders awaiting admin review
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PendingDistributorOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch pending distributor orders
  const { data: orders, error } = await supabase
    .from('distributor_orders')
    .select(`
      order_id,
      company_id,
      user_email,
      user_name,
      status,
      subtotal,
      predicted_shipping,
      vat_amount,
      total_amount,
      created_at,
      companies (
        company_name
      )
    `)
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Pending Orders] Error fetching orders:', error);
  }

  const pendingOrders = orders || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-2">
            Distributor Orders - Pending Review
          </h1>
          <p className="text-[#666]">
            {pendingOrders.length} order{pendingOrders.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>

        {/* Orders Table */}
        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-12 text-center">
            <div className="text-[#999] text-lg">No pending orders</div>
            <p className="text-sm text-[#666] mt-2">All distributor orders have been reviewed</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-transparent border-b border-[#e8e8e8]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {pendingOrders.map((order: any) => (
                  <tr key={order.order_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-[#1e40af] text-sm">
                        {order.order_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0a0a0a] text-sm">
                        {order.companies?.company_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#0a0a0a]">{order.user_name}</div>
                      <div className="text-xs text-[#666] font-mono">{order.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#0a0a0a]">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-[#666]">
                        {new Date(order.created_at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-bold text-[#16a34a]">
                        £{order.total_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-[#666]">
                        (Shipping: £{order.predicted_shipping.toFixed(2)})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        href={`/admin/distributor-orders/${order.order_id}/review`}
                        className="inline-flex items-center px-4 py-2 bg-[#1e40af] text-white rounded-lg font-semibold text-sm hover:bg-[#1e3a8a] transition-colors"
                      >
                        Review Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
