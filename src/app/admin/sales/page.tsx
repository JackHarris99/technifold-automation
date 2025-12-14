/**
 * Sales Center Homepage - Action Dashboard
 * Territory-wide view of urgent actions for sales reps
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface UrgentAction {
  action_type: string;
  company_id: string;
  company_name: string;
  priority: number;
  message: string;
  action_data: any;
  action_url: string;
}

interface SalesMetrics {
  total_revenue: number;
  deals_closed: number;
  active_trials: number;
  trial_conversion_rate: number;
  companies_in_territory: number;
  unpaid_invoices_count: number;
  unpaid_invoices_total: number;
}

export default async function SalesCenterPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch urgent actions for this rep
  const { data: urgentActions, error: actionsError } = await supabase
    .rpc('get_urgent_actions', { rep_id: currentUser.id });

  // Fetch performance metrics
  const { data: metrics, error: metricsError } = await supabase
    .rpc('get_sales_metrics', { rep_id: currentUser.id });

  const salesMetrics: SalesMetrics | null = metrics?.[0] || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sales Control Center
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {currentUser.full_name} • {currentUser.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/quote-builder"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                + Create Quote
              </Link>
              <Link
                href="/admin/test-invoice"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                + Send Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Performance Metrics */}
        {salesMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              label="Revenue (30d)"
              value={`£${salesMetrics.total_revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
              icon="💰"
              color="green"
            />
            <MetricCard
              label="Deals Closed"
              value={salesMetrics.deals_closed.toString()}
              icon="✅"
              color="blue"
            />
            <MetricCard
              label="Active Trials"
              value={salesMetrics.active_trials.toString()}
              icon="🚀"
              color="purple"
            />
            <MetricCard
              label="Companies"
              value={salesMetrics.companies_in_territory.toString()}
              icon="🏢"
              color="gray"
            />
          </div>
        )}

        {metricsError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              Unable to load metrics: {metricsError.message}
            </p>
          </div>
        )}

        {/* Unpaid Invoices Alert */}
        {salesMetrics && salesMetrics.unpaid_invoices_count > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-orange-900">
                    {salesMetrics.unpaid_invoices_count} Unpaid Invoice{salesMetrics.unpaid_invoices_count > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-orange-700">
                    Total outstanding: £{salesMetrics.unpaid_invoices_total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Urgent Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Urgent Actions ({urgentActions?.length || 0})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Territory-wide opportunities and urgent tasks
            </p>
          </div>

          {actionsError && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Error loading actions: {actionsError.message}
                </p>
              </div>
            </div>
          )}

          {!actionsError && (!urgentActions || urgentActions.length === 0) && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Clear!
              </h3>
              <p className="text-gray-600">
                No urgent actions right now. Great work!
              </p>
            </div>
          )}

          {urgentActions && urgentActions.length > 0 && (
            <div className="divide-y divide-gray-200">
              {urgentActions.map((action: UrgentAction, index: number) => (
                <ActionRow key={index} action={action} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <QuickLinkCard
            href="/admin/sales/companies"
            icon="🏢"
            title="My Territory"
            description="View all companies in your territory"
          />
          <QuickLinkCard
            href="/admin/pipeline"
            icon="📊"
            title="Pipeline"
            description="Visual pipeline with drag-drop stages"
          />
          <QuickLinkCard
            href="/admin/companies"
            icon="🔍"
            title="Search All Companies"
            description="Cross-territory lookup (CRM)"
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
  color: 'green' | 'blue' | 'purple' | 'gray';
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    gray: 'bg-gray-50 border-gray-200',
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

function ActionRow({ action }: { action: UrgentAction }) {
  const iconMap: Record<string, string> = {
    trial_ending: '⏰',
    invoice_overdue: '💸',
    reorder_opportunity: '🔄',
    upsell_opportunity: '⬆️',
  };

  const priorityColors: Record<number, string> = {
    1: 'bg-red-50 border-red-200',
    2: 'bg-orange-50 border-orange-200',
    3: 'bg-yellow-50 border-yellow-200',
    4: 'bg-blue-50 border-blue-200',
    5: 'bg-gray-50 border-gray-200',
  };

  const actionLabels: Record<string, string> = {
    trial_ending: 'Trial Ending',
    invoice_overdue: 'Overdue Invoice',
    reorder_opportunity: 'Reorder Opportunity',
    upsell_opportunity: 'Upsell Opportunity',
  };

  return (
    <Link
      href={action.action_url}
      className="block p-6 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className={`${priorityColors[action.priority]} border rounded-lg p-3`}>
          <span className="text-2xl">{iconMap[action.action_type] || '📌'}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-gray-900">{action.company_name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {actionLabels[action.action_type] || action.action_type}
            </span>
          </div>
          <p className="text-gray-700">{action.message}</p>
        </div>
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
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
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
