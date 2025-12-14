/**
 * CRM Homepage - View-Only Audit System
 * Cross-territory company lookup and analytics
 */

import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function CRMPage() {
  const supabase = getSupabaseClient();

  // Fetch company stats
  const { count: totalCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });

  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: activeTrials } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'trial');

  // Fetch total revenue (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'paid')
    .gte('created_at', thirtyDaysAgo);

  const totalRevenue = recentOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  // Fetch recent orders
  const { data: latestOrders } = await supabase
    .from('orders')
    .select(`
      order_id,
      created_at,
      total_amount,
      payment_status,
      companies!inner(company_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch recent subscriptions
  const { data: recentSubscriptions } = await supabase
    .from('subscriptions')
    .select(`
      subscription_id,
      status,
      created_at,
      trial_end_date,
      companies!inner(company_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CRM - System of Record
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Cross-territory company lookup and complete audit history
              </p>
            </div>
            <Link
              href="/admin/companies"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium text-sm"
            >
              Search All Companies
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="Total Companies"
            value={totalCompanies?.toString() || '0'}
            icon="🏢"
            color="gray"
          />
          <MetricCard
            label="Active Subscriptions"
            value={activeSubscriptions?.toString() || '0'}
            icon="💳"
            color="green"
          />
          <MetricCard
            label="Active Trials"
            value={activeTrials?.toString() || '0'}
            icon="🚀"
            color="blue"
          />
          <MetricCard
            label="Revenue (30d)"
            value={`£${totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
            icon="💰"
            color="green"
          />
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            href="/admin/companies"
            icon="🏢"
            title="All Companies"
            description="Searchable directory of all companies (cross-territory)"
          />
          <ActionCard
            href="/admin/orders"
            icon="📦"
            title="All Orders"
            description="Complete order history across all companies"
          />
          <ActionCard
            href="/admin/subscriptions"
            icon="💳"
            title="All Subscriptions"
            description="View all subscriptions and trial status"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {!latestOrders || latestOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600">
                Orders will appear here once invoices are paid
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {latestOrders.map((order: any) => (
                <OrderRow key={order.order_id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Analytics & Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickLinkCard
            href="/admin/sales-history"
            icon="📈"
            title="Sales History"
            description="Revenue analytics and historical data"
          />
          <QuickLinkCard
            href="/admin/trials"
            icon="🚀"
            title="Trial Analytics"
            description="Trial conversion rates and metrics"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'gray' | 'green' | 'blue';
}) {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-lg p-6 transition-all"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

function OrderRow({ order }: { order: any }) {
  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            {order.companies?.company_name || 'Unknown Company'}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              £{order.total_amount?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                statusColors[order.payment_status as keyof typeof statusColors] || statusColors.unpaid
              }`}
            >
              {order.payment_status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-md transition-all"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
