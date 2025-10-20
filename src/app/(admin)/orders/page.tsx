/**
 * Orders List Page - Admin Control Plane
 * View all orders with filtering and sorting
 */

import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface Order {
  order_id: string;
  company_id: string;
  created_at: string;
  amount_total: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
  zoho_invoice_id: string | null;
  companies?: {
    company_name: string;
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; company?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || 'all';
  const companyFilter = params.company || '';

  const supabase = getSupabaseClient();

  // Fetch orders with company names
  let dbQuery = supabase
    .from('orders')
    .select('order_id, company_id, created_at, amount_total, currency, status, stripe_payment_intent_id, zoho_invoice_id, companies(company_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (statusFilter !== 'all') {
    dbQuery = dbQuery.eq('status', statusFilter);
  }

  if (companyFilter) {
    dbQuery = dbQuery.eq('company_id', companyFilter);
  }

  const { data: orders, error } = await dbQuery;

  if (error) {
    console.error('[orders-page] Error fetching orders:', error);
  }

  const enrichedOrders: Order[] = (orders || []) as Order[];

  // Calculate totals
  const totalAmount = enrichedOrders.reduce((sum, order) => sum + order.amount_total, 0);
  const completedCount = enrichedOrders.filter(o => o.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-sm text-gray-700">
          View and manage all customer orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{enrichedOrders.length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{completedCount}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              £{(totalAmount / 100).toFixed(2)}
            </dd>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          name="status"
          defaultValue={statusFilter}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value === 'all') {
              url.searchParams.delete('status');
            } else {
              url.searchParams.set('status', e.target.value);
            }
            window.location.href = url.toString();
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stripe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zoho
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enrichedOrders.map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/companies/${order.company_id}`}
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    {order.companies?.company_name || order.company_id}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()} at{' '}
                  {new Date(order.created_at).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.currency.toUpperCase()} {(order.amount_total / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.stripe_payment_intent_id ? (
                    <a
                      href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View →
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.zoho_invoice_id ? (
                    <a
                      href={`https://books.zoho.com/app#/invoices/${order.zoho_invoice_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View →
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/companies/${order.company_id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Company →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {enrichedOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {enrichedOrders.length} orders
      </div>
    </div>
  );
}
