/**
 * Pending Distributor Orders
 * Review and approve/reject pending distributor orders
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorPendingOrdersClient from '@/components/admin/distributors/DistributorPendingOrdersClient';

export default async function PendingDistributorOrdersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch pending distributor orders
  const { data: orders } = await supabase
    .from('distributor_orders')
    .select(`
      order_id,
      po_number,
      created_at,
      total_amount,
      currency,
      notes,
      companies!distributor_orders_company_id_fkey (
        company_id,
        company_name,
        sage_customer_code,
        distributor_email
      )
    `)
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false });

  // Fetch order items for each order
  const orderIds = orders?.map(o => o.order_id) || [];
  const { data: orderItems } = orderIds.length > 0
    ? await supabase
        .from('distributor_order_items')
        .select(`
          order_id,
          product_code,
          quantity,
          unit_price
        `)
        .in('order_id', orderIds)
    : { data: [] };

  // Group items by order_id
  const itemsByOrder = (orderItems || []).reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }
    acc[item.order_id].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Attach items to orders
  const ordersWithItems = (orders || []).map(order => ({
    ...order,
    items: itemsByOrder[order.order_id] || [],
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Orders</h1>
              <p className="text-sm text-gray-800 mt-1">
                Review and approve distributor orders awaiting approval
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/distributors/orders"
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                View All Orders
              </Link>
              <Link
                href="/admin/distributors/dashboard"
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Box */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-orange-900 mb-2">Approval Required</h3>
          <p className="text-sm text-orange-800">
            These orders are awaiting your approval. Review each order carefully before approving or rejecting.
            Once approved, orders will be ready for fulfillment.
          </p>
        </div>

        <DistributorPendingOrdersClient orders={ordersWithItems} currentUserId={currentUser.user_id} />
      </div>
    </div>
  );
}
