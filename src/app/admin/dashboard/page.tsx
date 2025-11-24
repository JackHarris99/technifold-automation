/**
 * Sales Rep Dashboard
 * Professional dashboard with live metrics, commission tracking, and hot leads
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || user.email}
          </h1>
          <p className="mt-2 text-gray-600">
            {director ? "Team Performance Overview" : "Your Territory Performance"}
          </p>
        </div>

        {/* Commission & Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Revenue This Month */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Revenue This Month</div>
            </div>
            <p className="text-4xl font-bold text-gray-900">£{metrics.revenue.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">{metrics.orderCount} orders closed</p>
          </div>

          {/* Commission Earned */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Your Commission</div>
            </div>
            <p className="text-4xl font-bold text-gray-900">£{metrics.commission.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">10% of revenue</p>
          </div>

          {/* My Territory */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">My Companies</div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{metrics.companiesCount}</p>
            <p className="text-sm text-gray-600 mt-2">{metrics.pendingQuotes} pending quotes</p>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Today's Activity</h2>
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Email Opens</div>
              <p className="text-3xl font-bold text-gray-900">{metrics.todayActivity.emailOpens}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Link Clicks</div>
              <p className="text-3xl font-bold text-gray-900">{metrics.todayActivity.emailClicks}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Portal Views</div>
              <p className="text-3xl font-bold text-gray-900">{metrics.todayActivity.portalViews}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Quote Requests</div>
              <p className="text-3xl font-bold text-gray-900">{metrics.todayActivity.quoteRequests}</p>
            </div>
          </div>
        </div>

        {/* Hot Leads */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">High-Engagement Contacts (Last 7 Days)</h2>

          {metrics.hotLeads.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No recent engagement yet</p>
              <p className="text-gray-500 text-sm mt-2">Start sending campaigns to track contact engagement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.hotLeads.map((lead, index) => (
                <Link
                  key={lead.contact_id}
                  href={`/admin/company/${lead.company_id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-200 text-gray-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{lead.contact_name}</h3>
                      <p className="text-sm text-gray-600">{lead.company_name}</p>
                      <p className="text-xs text-gray-500">{lead.contact_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{lead.total}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">interactions</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      {lead.opens > 0 && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{lead.opens} opens</span>}
                      {lead.clicks > 0 && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{lead.clicks} clicks</span>}
                      {lead.views > 0 && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{lead.views} views</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/companies"
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg p-6 text-center transition-all"
            >
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-semibold text-gray-900">My Companies</span>
            </Link>

            <Link
              href="/admin/campaigns/configure"
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg p-6 text-center transition-all"
            >
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-gray-900">Send Campaign</span>
            </Link>

            <Link
              href="/admin/quote-builder-v2"
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg p-6 text-center transition-all"
            >
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-gray-900">Create Quote</span>
            </Link>

            <Link
              href="/admin/orders"
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg p-6 text-center transition-all"
            >
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="font-semibold text-gray-900">View Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
