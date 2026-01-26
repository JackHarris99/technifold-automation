/**
 * Distributor System Dashboard
 * Overview of distributor operations, orders, pricing, and performance
 * Split between Direct Distributors (buy & resell) and Partner Network (commission-based)
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorDashboardTabs from '@/components/admin/distributors/DistributorDashboardTabs';

export default async function DistributorDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // === DIRECT DISTRIBUTORS METRICS ===
  const [
    directDistributorsResult,
    pendingOrdersResult,
    totalOrdersResult,
    revenueResult,
  ] = await Promise.all([
    // Total DIRECT distributor companies
    supabase
      .from('companies')
      .select('company_id', { count: 'exact', head: true })
      .eq('type', 'distributor')
      .eq('distributor_type', 'direct'),

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

  const totalDirectDistributors = directDistributorsResult.count || 0;
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

  // === PARTNER NETWORK METRICS ===
  const [
    partnerDistributorsResult,
    partnerCustomersResult,
    pendingCommissionsResult,
    commissionsThisMonthResult,
  ] = await Promise.all([
    // Total PARTNER distributor companies
    supabase
      .from('companies')
      .select('company_id', { count: 'exact', head: true })
      .eq('type', 'distributor')
      .eq('distributor_type', 'partner'),

    // Total partner customers
    supabase
      .from('distributor_customers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),

    // Pending commissions (unpaid)
    supabase
      .from('distributor_commissions')
      .select('distributor_commission_amount')
      .eq('distributor_payment_status', 'pending'),

    // Total commissions this month
    supabase
      .from('distributor_commissions')
      .select('distributor_commission_amount')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const totalPartners = partnerDistributorsResult.count || 0;
  const totalPartnerCustomers = partnerCustomersResult.count || 0;
  const pendingCommissions = (pendingCommissionsResult.data || []).reduce(
    (sum, comm) => sum + (comm.distributor_commission_amount || 0),
    0
  );
  const totalCommissionsThisMonth = (commissionsThisMonthResult.data || []).reduce(
    (sum, comm) => sum + (comm.distributor_commission_amount || 0),
    0
  );

  // Prepare metrics for tabs component
  const directMetrics = {
    totalDistributors: totalDirectDistributors,
    pendingOrders,
    totalOrdersThisMonth,
    revenueThisMonth,
    recentPendingOrders: recentPendingOrders || [],
    topDistributors: topDistributors || [],
  };

  const partnerMetrics = {
    totalPartners,
    totalCustomers: totalPartnerCustomers,
    pendingCommissions,
    totalCommissionsThisMonth,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distributor Dashboard</h1>
              <p className="text-sm text-gray-800 mt-1">
                Direct Distributors (buy & resell) and Partner Network (commission-based)
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/distributors"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Distributor Users
              </Link>
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

      {/* Tabbed Interface */}
      <DistributorDashboardTabs
        directMetrics={directMetrics}
        partnerMetrics={partnerMetrics}
      />
    </div>
  );
}
