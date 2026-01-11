/**
 * Unpaid Invoice Row (Client Component)
 * Shows invoice with chase/follow-up buttons
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogActivityModal } from './LogActivityModal';

interface UnpaidInvoice {
  invoice_id: string;
  company_id: string;
  company_name: string;
  total_amount: number;
  invoice_date: string;
  invoice_url: string | null;
  days_old: number;
}

interface UnpaidInvoiceRowProps {
  invoice: UnpaidInvoice;
  urgency: 'overdue' | 'warning' | 'recent';
}

export function UnpaidInvoiceRow({ invoice, urgency }: UnpaidInvoiceRowProps) {
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<'call' | 'email'>('call');

  const hoverColors = {
    overdue: 'hover:bg-red-50',
    warning: 'hover:bg-orange-50',
    recent: 'hover:bg-gray-50',
  };

  const badgeColors = {
    overdue: 'bg-red-100 text-red-700',
    warning: 'bg-orange-100 text-orange-700',
    recent: 'bg-gray-100 text-gray-700',
  };

  function openChaseModal(type: 'call' | 'email') {
    setActivityType(type);
    setShowActivityModal(true);
  }

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 ${hoverColors[urgency]} transition-colors border-b border-gray-100 last:border-b-0`}
      >
        <div className="flex-1">
          <Link
            href={`/admin/company/${invoice.company_id}`}
            className="font-semibold text-gray-900 hover:text-blue-600"
          >
            {invoice.company_name}
          </Link>
          <p className="text-sm text-gray-700">
            Invoice #{invoice.invoice_id.slice(-8)} • {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 text-lg">
            £{invoice.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${badgeColors[urgency]}`}>
            {invoice.days_old}d old
          </span>

          {/* Chase Buttons */}
          <button
            onClick={() => openChaseModal('call')}
            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200"
            title="Log chase call"
          >
            📞 Chase
          </button>
          <button
            onClick={() => openChaseModal('email')}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
            title="Log reminder email"
          >
            ✉️ Remind
          </button>

          {invoice.invoice_url && (
            <a
              href={invoice.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              View
            </a>
          )}
        </div>
      </div>

      {/* Activity Modal */}
      <LogActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        companyId={invoice.company_id}
        companyName={invoice.company_name}
        activityType={activityType}
        context="invoice_chase"
        invoiceId={invoice.invoice_id}
        onSuccess={() => {
          // Could refresh the page or show a success message
          console.log('Activity logged for invoice', invoice.invoice_id);
        }}
      />
    </>
  );
}
