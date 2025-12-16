/**
 * Sales Pipeline - Unified action center
 * Replaces: Dashboard, Leads, Orders, Rentals, Engagement
 * Shows: Revenue streams, commission, pipeline stages, action items
 */

import { getCurrentUser, isDirector } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PipelineTable from '@/components/admin/PipelineTable';

export const metadata = {
  title: 'Sales Pipeline | Technifold Admin',
  description: 'Your complete sales action center',
};

async function getPipelineData(salesRepId: string | null) {
  const supabase = getSupabaseClient();

  // Territory filter
  const territoryFilter = salesRepId ? { account_owner: salesRepId } : {};

  // Get this month's date range
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  // ========================================
  // 1. TOOL SALES (10% commission)
  // ========================================
  const { data: toolOrdersRaw } = await supabase
    .from('orders')
    .select(`
      order_id,
      total_amount,
      created_at,
      company_id,
      companies(company_name, account_owner),
      order_items(product_code, qty, products(type))
    `)
    .gte('created_at', monthStart)
    .eq('status', 'paid');

  // Filter by territory and product type = 'tool'
  const toolOrders = (toolOrdersRaw || [])
    .filter(order => {
      if (salesRepId && (order.companies as any)?.account_owner !== salesRepId) return false;
      // Check if any item is a tool
      return (order.order_items || []).some((item: any) => item.products?.type === 'tool');
    });

  const toolSalesRevenue = toolOrders.reduce((sum, o) => sum + parseFloat(o.total_amount as any), 0);
  const toolSalesCount = toolOrders.length;
  const toolCommission = toolSalesRevenue * 0.10; // 10%

  // ========================================
  // 2. CONSUMABLE SALES (1% commission)
  // ========================================
  const { data: consumableOrdersRaw } = await supabase
    .from('orders')
    .select(`
      order_id,
      total_amount,
      created_at,
      company_id,
      companies(company_name, account_owner),
      order_items(product_code, qty, products(type))
    `)
    .gte('created_at', monthStart)
    .eq('status', 'paid');

  // Filter by territory and product type = 'consumable'
  const consumableOrders = (consumableOrdersRaw || [])
    .filter(order => {
      if (salesRepId && (order.companies as any)?.account_owner !== salesRepId) return false;
      // Check if all items are consumables
      return (order.order_items || []).every((item: any) => item.products?.type === 'consumable');
    });

  const consumableSalesRevenue = consumableOrders.reduce((sum, o) => sum + parseFloat(o.total_amount as any), 0);
  const consumableSalesCount = consumableOrders.length;
  const consumableCommission = consumableSalesRevenue * 0.01; // 1%

  // ========================================
  // 3. TOOL RENTALS (10% of monthly recurring)
  // ========================================
  const { data: allRentals } = await supabase
    .from('rental_agreements')
    .select(`
      rental_id,
      monthly_price,
      status,
      company_id,
      companies(company_name, account_owner)
    `)
    .eq('status', 'active');

  // Filter by territory
  const rentals = salesRepId
    ? (allRentals || []).filter(r => (r.companies as any)?.account_owner === salesRepId)
    : (allRentals || []);

  const rentalMonthlyRevenue = rentals.reduce((sum, r) => sum + parseFloat(r.monthly_price as any), 0);
  const rentalCount = rentals.length;
  const rentalCommission = rentalMonthlyRevenue * 0.10; // 10%

  // ========================================
  // 4. QUOTE REQUESTS / PIPELINE DEALS
  // ========================================
  const { data: allQuoteRequests } = await supabase
    .from('quote_requests')
    .select(`
      *,
      companies(company_id, company_name, account_owner),
      contacts(contact_id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  // Filter by territory
  const quoteRequests = salesRepId
    ? (allQuoteRequests || []).filter(qr => (qr.companies as any)?.account_owner === salesRepId)
    : (allQuoteRequests || []);

  // Count by status
  const needsAction = quoteRequests.filter(qr => {
    if (qr.status === 'requested') {
      // Quote requested but not sent for >24h
      const hoursSinceRequest = (Date.now() - new Date(qr.created_at).getTime()) / (1000 * 60 * 60);
      return hoursSinceRequest > 24;
    }
    if (qr.status === 'quote_sent') {
      // Quote sent but no response for >3 days
      const daysSinceSent = (Date.now() - new Date(qr.updated_at || qr.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSent > 3;
    }
    if (qr.status === 'not_yet' && qr.contact_again_date) {
      // Time to contact again
      return new Date(qr.contact_again_date) <= new Date();
    }
    return false;
  }).length;

  const activeDeals = quoteRequests.filter(qr =>
    ['requested', 'quote_sent', 'not_yet'].includes(qr.status)
  ).length;

  // ========================================
  // 5. TODAY'S ENGAGEMENT
  // ========================================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayEvents } = await supabase
    .from('engagement_events')
    .select('event_id, event_name, company_id, companies(account_owner)')
    .gte('occurred_at', today.toISOString());

  const filteredEvents = salesRepId
    ? (todayEvents || []).filter(e => (e.companies as any)?.account_owner === salesRepId)
    : (todayEvents || []);

  const todayActivity = {
    emailOpens: filteredEvents.filter(e => e.event_name === 'email_opened').length,
    emailClicks: filteredEvents.filter(e => e.event_name === 'email_clicked').length,
    portalViews: filteredEvents.filter(e => e.event_name === 'portal_viewed').length,
    quoteRequests: filteredEvents.filter(e => e.event_name === 'quote_requested').length,
  };

  return {
    revenue: {
      toolSales: { revenue: toolSalesRevenue, count: toolSalesCount, commission: toolCommission },
      consumables: { revenue: consumableSalesRevenue, count: consumableSalesCount, commission: consumableCommission },
      rentals: { revenue: rentalMonthlyRevenue, count: rentalCount, commission: rentalCommission },
      totalCommission: toolCommission + consumableCommission + rentalCommission,
    },
    pipeline: {
      needsAction,
      activeDeals,
      quoteRequests,
    },
    todayActivity,
  };
}

export default async function SalesPipelinePage() {
  const user = await getCurrentUser();
  const director = await isDirector();

  if (!user) {
    redirect('/admin/login');
  }

  const salesRepId = director ? null : user.sales_rep_id;
  const data = await getPipelineData(salesRepId);

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
            <p className="mt-2 text-gray-600">
              {director ? 'Team Performance Overview' : 'Your Territory Performance'}
            </p>
          </div>
          <Link
            href="/admin/sales-history"
            className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold"
          >
            View Sales History →
          </Link>
        </div>

        {/* Revenue Dashboard - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tool Sales */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Tool Sales</div>
            <p className="text-4xl font-bold text-gray-900">£{data.revenue.toolSales.revenue.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">{data.revenue.toolSales.count} sales this month</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Your Commission (10%)</p>
              <p className="text-2xl font-bold text-green-600">£{data.revenue.toolSales.commission.toFixed(2)}</p>
            </div>
          </div>

          {/* Consumable Sales */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Consumable Sales</div>
            <p className="text-4xl font-bold text-gray-900">£{data.revenue.consumables.revenue.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">{data.revenue.consumables.count} sales this month</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Your Commission (1%)</p>
              <p className="text-2xl font-bold text-green-600">£{data.revenue.consumables.commission.toFixed(2)}</p>
            </div>
          </div>

          {/* Tool Rentals */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Tool Rentals</div>
            <p className="text-4xl font-bold text-gray-900">£{data.revenue.rentals.revenue.toFixed(2)}/mo</p>
            <p className="text-sm text-gray-600 mt-2">{data.revenue.rentals.count} active subscriptions</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Your Commission (10%)</p>
              <p className="text-2xl font-bold text-green-600">£{data.revenue.rentals.commission.toFixed(2)}/mo</p>
            </div>
          </div>
        </div>

        {/* Total Commission Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">Total Commission This Month</p>
              <p className="text-5xl font-bold text-green-900 mt-2">£{data.revenue.totalCommission.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-700">Active Deals</div>
              <div className="text-3xl font-bold text-green-900">{data.pipeline.activeDeals}</div>
              {data.pipeline.needsAction > 0 && (
                <div className="mt-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {data.pipeline.needsAction} Need Action!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Email Opens</div>
              <p className="text-3xl font-bold text-gray-900">{data.todayActivity.emailOpens}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Link Clicks</div>
              <p className="text-3xl font-bold text-gray-900">{data.todayActivity.emailClicks}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Portal Views</div>
              <p className="text-3xl font-bold text-gray-900">{data.todayActivity.portalViews}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Quote Requests</div>
              <p className="text-3xl font-bold text-gray-900">{data.todayActivity.quoteRequests}</p>
            </div>
          </div>
        </div>

        {/* Pipeline Table */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pipeline</h2>
          <PipelineTable quoteRequests={data.pipeline.quoteRequests} />
        </div>
      </div>
    </div>
  );
}
