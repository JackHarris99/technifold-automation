/**
 * Full List: Reorder Opportunities
 * Shows all companies with 90+ days since last order
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';

interface ReorderOpportunity {
  company_id: string;
  company_name: string;
  days_since_order: number;
  last_invoice_at: string;
  total_spent: number;
  order_count: number;
}

export default async function ReorderOpportunitiesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Get view mode from cookies
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get('view_mode');
  const viewMode = viewModeCookie?.value === 'my_customers' ? 'my_customers' : 'all';

  const supabase = getSupabaseClient();

  // Fetch companies with order history
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from('companies')
    .select('company_id, company_name, account_owner, last_invoice_at, total_revenue')
    .eq('type', 'customer')  // Only customers for reorder opportunities
    .not('last_invoice_at', 'is', null)
    .lt('last_invoice_at', ninetyDaysAgo)
    .order('last_invoice_at', { ascending: true });

  // Apply "My Customers" filter
  if (viewMode === 'my_customers') {
    query = query.eq('account_owner', currentUser.sales_rep_id);
  }

  const { data: companies } = await query;

  // Get invoice counts for each company
  const companyIds = companies?.map(c => c.company_id) || [];
  let orderCounts = new Map<string, number>();

  if (companyIds.length > 0) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('company_id')
      .in('company_id', companyIds)
      .eq('payment_status', 'paid');

    invoices?.forEach(inv => {
      orderCounts.set(inv.company_id, (orderCounts.get(inv.company_id) || 0) + 1);
    });
  }

  const reorderOpportunities: ReorderOpportunity[] = (companies || []).map(company => ({
    company_id: company.company_id,
    company_name: company.company_name,
    days_since_order: Math.floor((Date.now() - new Date(company.last_invoice_at).getTime()) / (1000 * 60 * 60 * 24)),
    last_invoice_at: company.last_invoice_at,
    total_spent: company.total_revenue || 0,
    order_count: orderCounts.get(company.company_id) || 0,
  }));

  // Group by urgency
  const dormant = reorderOpportunities.filter(o => o.days_since_order >= 365);
  const atrisk = reorderOpportunities.filter(o => o.days_since_order >= 180 && o.days_since_order < 365);
  const dueSoon = reorderOpportunities.filter(o => o.days_since_order >= 90 && o.days_since_order < 180);

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link
                  href="/admin/sales"
                  className="text-gray-700 hover:text-gray-700"
                >
                  ← Sales Center
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reorder Opportunities
              </h1>
              <p className="text-sm text-gray-800 mt-1">
                {reorderOpportunities.length} compan{reorderOpportunities.length !== 1 ? 'ies' : 'y'} with 90+ days since last order • {viewMode === 'my_customers' ? 'My Customers Only' : 'All Companies (Team View)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {reorderOpportunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Reorder Opportunities</h2>
            <p className="text-gray-800">All customers have ordered within the last 90 days.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dormant - 365+ days */}
            {dormant.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Dormant - No order in 1+ year ({dormant.length})
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
                  {dormant.map((opp) => (
                    <OpportunityRow key={opp.company_id} opportunity={opp} urgency="dormant" />
                  ))}
                </div>
              </div>
            )}

            {/* At Risk - 180-364 days */}
            {atrisk.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  At Risk - 6+ months since last order ({atrisk.length})
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden">
                  {atrisk.map((opp) => (
                    <OpportunityRow key={opp.company_id} opportunity={opp} urgency="atrisk" />
                  ))}
                </div>
              </div>
            )}

            {/* Due Soon - 90-179 days */}
            {dueSoon.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  Due for Reorder - 3-6 months ({dueSoon.length})
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-purple-200 overflow-hidden">
                  {dueSoon.map((opp) => (
                    <OpportunityRow key={opp.company_id} opportunity={opp} urgency="due" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OpportunityRow({ opportunity, urgency }: { opportunity: ReorderOpportunity; urgency: 'dormant' | 'atrisk' | 'due' }) {
  const hoverColors = {
    dormant: 'hover:bg-red-50',
    atrisk: 'hover:bg-orange-50',
    due: 'hover:bg-purple-50',
  };

  const badgeColors = {
    dormant: 'bg-red-100 text-red-700',
    atrisk: 'bg-orange-100 text-orange-700',
    due: 'bg-purple-100 text-purple-700',
  };

  return (
    <Link
      href={`/admin/company/${opportunity.company_id}`}
      className={`flex items-center justify-between p-4 ${hoverColors[urgency]} transition-colors border-b border-gray-100 last:border-b-0`}
    >
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{opportunity.company_name}</h3>
        <p className="text-sm text-gray-700">
          Last order: {new Date(opportunity.last_invoice_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          {opportunity.order_count > 0 && ` • ${opportunity.order_count} total order${opportunity.order_count !== 1 ? 's' : ''}`}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {opportunity.total_spent > 0 && (
          <span className="text-sm text-gray-700">
            £{opportunity.total_spent.toLocaleString('en-GB', { minimumFractionDigits: 0 })} lifetime
          </span>
        )}
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${badgeColors[urgency]}`}>
          {opportunity.days_since_order}d ago
        </span>
      </div>
    </Link>
  );
}
