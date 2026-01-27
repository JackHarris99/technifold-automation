/**
 * Sales Center Client Wrapper
 * Handles client-side engagement timeline and expandable sections
 */

'use client';

import Link from 'next/link';
import CompanyEngagementTimeline from './CompanyEngagementTimeline';

interface Props {
  salesRepId?: string | null;
  trialsEnding: any[];
  unpaidInvoices: any[];
  quotesFollowUp: any[];
}

export default function SalesCenterClient({
  salesRepId,
  trialsEnding,
  unpaidInvoices,
  quotesFollowUp,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Active Engagement */}
      <ActionSection
        title="Active Engagement"
        icon="📊"
        emptyMessage="No engagement activity yet"
        emptyIcon="📊"
        color="blue"
      >
        <CompanyEngagementTimeline salesRepId={salesRepId} limit={10} />
      </ActionSection>

      {/* Quotes Need Follow-Up */}
      <ActionSection
        title="Quotes Need Follow-Up"
        icon="📄"
        count={quotesFollowUp.length}
        emptyMessage="No quotes need follow-up"
        emptyIcon="✅"
        color="purple"
        viewAllHref="/admin/quotes?status=need_followup"
      >
        {quotesFollowUp.map((quote: any) => (
          <Link
            key={quote.quote_id}
            href={`/admin/company/${quote.company_id}`}
            className="flex items-start justify-between p-4 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
          >
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{quote.company_name}</h4>
              <p className="text-sm text-gray-700 mt-1">{quote.next_action}</p>
              <p className="text-xs text-gray-500 mt-1">
                £{quote.total_amount.toLocaleString('en-GB')}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ml-3 flex-shrink-0 ${
              quote.next_action_priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {quote.next_action_priority === 'high' ? 'HIGH' : 'MED'}
            </div>
          </Link>
        ))}
      </ActionSection>

      {/* Trials Ending Soon */}
      <ActionSection
        title="Trials Ending Soon"
        icon="⏰"
        count={trialsEnding.length}
        emptyMessage="No trials ending this week"
        emptyIcon="✅"
        color="red"
        viewAllHref="/admin/sales/trials-ending"
      >
        {trialsEnding.map((trial: any) => (
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

      {/* Unpaid Invoices */}
      <ActionSection
        title="Unpaid Invoices"
        icon="💳"
        count={unpaidInvoices.length}
        total={unpaidInvoices.length > 0 ? `£${unpaidInvoices.reduce((s: number, i: any) => s + i.total_amount, 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : undefined}
        emptyMessage="All invoices paid"
        emptyIcon="💰"
        color="orange"
      >
        {unpaidInvoices.map((invoice: any) => (
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
  count?: number;
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col h-[600px]">
      {/* Header - Fixed */}
      <div className={`px-5 py-4 border-b ${headerColors[color]} flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          </div>
          {count !== undefined && count > 0 && (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${badgeColors[color]}`}>
              {count}
            </span>
          )}
        </div>
        {total && (
          <div className="text-sm font-semibold text-gray-700">{total}</div>
        )}
        {viewAllHref && count !== undefined && count > 0 && (
          <Link
            href={viewAllHref}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-block mt-1"
          >
            View All →
          </Link>
        )}
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {count !== undefined && count === 0 ? (
          <div className="p-8 text-center h-full flex flex-col items-center justify-center">
            <div className="text-5xl mb-3">{emptyIcon}</div>
            <p className="text-gray-700 font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
