/**
 * Sales Center Homepage - Action Dashboard
 * Territory-wide view with separate action sections
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSalesRepFromViewMode, type ViewMode } from '@/lib/viewMode';

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

interface NeedsContact {
  company_id: string;
  company_name: string;
  days_since_contact: number;
  last_contact_at: string | null;
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

  // Get view mode from cookies
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get('view_mode');
  const viewModeValue = viewModeCookie?.value || 'all';

  // Parse view mode
  let viewMode: ViewMode = 'all';
  if (viewModeValue === 'my_customers') viewMode = 'my_customers';
  else if (viewModeValue === 'view_as_lee') viewMode = 'view_as_lee';
  else if (viewModeValue === 'view_as_steve') viewMode = 'view_as_steve';
  else if (viewModeValue === 'view_as_callum') viewMode = 'view_as_callum';

  // Determine which sales rep to filter by
  const filterBySalesRep = getSalesRepFromViewMode(viewMode, currentUser.sales_rep_id);

  const supabase = getSupabaseClient();

  // Fetch companies (filtered by view mode)
  let allCompanies: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('companies')
      .select('company_id, company_name, account_owner')
      .neq('status', 'dead')  // Exclude dead customers from sales metrics
      .range(start, start + batchSize - 1);

    // Apply view mode filter
    if (filterBySalesRep) {
      query = query.eq('account_owner', filterBySalesRep);
    }

    const { data: batch, error } = await query;

    if (error) {
      console.error('[Sales Center] Companies query error:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allCompanies = allCompanies.concat(batch);
      start += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  const companies = allCompanies;
  const companyMap = new Map(companies?.map(c => [c.company_id, c.company_name]) || []);

  // Extract company IDs for filtering data queries
  const companyIds = companies.map(c => c.company_id);

  // Build metrics
  let salesMetrics: SalesMetrics = {
    total_revenue: 0,
    deals_closed: 0,
    active_trials: 0,
    companies_in_territory: companies.length,
    unpaid_invoices_count: 0,
    unpaid_invoices_total: 0,
  };

  // Data collections for each section
  let reorderOpportunities: ReorderOpportunity[] = [];
  let trialsEnding: TrialEnding[] = [];
  let unpaidInvoices: UnpaidInvoice[] = [];
  let needsContact: NeedsContact[] = [];

  if (companies.length > 0) {
    // Get current month boundaries
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = firstDayOfMonth.toISOString();

    // Other date ranges
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Build queries conditionally based on viewMode
    let paidInvoicesQuery = supabase
      .from('invoices')
      .select('subtotal')  // Use subtotal for commission (excludes VAT & shipping)
      .eq('payment_status', 'paid')
      .gte('invoice_date', monthStart);  // Changed to current month

    let unpaidInvoicesQuery = supabase
      .from('invoices')
      .select('invoice_id, company_id, total_amount, invoice_date, invoice_url')
      .eq('payment_status', 'unpaid')
      .order('invoice_date', { ascending: true })
      .limit(10);

    let trialsQuery = supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'trial');

    let reorderQuery = supabase
      .from('companies')
      .select('company_id, company_name, last_invoice_at')
      .not('last_invoice_at', 'is', null)
      .lt('last_invoice_at', ninetyDaysAgo)
      .order('last_invoice_at', { ascending: true })
      .limit(10);

    let endingTrialsQuery = supabase
      .from('subscriptions')
      .select('subscription_id, company_id, trial_end_date')
      .eq('status', 'trial')
      .lt('trial_end_date', sevenDaysFromNow)
      .gt('trial_end_date', new Date().toISOString())
      .order('trial_end_date', { ascending: true })
      .limit(10);

    let lastContactsQuery = supabase
      .from('engagement_events')
      .select('company_id, occurred_at, event_name')
      .ilike('event_name', 'manual_contact%')
      .order('occurred_at', { ascending: false })
      .limit(1000);

    // Apply company filter when filtering by specific sales rep
    if (filterBySalesRep) {
      paidInvoicesQuery = paidInvoicesQuery.in('company_id', companyIds);
      unpaidInvoicesQuery = unpaidInvoicesQuery.in('company_id', companyIds);
      trialsQuery = trialsQuery.in('company_id', companyIds);
      reorderQuery = reorderQuery.in('company_id', companyIds);
      endingTrialsQuery = endingTrialsQuery.in('company_id', companyIds);
      lastContactsQuery = lastContactsQuery.in('company_id', companyIds);
    }

    const [
      paidInvoicesResult,
      unpaidInvoicesResult,
      trialsResult,
      reorderResult,
      endingTrialsResult,
      lastContactsResult,
    ] = await Promise.all([
      paidInvoicesQuery,
      unpaidInvoicesQuery,
      trialsQuery,
      reorderQuery,
      endingTrialsQuery,
      lastContactsQuery,
    ]);

    // Process metrics
    const paidInvoices = paidInvoicesResult.data || [];
    salesMetrics.total_revenue = paidInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
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

    // Process last contacts - group by company and get most recent
    const lastContactData = lastContactsResult.data || [];
    const lastContactMap = new Map<string, { occurred_at: string; event_name: string }>();

    // Get the most recent contact for each company
    lastContactData.forEach(event => {
      if (!lastContactMap.has(event.company_id)) {
        lastContactMap.set(event.company_id, {
          occurred_at: event.occurred_at,
          event_name: event.event_name,
        });
      }
    });

    // Calculate days since contact for all companies
    const nowTimestamp = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    needsContact = companies
      .map(company => {
        const lastContact = lastContactMap.get(company.company_id);
        const companyName = company.company_name;

        if (!lastContact) {
          // Never contacted
          return {
            company_id: company.company_id,
            company_name: companyName,
            days_since_contact: 999,
            last_contact_at: null,
          };
        }

        const daysSince = Math.floor((nowTimestamp - new Date(lastContact.occurred_at).getTime()) / (1000 * 60 * 60 * 24));

        if (daysSince >= 90) {
          return {
            company_id: company.company_id,
            company_name: companyName,
            days_since_contact: daysSince,
            last_contact_at: lastContact.occurred_at,
          };
        }

        return null;
      })
      .filter((item): item is NeedsContact => item !== null)
      .sort((a, b) => b.days_since_contact - a.days_since_contact)
      .slice(0, 10);
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
              <p className="text-sm text-gray-800 mt-1">
                {currentUser.full_name} • {
                  viewMode === 'my_customers' ? 'My Customers Only' :
                  viewMode === 'view_as_lee' ? "Viewing as Lee" :
                  viewMode === 'view_as_steve' ? "Viewing as Steve" :
                  viewMode === 'view_as_callum' ? "Viewing as Callum" :
                  'All Companies (Team View)'
                }
              </p>
            </div>
            <Link
              href="/admin/my-performance"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              💰 My Performance
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Revenue (This Month)"
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
                  href={`/admin/company/${trial.company_id}`}
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

            {/* Companies Needing Contact */}
            <ActionSection
              title="Need to Contact"
              icon="📞"
              count={needsContact.length}
              emptyMessage="All companies contacted recently"
              emptyIcon="✅"
              color="orange"
              viewAllHref="/admin/companies"
            >
              {needsContact.map((company) => (
                <Link
                  key={company.company_id}
                  href={`/admin/company/${company.company_id}`}
                  className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{company.company_name}</h4>
                    <p className="text-sm text-gray-700">
                      {company.last_contact_at
                        ? `Last contact: ${new Date(company.last_contact_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'Never contacted'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    company.days_since_contact >= 180 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {company.days_since_contact === 999 ? 'Never' : `${company.days_since_contact}d`}
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
                    <p className="text-sm text-gray-700">
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
                  href={`/admin/company/${opp.company_id}`}
                  className="flex items-center justify-between p-4 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{opp.company_name}</h4>
                    <p className="text-sm text-gray-700">
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
                  href="/admin/sales/distributors"
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border-2 border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <span className="text-2xl">📦</span>
                  <div>
                    <h4 className="font-semibold text-purple-900">Distributor Control Center</h4>
                    <p className="text-sm text-purple-700">Manage distributors, orders, and wholesale relationships</p>
                  </div>
                </Link>
                <Link
                  href="/admin/companies"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">My Territory</h4>
                    <p className="text-sm text-gray-700">View all companies in your territory</p>
                  </div>
                </Link>
                <Link
                  href="/admin/companies"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Search All Companies</h4>
                    <p className="text-sm text-gray-700">Cross-territory lookup (CRM)</p>
                  </div>
                </Link>
                <Link
                  href="/admin/invoices"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">📄</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">All Invoices</h4>
                    <p className="text-sm text-gray-700">View and manage invoices</p>
                  </div>
                </Link>
                <Link
                  href="/admin/distributor-pricing"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">💰</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Distributor Pricing</h4>
                    <p className="text-sm text-gray-700">Manage tiered pricing for distributors</p>
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
      <div className="text-sm text-gray-800">{label}</div>
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
