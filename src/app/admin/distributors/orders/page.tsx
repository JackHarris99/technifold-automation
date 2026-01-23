/**
 * Distributor Orders
 * View and manage all distributor orders
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorOrdersClient from '@/components/admin/distributors/DistributorOrdersClient';

export default async function DistributorOrdersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch all distributor orders
  const { data: orders } = await supabase
    .from('distributor_orders')
    .select(`
      order_id,
      po_number,
      created_at,
      status,
      total_amount,
      currency,
      approved_at,
      approved_by,
      companies!distributor_orders_company_id_fkey (
        company_id,
        company_name,
        sage_customer_code
      ),
      users!distributor_orders_approved_by_fkey (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Distributor Orders</h1>
              <p className="text-sm text-gray-800 mt-1">
                View and manage all distributor orders across all statuses
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/distributors/orders/pending"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                Pending Orders
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
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-teal-900 mb-2">Order Status Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-teal-800">
            <div>
              <span className="font-medium">Pending:</span> Awaiting director approval
            </div>
            <div>
              <span className="font-medium">Approved:</span> Ready for fulfillment
            </div>
            <div>
              <span className="font-medium">Rejected:</span> Order declined
            </div>
          </div>
        </div>

        <DistributorOrdersClient orders={orders || []} />
      </div>
    </div>
  );
}
