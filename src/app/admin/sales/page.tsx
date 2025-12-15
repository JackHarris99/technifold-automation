/**
 * Sales Center Homepage - Action Dashboard
 * Territory-wide view with separate action sections
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface ReorderOpportunity {
  company_id: string;
  company_name: string;
  days_since_order: number;
  last_invoice_at: string;
}

interface TrialEnding {
  company_id: string;
  company_name: string;
  days_left: number;
  trial_end_date: string;
  subscription_id: string;
}

interface UnpaidInvoice {
  invoice_id: string;
  company_id: string;
  company_name: string;
  total_amount: number;
  invoice_date: string;
  invoice_url: string | null;
}

interface SalesMetrics {
  total_revenue: number;
  deals_closed: number;
  active_trials: number;
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
  const isDirector = currentUser.role === 'director';

  // Get companies in territory (directors see all, reps see their territory)
  let companiesQuery = supabase
    .from('companies')
    .select('company_id, company_name');

  if (!isDirector && currentUser.sales_rep_id) {
    companiesQuery = companiesQuery.eq('account_owner', currentUser.sales_rep_id);
  }

  const { data: companies } = await companiesQuery;
  const companyIds = companies?.map(c => c.company_id) || [];
  const companyMap = new Map(companies?.map(c => [c.company_id, c.company_name]) || []);

  // Build metrics
  let salesMetrics: SalesMetrics = {
    total_revenue: 0,
    deals_closed: 0,
    active_trials: 0,
    companies_in_territory: companyIds.length,
    unpaid_invoices_count: 0,
    unpaid_invoices_total: 0,
  };

  // Data collections for each section
  let reorderOpportunities: ReorderOpportunity[] = [];
  let trialsEnding: TrialEnding[] = [];
  let unpaidInvoices: UnpaidInvoice[] = [];

  if (companyIds.length > 0) {
    // Batch fetch all data in parallel
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      paidInvoicesResult,
      unpaidInvoicesResult,
      trialsResult,
      reorderResult,
      endingTrialsResult,
    ] = await Promise.all([
      // Revenue from paid invoices (last 30 days)
      supabase
        .from('invoices')
        .select('total_amount')
        .in('company_id', companyIds)
        .eq('payment_status', 'paid')
        .gte('invoice_date', thirtyDaysAgo),

      // Unpaid invoices with details
      supabase
        .from('invoices')
        .select('invoice_id, company_id, total_amount, invoice_date, invoice_url')
        .in('company_id', companyIds)
        .eq('payment_status', 'unpaid')
        .order('invoice_date', { ascending: true })
        .limit(10),

      // Active trials count
      supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .in('company_id', companyIds)
        .eq('status', 'trial'),

      // Reorder opportunities (90+ days since last order)
      supabase
        .from('companies')
        .select('company_id, company_name, last_invoice_at')
        .in('company_id', companyIds)
        .not('last_invoice_at', 'is', null)
        .lt('last_invoice_at', ninetyDaysAgo)
        .order('last_invoice_at', { ascending: true })
        .limit(10),

      // Trials ending soon (within 7 days)
      supabase
        .from('subscriptions')
        .select('subscription_id, company_id, trial_end_date')
        .in('company_id', companyIds)
        .eq('status', 'trial')
        .lt('trial_end_date', sevenDaysFromNow)
        .gt('trial_end_date', new Date().toISOString())
        .order('trial_end_date', { ascending: true })
        .limit(10),
    ]);

    // Process metrics
    const paidInvoices = paidInvoicesResult.data || [];
    salesMetrics.total_revenue = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    salesMetrics.deals_closed = paidInvoices.length;
    salesMetrics.active_trials = trialsResult.count || 0;

    // Process unpaid invoices
    const unpaidData = unpaidInvoicesResult.data || [];
    salesMetrics.unpaid_invoices_count = unpaidData.length;
    salesMetrics.unpaid_invoices_total = unpaidData.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    unpaidInvoices = unpaidData.map(inv => ({
      invoice_id: inv.invoice_id,
      company_id: inv.company_id,
      company_name: companyMap.get(inv.company_id) || 'Unknown Company',
      total_amount: inv.total_amount,
      invoice_date: inv.invoice_date,
      invoice_url: inv.invoice_url,
    }));

    // Process reorder opportunities
    reorderOpportunities = (reorderResult.data || []).map(company => ({
      company_id: company.company_id,
      company_name: company.company_name,
      days_since_order: Math.floor((Date.now() - new Date(company.last_invoice_at).getTime()) / (1000 * 60 * 60 * 24)),
      last_invoice_at: company.last_invoice_at,
    }));

    // Process trials ending
    trialsEnding = (endingTrialsResult.data || []).map(trial => ({
      subscription_id: trial.subscription_id,
      company_id: trial.company_id,
      company_name: companyMap.get(trial.company_id) || 'Unknown Company',
      days_left: Math.ceil((new Date(trial.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      trial_end_date: trial.trial_end_date,
    }));
  }

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
                {currentUser.full_name} • {isDirector ? 'All Territories' : 'My Territory'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/invoices/new"
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm shadow-sm"
              >
                + Create Invoice
              </Link>
              <Link
                href="/admin/quote-builder"
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
              >
                Create Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Revenue (30d)"
            value={`£${salesMetrics.total_revenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            color="green"
          />
          <MetricCard
            label="Invoices Paid"
            value={salesMetrics.deals_closed.toString()}
            color="blue"
          />
          <MetricCard
            label="Active Trials"
            value={salesMetrics.active_trials.toString()}
            color="purple"
          />
          <MetricCard
            label="Companies"
            value={salesMetrics.companies_in_territory.toString()}
            color="gray"
          />
        </div>

        {/* Main Content Grid - 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Trials Ending Soon - HIGHEST PRIORITY */}
            <ActionSection
              title="Trials Ending Soon"
              icon="⏰"
              count={trialsEnding.length}
              emptyMessage="No trials ending this week"
              emptyIcon="✅"
              color="red"
              viewAllHref="/admin/sales/trials-ending"
            >
              {trialsEnding.map((trial) => (
                <Link
                  key={trial.subscription_id}
                  href={`/admin/sales/company/${trial.company_id}`}
                  className="flex items-center justify-between p-4 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{trial.company_name}</h4>
                    <p className="text-sm text-red-600 font-medium">
                      {trial.days_left <= 0 ? 'Ending today!' : `${trial.days_left} day${trial.days_left !== 1 ? 's' : ''} left`}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    trial.days_left <= 2 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {trial.days_left}d
                  </div>
                </Link>
              ))}
            </ActionSection>

            {/* Unpaid Invoices */}
            <ActionSection
              title="Unpaid Invoices"
              icon="💳"
              count={unpaidInvoices.length}
              total={salesMetrics.unpaid_invoices_total > 0 ? `£${salesMetrics.unpaid_invoices_total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : undefined}
              emptyMessage="All invoices paid"
              emptyIcon="💰"
              color="orange"
              viewAllHref="/admin/sales/unpaid-invoices"
            >
              {unpaidInvoices.map((invoice) => (
                <div
                  key={invoice.invoice_id}
                  className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{invoice.company_name}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      £{invoice.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </span>
                    {invoice.invoice_url && (
                      <a
                        href={invoice.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium hover:bg-orange-200"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </ActionSection>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Reorder Opportunities */}
            <ActionSection
              title="Reorder Opportunities"
              icon="🔄"
              count={reorderOpportunities.length}
              emptyMessage="No reorder opportunities found"
              emptyIcon="📦"
              color="purple"
              viewAllHref="/admin/sales/reorder-opportunities"
            >
              {reorderOpportunities.map((opp) => (
                <Link
                  key={opp.company_id}
                  href={`/admin/sales/company/${opp.company_id}`}
                  className="flex items-center justify-between p-4 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{opp.company_name}</h4>
                    <p className="text-sm text-gray-500">
                      Last order: {new Date(opp.last_invoice_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    opp.days_since_order > 180 ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {opp.days_since_order}d ago
                  </div>
                </Link>
              ))}
            </ActionSection>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <Link
                  href="/admin/sales/companies"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">My Territory</h4>
                    <p className="text-sm text-gray-500">View all companies in your territory</p>
                  </div>
                </Link>
                <Link
                  href="/admin/companies"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Search All Companies</h4>
                    <p className="text-sm text-gray-500">Cross-territory lookup (CRM)</p>
                  </div>
                </Link>
                <Link
                  href="/admin/invoices"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">📄</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">All Invoices</h4>
                    <p className="text-sm text-gray-500">View and manage invoices</p>
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
  color: 'green' | 'blue' | 'purple' | 'gray';
}) {
  const colorClasses = {
    green: 'border-l-green-500',
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    gray: 'border-l-gray-400',
  };

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${colorClasses[color]} rounded-lg p-4`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ActionSection({
  title,
  icon,
  count,
  total,
  emptyMessage,
  emptyIcon,
  color,
  viewAllHref,
  children,
}: {
  title: string;
  icon: string;
  count: number;
  total?: string;
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
        <div className="flex items-center gap-3">
          {total && (
            <span className="text-sm font-semibold text-gray-700">{total}</span>
          )}
          {viewAllHref && count > 0 && (
            <Link
              href={viewAllHref}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          )}
        </div>
      </div>

      {count === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-2">{emptyIcon}</div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
