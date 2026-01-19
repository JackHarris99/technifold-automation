/**
 * Distributor Control Center
 * Shows the entire distributor lifecycle and pipeline
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface PendingInvitation {
  email: string;
  company_name: string;
  invited_at: string;
}

interface AcceptedInvite {
  email: string;
  full_name: string;
  company_name: string;
  accepted_at: string;
  last_login_at: string | null;
}

interface RecentOrder {
  order_id: string;
  company_name: string;
  user_name: string;
  subtotal: number;
  status: string;
  created_at: string;
}

interface ActivityEvent {
  activity_id: string;
  user_name: string;
  user_email: string;
  action_type: string;
  description: string;
  created_at: string;
}

interface DistributorMetrics {
  active_distributors: number;
  pending_invitations: number;
  accepted_invites: number;
  orders_pending_review: number;
  total_distributor_revenue_this_month: number;
}

export default async function DistributorControlCenter() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Build metrics
  let metrics: DistributorMetrics = {
    active_distributors: 0,
    pending_invitations: 0,
    accepted_invites: 0,
    orders_pending_review: 0,
    total_distributor_revenue_this_month: 0,
  };

  // Get current month boundaries
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStart = firstDayOfMonth.toISOString();

  // First, fetch distributor companies
  const { data: distributorCompanies } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('type', 'distributor')
    .neq('status', 'dead');

  const distributorCompanyIds = (distributorCompanies || []).map(c => c.company_id);

  // Now fetch metrics in parallel
  const [
    { data: pendingInvites, error: invitesError },
    { data: acceptedInvites, error: acceptedError },
    { data: pendingOrders, error: ordersError },
    { data: paidInvoices, error: invoicesError },
    { data: recentActivity, error: activityError },
  ] = await Promise.all([
    supabase
      .from('distributor_users')
      .select('email, created_at, companies(company_name)')
      .not('invitation_token', 'is', null)
      .is('password_hash', null)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('distributor_users')
      .select('email, full_name, created_at, last_login_at, companies(company_name)')
      .not('password_hash', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('distributor_orders')
      .select(`
        order_id,
        created_at,
        subtotal,
        status,
        user_name,
        companies(company_name)
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(10),
    distributorCompanyIds.length > 0
      ? supabase
          .from('invoices')
          .select('subtotal')
          .eq('payment_status', 'paid')
          .gte('invoice_date', monthStart)
          .in('company_id', distributorCompanyIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from('activity_log')
      .select('activity_id, user_name, user_email, action_type, description, created_at')
      .or('action_type.eq.distributor_login,action_type.eq.distributor_order_created,action_type.eq.distributor_user_created')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  // Calculate metrics
  metrics.active_distributors = distributorCompanies?.length || 0;
  metrics.pending_invitations = pendingInvites?.length || 0;
  metrics.accepted_invites = acceptedInvites?.length || 0;
  metrics.orders_pending_review = pendingOrders?.length || 0;
  metrics.total_distributor_revenue_this_month = (paidInvoices || []).reduce(
    (sum, inv) => sum + (inv.subtotal || 0),
    0
  );

  // Process pending invitations
  const pendingInvitationsList: PendingInvitation[] = (pendingInvites || []).map((invite: any) => ({
    email: invite.email,
    company_name: invite.companies?.company_name || 'Unknown',
    invited_at: invite.created_at,
  }));

  // Process accepted invites
  const acceptedInvitesList: AcceptedInvite[] = (acceptedInvites || []).map((invite: any) => ({
    email: invite.email,
    full_name: invite.full_name,
    company_name: invite.companies?.company_name || 'Unknown',
    accepted_at: invite.created_at,
    last_login_at: invite.last_login_at,
  }));

  // Process recent orders
  const recentOrdersList: RecentOrder[] = (pendingOrders || []).map((order: any) => ({
    order_id: order.order_id,
    company_name: order.companies?.company_name || 'Unknown',
    user_name: order.user_name,
    subtotal: order.subtotal,
    status: order.status,
    created_at: order.created_at,
  }));

  // Process activity log
  const activityList: ActivityEvent[] = (recentActivity || []).map((activity: any) => ({
    activity_id: activity.activity_id,
    user_name: activity.user_name,
    user_email: activity.user_email,
    action_type: activity.action_type,
    description: activity.description || getActivityDescription(activity.action_type),
    created_at: activity.created_at,
  }));

  function getActivityDescription(action_type: string): string {
    switch (action_type) {
      case 'distributor_login': return 'Logged in to distributor portal';
      case 'distributor_order_created': return 'Created new order';
      case 'distributor_user_created': return 'New distributor user created';
      default: return action_type;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Distributor Control Center
              </h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage distributor relationships and wholesale orders
              </p>
            </div>
            <Link
              href="/admin/sales"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              ← Back to Sales Center
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <MetricCard
            label="Active Distributors"
            value={metrics.active_distributors.toString()}
            color="purple"
          />
          <MetricCard
            label="Accepted Invites"
            value={metrics.accepted_invites.toString()}
            color="blue"
          />
          <MetricCard
            label="Pending Invitations"
            value={metrics.pending_invitations.toString()}
            color="orange"
          />
          <MetricCard
            label="Orders Pending Review"
            value={metrics.orders_pending_review.toString()}
            color="red"
          />
          <MetricCard
            label="Revenue (This Month)"
            value={`£${metrics.total_distributor_revenue_this_month.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            color="green"
          />
        </div>

        {/* Main Content Grid - 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Accepted Invites */}
            <ActionSection
              title="Accepted Invites"
              icon="✅"
              count={acceptedInvitesList.length}
              emptyMessage="No distributors have accepted invitations yet"
              emptyIcon="📧"
              color="blue"
              viewAllHref="/admin/distributors"
            >
              {acceptedInvitesList.slice(0, 10).map((invite, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{invite.full_name}</h4>
                    <p className="text-sm text-gray-700">{invite.company_name} • {invite.email}</p>
                  </div>
                  <div className="text-right">
                    {invite.last_login_at ? (
                      <div className="text-xs text-gray-600">
                        Last login: {new Date(invite.last_login_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    ) : (
                      <div className="text-xs text-orange-600 font-medium">Not logged in yet</div>
                    )}
                  </div>
                </div>
              ))}
            </ActionSection>

            {/* Pending Invitations */}
            <ActionSection
              title="Pending Invitations"
              icon="📧"
              count={pendingInvitationsList.length}
              emptyMessage="All invitations have been accepted"
              emptyIcon="✅"
              color="orange"
              viewAllHref="/admin/distributors"
            >
              {pendingInvitationsList.map((invite, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{invite.company_name}</h4>
                    <p className="text-sm text-gray-700">{invite.email}</p>
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(invite.invited_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
            </ActionSection>

            {/* Orders Pending Review */}
            <ActionSection
              title="Orders Pending Review"
              icon="⏳"
              count={recentOrdersList.length}
              emptyMessage="No orders awaiting review"
              emptyIcon="✅"
              color="red"
              viewAllHref="/admin/distributor-orders/pending"
            >
              {recentOrdersList.map((order) => (
                <Link
                  key={order.order_id}
                  href={`/admin/distributor-orders/${order.order_id}/review`}
                  className="flex items-center justify-between p-4 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{order.company_name}</h4>
                    <p className="text-sm text-gray-700">
                      {order.user_name} • {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      £{order.subtotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded mt-1">
                      Review
                    </div>
                  </div>
                </Link>
              ))}
            </ActionSection>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <ActionSection
              title="Recent Activity"
              icon="📊"
              count={activityList.length}
              emptyMessage="No recent distributor activity"
              emptyIcon="💤"
              color="purple"
            >
              {activityList.slice(0, 15).map((activity) => (
                <div
                  key={activity.activity_id}
                  className="flex items-start justify-between p-4 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{activity.user_name}</h4>
                    <p className="text-xs text-gray-700">{activity.user_email}</p>
                    <p className="text-sm text-gray-800 mt-1">{activity.description}</p>
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap ml-4">
                    {new Date(activity.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </ActionSection>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <Link
                  href="/admin/distributors"
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border-2 border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <span className="text-2xl">👥</span>
                  <div>
                    <h4 className="font-semibold text-purple-900">Manage Distributors</h4>
                    <p className="text-sm text-purple-700">View all distributor users and invite new ones</p>
                  </div>
                </Link>
                <Link
                  href="/admin/distributor-orders/pending"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">📦</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Review Orders</h4>
                    <p className="text-sm text-gray-700">Approve distributor orders and create invoices</p>
                  </div>
                </Link>
                <Link
                  href="/admin/distributor-pricing"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">💰</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pricing Tiers</h4>
                    <p className="text-sm text-gray-700">Manage distributor pricing and discounts</p>
                  </div>
                </Link>
                <Link
                  href="/admin/distributor-sales"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">📊</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sales Analytics</h4>
                    <p className="text-sm text-gray-700">View distributor sales performance</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
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
  color: 'green' | 'purple' | 'orange' | 'red' | 'blue';
}) {
  const colorClasses = {
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
  };

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${colorClasses[color]} rounded-lg p-4`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-800">{label}</div>
    </div>
  );
}

function ActionSection({
  title,
  icon,
  count,
  emptyMessage,
  emptyIcon,
  color,
  viewAllHref,
  children,
}: {
  title: string;
  icon: string;
  count: number;
  emptyMessage: string;
  emptyIcon: string;
  color: 'red' | 'orange' | 'purple' | 'blue';
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  const headerColors = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  const badgeColors = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className={`px-5 py-3 border-b ${headerColors[color]} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColors[color]}`}>
            {count}
          </span>
        </div>
        {viewAllHref && count > 0 && (
          <Link
            href={viewAllHref}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        )}
      </div>

      {count === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-2">{emptyIcon}</div>
          <p className="text-gray-700">{emptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
