/**
 * Invoices Section
 * Shows Stripe invoices only (future invoices, no historic Sage reconstruction)
 */

'use client';

import Link from 'next/link';

interface Invoice {
  invoice_id: string;
  stripe_invoice_id?: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
}

interface InvoicesSectionProps {
  invoices: Invoice[];
}

export default function InvoicesSection({ invoices }: InvoicesSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'void':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Invoices ({invoices.length})
      </h2>
      <p className="text-xs text-gray-500 mb-4">Stripe invoices only (no historic data)</p>

      {invoices.length === 0 ? (
        <p className="text-gray-600 text-sm">No invoices</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Link
              key={invoice.invoice_id}
              href={`/admin/invoices/${invoice.invoice_id}`}
              className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      Invoice #{invoice.invoice_id.slice(0, 8)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Created: {new Date(invoice.created_at).toLocaleDateString('en-GB')}
                  </div>
                  {invoice.due_date && (
                    <div className="text-sm text-gray-600">
                      Due: {new Date(invoice.due_date).toLocaleDateString('en-GB')}
                    </div>
                  )}
                  {invoice.paid_at && (
                    <div className="text-sm text-green-600">
                      Paid: {new Date(invoice.paid_at).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    £{invoice.amount_due.toFixed(2)}
                  </div>
                  {invoice.amount_paid > 0 && invoice.status !== 'paid' && (
                    <div className="text-sm text-gray-600">
                      Paid: £{invoice.amount_paid.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
