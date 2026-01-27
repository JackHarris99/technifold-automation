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
}

export default function SalesCenterClient({
  salesRepId,
  trialsEnding,
  unpaidInvoices,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Active Engagement Section - Full Width */}
      <ActionSection
        title="Active Engagement"
        icon="📊"
        emptyMessage="No engagement activity yet"
        emptyIcon="📊"
        color="blue"
      >
        <div className="p-4">
          <CompanyEngagementTimeline salesRepId={salesRepId} limit={10} />
        </div>
      </ActionSection>

      {/* Two Column Grid for Trials and Unpaid Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className={`px-5 py-3 border-b ${headerColors[color]} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {count !== undefined && count > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColors[color]}`}>
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {total && (
            <span className="text-sm font-semibold text-gray-700">{total}</span>
          )}
          {viewAllHref && count !== undefined && count > 0 && (
            <Link
              href={viewAllHref}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          )}
        </div>
      </div>

      {count !== undefined && count === 0 ? (
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
