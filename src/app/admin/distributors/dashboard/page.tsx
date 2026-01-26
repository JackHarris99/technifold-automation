/**
 * Distributor System Dashboard
 * Overview of distributor operations, orders, pricing, and performance
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DistributorDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch key metrics
  const [
    distributorsResult,
    pendingOrdersResult,
    totalOrdersResult,
    revenueResult,
  ] = await Promise.all([
    // Total distributor companies
    supabase
      .from('companies')
      .select('company_id', { count: 'exact', head: true })
      .eq('type', 'distributor'),

    // Pending orders (awaiting approval)
    supabase
      .from('distributor_orders')
      .select('order_id', { count: 'exact', head: true })
      .eq('status', 'pending_review'),

    // Total orders this month
    supabase
      .from('distributor_orders')
      .select('order_id', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

    // Total revenue this month
    supabase
      .from('distributor_orders')
      .select('total_amount')
      .eq('status', 'fully_fulfilled')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const totalDistributors = distributorsResult.count || 0;
  const pendingOrders = pendingOrdersResult.count || 0;
  const totalOrdersThisMonth = totalOrdersResult.count || 0;
  const revenueThisMonth = (revenueResult.data || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Fetch recent pending orders
  const { data: recentPendingOrders } = await supabase
    .from('distributor_orders')
    .select(`
      order_id,
      created_at,
      total_amount,
      currency,
      companies!distributor_orders_company_id_fkey (
        company_id,
        company_name
      )
    `)
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch top distributors by sales this month
  const { data: topDistributors } = await supabase
    .from('distributor_orders')
    .select(`
      company_id,
      total_amount,
      companies!distributor_orders_company_id_fkey (
        company_id,
        company_name
      )
    `)
    .eq('status', 'fully_fulfilled')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    .order('total_amount', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distributor Dashboard</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage distributors, orders, pricing, and commissions
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/distributors/orders/pending"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Review Pending Orders ({pendingOrders})
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Distributors */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-700 truncate">Total Distributors</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalDistributors}</dd>
              <div className="mt-2">
                <Link href="/admin/distributors/companies" className="text-sm text-teal-600 hover:text-teal-800">
                  View all →
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-700 truncate">Pending Orders</dt>
              <dd className="mt-1 text-3xl font-semibold text-orange-600">{pendingOrders}</dd>
              <div className="mt-2">
                <Link href="/admin/distributors/orders/pending" className="text-sm text-teal-600 hover:text-teal-800">
                  Review now →
                </Link>
              </div>
            </div>
          </div>

          {/* Orders This Month */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-700 truncate">Orders This Month</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalOrdersThisMonth}</dd>
              <div className="mt-2">
                <Link href="/admin/distributors/orders" className="text-sm text-teal-600 hover:text-teal-800">
                  View all →
                </Link>
              </div>
            </div>
          </div>

          {/* Revenue This Month */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-700 truncate">Revenue This Month</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                £{revenueThisMonth.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </dd>
              <div className="mt-2">
                <Link href="/admin/distributors/sales" className="text-sm text-teal-600 hover:text-teal-800">
                  View report →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Pending Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Pending Orders</h2>
              <p className="text-sm text-gray-800">Orders awaiting your approval</p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentPendingOrders && recentPendingOrders.length > 0 ? (
                recentPendingOrders.map((order: any) => (
                  <div key={order.order_id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.companies?.company_name || 'Unknown Distributor'}
                        </p>
                        <p className="text-xs text-gray-700">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          £{order.total_amount.toFixed(2)}
                        </p>
                        <Link
                          href={`/admin/distributors/orders/${order.order_id}`}
                          className="text-xs text-teal-600 hover:text-teal-800"
                        >
                          Review →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-700">
                  No pending orders
                </div>
              )}
            </div>
            {recentPendingOrders && recentPendingOrders.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Link
                  href="/admin/distributors/orders/pending"
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  View all pending orders →
                </Link>
              </div>
            )}
          </div>

          {/* Top Distributors This Month */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Distributors This Month</h2>
              <p className="text-sm text-gray-800">Highest sales volume</p>
            </div>
            <div className="divide-y divide-gray-200">
              {topDistributors && topDistributors.length > 0 ? (
                topDistributors.map((dist: any, index: number) => (
                  <div key={dist.company_id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {dist.companies?.company_name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          £{dist.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-700">
                  No sales this month
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/distributors/companies"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
            >
              <div className="text-2xl">🏢</div>
              <div>
                <p className="font-medium text-gray-900">Manage Distributors</p>
                <p className="text-xs text-gray-700">View and edit distributor companies</p>
              </div>
            </Link>
            <Link
              href="/admin/distributors/pricing"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
            >
              <div className="text-2xl">💰</div>
              <div>
                <p className="font-medium text-gray-900">Set Pricing</p>
                <p className="text-xs text-gray-700">Manage standard distributor pricing</p>
              </div>
            </Link>
            <Link
              href="/admin/distributors/custom-pricing"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
            >
              <div className="text-2xl">🎯</div>
              <div>
                <p className="font-medium text-gray-900">Custom Pricing</p>
                <p className="text-xs text-gray-700">Set per-distributor pricing</p>
              </div>
            </Link>
            <Link
              href="/admin/distributors/sales"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
            >
              <div className="text-2xl">📈</div>
              <div>
                <p className="font-medium text-gray-900">Sales Report</p>
                <p className="text-xs text-gray-700">View sales performance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
