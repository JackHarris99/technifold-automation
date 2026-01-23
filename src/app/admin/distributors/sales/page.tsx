/**
 * Distributor Sales Report
 * Sales analytics and performance tracking for distributor orders
 */

import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface DistributorMetrics {
  total_revenue: number;
  orders_count: number;
  distributors_count: number;
  avg_order_value: number;
  unpaid_invoices_count: number;
  unpaid_invoices_total: number;
}

interface DistributorOrder {
  invoice_id: string;
  company_id: string;
  company_name: string;
  total_amount: number;
  invoice_date: string;
  invoice_url: string | null;
  payment_status: string;
}

interface TopDistributor {
  company_id: string;
  company_name: string;
  total_orders: number;
  total_revenue: number;
  last_order_date: string;
}

export default async function DistributorSalesPage() {
  const director = await isDirector();

  if (!director) {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Get ONLY distributor companies
  const { data: distributorCompanies } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('type', 'distributor')
    .order('company_name');

  const distributorIds = (distributorCompanies || []).map(d => d.company_id);
  const companyMap = new Map((distributorCompanies || []).map(c => [c.company_id, c.company_name]));

  let metrics: DistributorMetrics = {
    total_revenue: 0,
    orders_count: 0,
    distributors_count: distributorCompanies?.length || 0,
    avg_order_value: 0,
    unpaid_invoices_count: 0,
    unpaid_invoices_total: 0,
  };

  let recentOrders: DistributorOrder[] = [];
  let topDistributors: TopDistributor[] = [];

  if (distributorIds.length > 0) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = firstDayOfMonth.toISOString();

    // Fetch paid distributor invoices THIS MONTH ONLY
    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('subtotal, total_amount')
      .in('company_id', distributorIds)
      .eq('payment_status', 'paid')
      .gte('invoice_date', monthStart);

    // Fetch unpaid distributor invoices
    const { data: unpaidInvoices } = await supabase
      .from('invoices')
      .select('invoice_id, company_id, total_amount, invoice_date, invoice_url, payment_status')
      .in('company_id', distributorIds)
      .eq('payment_status', 'unpaid')
      .order('invoice_date', { ascending: true })
      .limit(20);

    // Fetch recent distributor orders
    const { data: recentOrdersData } = await supabase
      .from('invoices')
      .select('invoice_id, company_id, total_amount, invoice_date, invoice_url, payment_status')
      .in('company_id', distributorIds)
      .order('invoice_date', { ascending: false })
      .limit(20);

    // Calculate metrics
    if (paidInvoices && paidInvoices.length > 0) {
      metrics.total_revenue = paidInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
      metrics.orders_count = paidInvoices.length;
      metrics.avg_order_value = metrics.total_revenue / metrics.orders_count;
    }

    if (unpaidInvoices) {
      metrics.unpaid_invoices_count = unpaidInvoices.length;
      metrics.unpaid_invoices_total = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    }

    // Process recent orders
    recentOrders = (recentOrdersData || []).map(inv => ({
      invoice_id: inv.invoice_id,
      company_id: inv.company_id,
      company_name: companyMap.get(inv.company_id) || 'Unknown Distributor',
      total_amount: inv.total_amount,
      invoice_date: inv.invoice_date,
      invoice_url: inv.invoice_url,
      payment_status: inv.payment_status,
    }));

    // Calculate top distributors (all time)
    const { data: allDistributorInvoices } = await supabase
      .from('invoices')
      .select('company_id, subtotal, total_amount, invoice_date, payment_status')
      .in('company_id', distributorIds)
      .eq('payment_status', 'paid');

    // Group by company and calculate totals
    const distributorStats = new Map<string, { total_orders: number; total_revenue: number; last_order_date: string }>();

    (allDistributorInvoices || []).forEach(inv => {
      const existing = distributorStats.get(inv.company_id) || {
        total_orders: 0,
        total_revenue: 0,
        last_order_date: inv.invoice_date,
      };

      distributorStats.set(inv.company_id, {
        total_orders: existing.total_orders + 1,
        total_revenue: existing.total_revenue + (inv.subtotal || 0),
        last_order_date: inv.invoice_date > existing.last_order_date ? inv.invoice_date : existing.last_order_date,
      });
    });

    // Convert to array and sort by revenue
    topDistributors = Array.from(distributorStats.entries())
      .map(([company_id, stats]) => ({
        company_id,
        company_name: companyMap.get(company_id) || 'Unknown Distributor',
        total_orders: stats.total_orders,
        total_revenue: stats.total_revenue,
        last_order_date: stats.last_order_date,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distributor Sales Report</h1>
              <p className="text-sm text-gray-800 mt-1">
                Sales analytics and performance tracking for distributor orders
              </p>
            </div>
            <Link
              href="/admin/distributors/dashboard"
              className="text-teal-600 hover:text-teal-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Revenue (This Month)"
            value={`£${metrics.total_revenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            color="teal"
          />
          <MetricCard
            label="Orders (This Month)"
            value={metrics.orders_count.toString()}
            color="blue"
          />
          <MetricCard
            label="Avg Order Value"
            value={metrics.avg_order_value > 0 ? `£${metrics.avg_order_value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '£0'}
            color="green"
          />
          <MetricCard
            label="Active Distributors"
            value={metrics.distributors_count.toString()}
            color="gray"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 bg-teal-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Recent Distributor Orders</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                  {recentOrders.length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-700">No distributor orders yet</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.invoice_id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/admin/company/${order.company_id}`}
                          className="font-semibold text-gray-900 hover:text-teal-600"
                        >
                          {order.company_name}
                        </Link>
                        <p className="text-sm text-gray-700 mt-1">
                          {new Date(order.invoice_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          £{order.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : order.payment_status === 'unpaid'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {order.payment_status}
                          </span>
                          {order.invoice_url && (
                            <a
                              href={order.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-teal-600 hover:text-teal-800"
                            >
                              View →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Distributors */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 bg-green-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Top Distributors (All Time)</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  {topDistributors.length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {topDistributors.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-700">No distributor sales yet</p>
                </div>
              ) : (
                topDistributors.map((dist, index) => (
                  <div key={dist.company_id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/admin/company/${dist.company_id}`}
                            className="font-semibold text-gray-900 hover:text-teal-600"
                          >
                            {dist.company_name}
                          </Link>
                          <p className="text-sm text-gray-700 mt-1">
                            {dist.total_orders} order{dist.total_orders !== 1 ? 's' : ''} • Last: {new Date(dist.last_order_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          £{dist.total_revenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Unpaid Invoices Section */}
        {metrics.unpaid_invoices_count > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-orange-300">
            <div className="px-5 py-4 border-b border-orange-200 bg-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">Unpaid Distributor Invoices</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                    {metrics.unpaid_invoices_count}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  £{metrics.unpaid_invoices_total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="p-4 text-center text-gray-700">
              <Link
                href="/admin/sales/unpaid-invoices"
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                View Unpaid Invoices →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'teal' | 'blue' | 'green' | 'gray';
}) {
  const colorClasses = {
    teal: 'border-l-teal-500',
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    gray: 'border-l-gray-400',
  };

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${colorClasses[color]} rounded-lg p-4`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-800">{label}</div>
    </div>
  );
}
