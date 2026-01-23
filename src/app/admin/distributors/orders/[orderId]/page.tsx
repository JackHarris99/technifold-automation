/**
 * Distributor Order Detail
 * View full details of a distributor order
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorOrderDetailClient from '@/components/admin/distributors/DistributorOrderDetailClient';

export default async function DistributorOrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch order details
  const { data: order } = await supabase
    .from('distributor_orders')
    .select(
      `
      order_id,
      po_number,
      created_at,
      status,
      total_amount,
      currency,
      notes,
      approved_at,
      approved_by,
      rejected_at,
      rejected_by,
      rejection_reason,
      companies!distributor_orders_company_id_fkey (
        company_id,
        company_name,
        sage_customer_code,
        distributor_email,
        phone,
        billing_address,
        billing_city,
        billing_postcode,
        billing_country
      ),
      approved_by_user:users!distributor_orders_approved_by_fkey (
        full_name,
        email
      ),
      rejected_by_user:users!distributor_orders_rejected_by_fkey (
        full_name,
        email
      )
    `
    )
    .eq('order_id', params.orderId)
    .single();

  if (!order) {
    redirect('/admin/distributors/orders');
  }

  // Fetch order items
  const { data: orderItems } = await supabase
    .from('distributor_order_items')
    .select('product_code, quantity, unit_price')
    .eq('order_id', params.orderId)
    .order('product_code');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-800 mt-1">
                View complete order information and history
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/distributors/orders"
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                ← Back to All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <DistributorOrderDetailClient
          order={order}
          orderItems={orderItems || []}
          currentUserId={currentUser.user_id}
        />
      </div>
    </div>
  );
}
