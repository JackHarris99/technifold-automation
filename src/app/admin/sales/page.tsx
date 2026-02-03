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
import SalesCenterClient from '@/components/admin/SalesCenterClient';

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

interface QuoteFollowUp {
  quote_id: string;
  company_id: string;
  company_name: string;
  total_amount: number;
  next_action: string;
  next_action_priority: 'high' | 'medium';
  preview_url: string;
}

interface PendingDistributorOrder {
  order_id: string;
  company_id: string;
  company_name: string;
  po_number: string | null;
  total_amount: number;
  created_at: string;
  item_count: number;
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
      .eq('type', 'customer')  // ONLY customers in sales centre (not prospects/distributors)
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
  let trialsEnding: TrialEnding[] = [];
  let unpaidInvoices: UnpaidInvoice[] = [];
  let quotesFollowUp: QuoteFollowUp[] = [];
  let pendingOrders: PendingDistributorOrder[] = [];

  if (companies.length > 0) {
    // Get current month boundaries
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = firstDayOfMonth.toISOString();

    // Other date ranges
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Build queries conditionally based on viewMode
    let paidInvoicesQuery = supabase
      .from('invoices')
      .select(`
        subtotal,
        companies!inner(account_owner, type)
      `)
      .eq('payment_status', 'paid')
      .gte('invoice_date', monthStart)
      .eq('companies.type', 'customer');

    let unpaidInvoicesQuery = supabase
      .from('invoices')
      .select(`
        invoice_id,
        company_id,
        total_amount,
        invoice_date,
        invoice_url,
        companies!inner(account_owner, type)
      `)
      .eq('payment_status', 'unpaid')
      .eq('companies.type', 'customer')
      .order('invoice_date', { ascending: true });

    let trialsQuery = supabase
      .from('subscriptions')
      .select(`
        subscription_id,
        companies!inner(account_owner, type)
      `, { count: 'exact', head: true })
      .eq('status', 'trial')
      .eq('companies.type', 'customer');

    let endingTrialsQuery = supabase
      .from('subscriptions')
      .select(`
        subscription_id,
        company_id,
        trial_end_date,
        companies!inner(account_owner)
      `)
      .eq('status', 'trial')
      .lt('trial_end_date', sevenDaysFromNow)
      .gt('trial_end_date', new Date().toISOString())
      .order('trial_end_date', { ascending: true });

    // Apply company filter when filtering by specific sales rep (BEFORE limit)
    if (filterBySalesRep) {
      // Use JOIN filters instead of .in() to avoid 800+ ID array limits
      paidInvoicesQuery = paidInvoicesQuery.eq('companies.account_owner', filterBySalesRep);
      unpaidInvoicesQuery = unpaidInvoicesQuery.eq('companies.account_owner', filterBySalesRep);
      trialsQuery = trialsQuery.eq('companies.account_owner', filterBySalesRep);
      endingTrialsQuery = endingTrialsQuery.eq('companies.account_owner', filterBySalesRep);
    }

    // Apply limits AFTER filtering
    unpaidInvoicesQuery = unpaidInvoicesQuery.limit(10);
    endingTrialsQuery = endingTrialsQuery.limit(10);

    // Pending distributor orders query
    const pendingOrdersQuery = supabase
      .from('distributor_orders')
      .select(`
        order_id,
        company_id,
        po_number,
        total_amount,
        created_at,
        companies!inner(company_name)
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(10);

    const [
      paidInvoicesResult,
      unpaidInvoicesResult,
      trialsResult,
      endingTrialsResult,
      pendingOrdersResult,
    ] = await Promise.all([
      paidInvoicesQuery,
      unpaidInvoicesQuery,
      trialsQuery,
      endingTrialsQuery,
      pendingOrdersQuery,
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

    // Process trials ending
    trialsEnding = (endingTrialsResult.data || []).map(trial => ({
      subscription_id: trial.subscription_id,
      company_id: trial.company_id,
      company_name: companyMap.get(trial.company_id) || 'Unknown Company',
      days_left: Math.ceil((new Date(trial.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      trial_end_date: trial.trial_end_date,
    }));

    // Fetch quotes needing follow-up (high/medium priority) using the optimized quotes API
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';
      const params = new URLSearchParams();
      if (viewMode !== 'all') params.set('viewMode', viewMode);
      params.set('status', 'need_followup');
      params.set('limit', '10');

      const quotesResponse = await fetch(`${baseUrl}/api/admin/quotes/list?${params}`, {
        cache: 'no-store', // Don't cache dashboard data
        credentials: 'include', // Include cookies for auth
      });

      if (quotesResponse.ok) {
        const quotesData = await quotesResponse.json();
        if (quotesData.success && quotesData.quotes) {
          // API already filters to need_followup, just take top 10
          quotesFollowUp = quotesData.quotes
            .slice(0, 10)
            .map((q: any) => ({
              quote_id: q.quote_id,
              company_id: q.company_id,
              company_name: q.company_name,
              total_amount: q.total_amount,
              next_action: q.next_action,
              next_action_priority: q.next_action_priority,
              preview_url: q.preview_url,
            }));
        }
      }
    } catch (error) {
      console.error('[Sales Center] Failed to fetch quotes:', error);
    }

    // Process pending distributor orders
    const pendingOrdersData = pendingOrdersResult.data || [];
    if (pendingOrdersData.length > 0) {
      // Fetch item counts for each order
      const orderIds = pendingOrdersData.map(o => o.order_id);
      const { data: itemCounts } = await supabase
        .from('distributor_order_items')
        .select('order_id')
        .in('order_id', orderIds);

      const itemCountMap = (itemCounts || []).reduce((acc, item) => {
        acc[item.order_id] = (acc[item.order_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      pendingOrders = pendingOrdersData.map(order => ({
        order_id: order.order_id,
        company_id: order.company_id,
        company_name: order.companies?.company_name || 'Unknown Company',
        po_number: order.po_number,
        total_amount: order.total_amount,
        created_at: order.created_at,
        item_count: itemCountMap[order.order_id] || 0,
      }));
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
        <div className="grid grid-cols-2 gap-6 mb-8">
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

        {/* Main Content */}
        <SalesCenterClient
          salesRepId={filterBySalesRep}
          trialsEnding={trialsEnding}
          unpaidInvoices={unpaidInvoices}
          quotesFollowUp={quotesFollowUp}
          pendingOrders={pendingOrders}
        />
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
