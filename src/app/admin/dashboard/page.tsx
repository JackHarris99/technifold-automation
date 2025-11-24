/**
 * Sales Rep Dashboard
 * Gamified dashboard with live metrics, commission tracking, and hot leads
 */

import { getCurrentUser, isDirector } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | Technifold Admin',
  description: 'Your sales performance dashboard',
};

async function getDashboardMetrics(salesRepId: string | null) {
  const supabase = getSupabaseClient();

  // Build territory filter
  const territoryFilter = salesRepId
    ? { account_owner: salesRepId }
    : {};

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.toISOString();

  // Get this month's date range
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  // 1. Orders this month (for commission)
  const { data: ordersThisMonth } = await supabase
    .from('orders')
    .select('order_id, total_amount, currency, company_id, created_at, companies(company_name, account_owner)')
    .gte('created_at', monthStart)
    .eq('status', 'paid');

  const filteredOrders = salesRepId
    ? ordersThisMonth?.filter(o => (o.companies as any)?.account_owner === salesRepId)
    : ordersThisMonth;

  const revenue = filteredOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount as any), 0) || 0;
  const orderCount = filteredOrders?.length || 0;

  // Commission calculation (10% for example - adjust as needed)
  const commissionRate = 0.10;
  const commission = revenue * commissionRate;

  // 2. Today's engagement events
  const { data: todayEvents } = await supabase
    .from('engagement_events')
    .select('event_id, event_name, company_id, contact_id, occurred_at, companies(company_name, account_owner)')
    .gte('occurred_at', todayStart);

  const filteredEvents = salesRepId
    ? todayEvents?.filter(e => (e.companies as any)?.account_owner === salesRepId)
    : todayEvents;

  const emailOpens = filteredEvents?.filter(e => e.event_name === 'email_opened').length || 0;
  const emailClicks = filteredEvents?.filter(e => e.event_name === 'email_clicked').length || 0;
  const portalViews = filteredEvents?.filter(e => e.event_name === 'portal_viewed').length || 0;
  const quoteRequests = filteredEvents?.filter(e => e.event_name === 'quote_requested').length || 0;

  // 3. Hot leads (contacts with high engagement in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentEvents } = await supabase
    .from('engagement_events')
    .select('contact_id, event_name, company_id, companies(company_name, account_owner), contacts(full_name, email)')
    .gte('occurred_at', sevenDaysAgo.toISOString());

  // Group by contact and count interactions
  const contactEngagement = new Map<string, any>();
  recentEvents?.forEach(event => {
    if (!event.contact_id) return;

    // Territory filter
    if (salesRepId && (event.companies as any)?.account_owner !== salesRepId) return;

    if (!contactEngagement.has(event.contact_id)) {
      contactEngagement.set(event.contact_id, {
        contact_id: event.contact_id,
        company_id: event.company_id,
        company_name: (event.companies as any)?.company_name,
        contact_name: (event.contacts as any)?.full_name,
        contact_email: (event.contacts as any)?.email,
        opens: 0,
        clicks: 0,
        views: 0,
        total: 0,
      });
    }

    const contact = contactEngagement.get(event.contact_id)!;
    if (event.event_name === 'email_opened') contact.opens++;
    if (event.event_name === 'email_clicked') contact.clicks++;
    if (event.event_name === 'portal_viewed' || event.event_name === 'marketing_page_viewed') contact.views++;
    contact.total++;
  });

  // Get top 5 hot leads (most engaged)
  const hotLeads = Array.from(contactEngagement.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // 4. My companies count
  const { count: companiesCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .match(territoryFilter);

  // 5. Quote requests pending
  const { count: pendingQuotes } = await supabase
    .from('quote_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .match(territoryFilter);

  return {
    revenue,
    orderCount,
    commission,
    todayActivity: {
      emailOpens,
      emailClicks,
      portalViews,
      quoteRequests,
    },
    hotLeads,
    companiesCount: companiesCount || 0,
    pendingQuotes: pendingQuotes || 0,
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const director = await isDirector();

  if (!user) {
    redirect('/admin/login');
  }

  // Get territory filter (null for directors, sales_rep_id for reps)
  const salesRepId = director ? null : user.sales_rep_id;

  const metrics = await getDashboardMetrics(salesRepId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {user.name || user.email}! 👋
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {director ? "Here's your team's performance" : "Here's your territory performance"}
          </p>
        </div>

        {/* Commission & Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Revenue This Month */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Revenue This Month</h3>
            <p className="text-4xl font-bold">£{metrics.revenue.toFixed(2)}</p>
            <p className="text-green-100 mt-2">{metrics.orderCount} orders closed</p>
          </div>

          {/* Commission Earned */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Your Commission</h3>
            <p className="text-4xl font-bold">£{metrics.commission.toFixed(2)}</p>
            <p className="text-blue-100 mt-2">10% of revenue</p>
          </div>

          {/* My Territory */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-3xl font-bold">🏢</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">My Companies</h3>
            <p className="text-4xl font-bold">{metrics.companiesCount}</p>
            <p className="text-purple-100 mt-2">{metrics.pendingQuotes} pending quotes</p>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔥 Today's Activity</h2>
            <span className="text-sm text-gray-500">Live updates</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📧</span>
                <span className="text-sm font-semibold text-orange-900">Email Opens</span>
              </div>
              <p className="text-3xl font-bold text-orange-700">{metrics.todayActivity.emailOpens}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🖱️</span>
                <span className="text-sm font-semibold text-blue-900">Link Clicks</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">{metrics.todayActivity.emailClicks}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👀</span>
                <span className="text-sm font-semibold text-purple-900">Portal Views</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">{metrics.todayActivity.portalViews}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💼</span>
                <span className="text-sm font-semibold text-green-900">Quote Requests</span>
              </div>
              <p className="text-3xl font-bold text-green-700">{metrics.todayActivity.quoteRequests}</p>
            </div>
          </div>
        </div>

        {/* Hot Leads */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔥 Hot Leads (Last 7 Days)</h2>

          {metrics.hotLeads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recent engagement yet</p>
              <p className="text-gray-400 mt-2">Start sending campaigns to see hot leads here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.hotLeads.map((lead, index) => (
                <Link
                  key={lead.contact_id}
                  href={`/admin/company/${lead.company_id}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 rounded-xl border-2 border-orange-200 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{lead.contact_name}</h3>
                      <p className="text-sm text-gray-600">{lead.company_name}</p>
                      <p className="text-xs text-gray-500">{lead.contact_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">{lead.total}</p>
                    <p className="text-xs text-gray-500">interactions</p>
                    <div className="flex gap-2 mt-1">
                      {lead.opens > 0 && <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">{lead.opens} opens</span>}
                      {lead.clicks > 0 && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">{lead.clicks} clicks</span>}
                      {lead.views > 0 && <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">{lead.views} views</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/companies"
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 text-center transition-all hover:shadow-lg"
            >
              <span className="text-4xl mb-3 block">🏢</span>
              <span className="font-semibold">My Companies</span>
            </Link>

            <Link
              href="/admin/campaigns/new"
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-6 text-center transition-all hover:shadow-lg"
            >
              <span className="text-4xl mb-3 block">📧</span>
              <span className="font-semibold">Send Campaign</span>
            </Link>

            <Link
              href="/admin/quote-builder-v2"
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-6 text-center transition-all hover:shadow-lg"
            >
              <span className="text-4xl mb-3 block">💼</span>
              <span className="font-semibold">Create Quote</span>
            </Link>

            <Link
              href="/admin/orders"
              className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl p-6 text-center transition-all hover:shadow-lg"
            >
              <span className="text-4xl mb-3 block">📦</span>
              <span className="font-semibold">View Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
