'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Invoice {
  invoice_id: string;
  company_id: string;
  invoice_number: string | null;
  total_amount: number;
  payment_status: 'paid' | 'unpaid' | 'void';
  invoice_date: string;
  invoice_url: string | null;
  company_name?: string;
  stripe_invoice_id?: string | null;
}

interface StripeStatusInfo {
  stripe_status: string | null;
  in_sync: boolean;
  loading: boolean;
}

interface InvoiceListClientProps {
  initialInvoices: Invoice[];
  viewMode: string;
}

export default function InvoiceListClient({ initialInvoices, viewMode }: InvoiceListClientProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [voidingInvoiceId, setVoidingInvoiceId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [stripeStatuses, setStripeStatuses] = useState<Map<string, StripeStatusInfo>>(new Map());
  const [showVoidInvoices, setShowVoidInvoices] = useState(false);
  const [bulkSyncing, setBulkSyncing] = useState(false);

  const handleBulkSync = async () => {
    if (!confirm('Sync all invoice statuses from Stripe? This may take a moment.')) {
      return;
    }

    setBulkSyncing(true);

    try {
      const response = await fetch('/api/admin/invoices/bulk-sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to bulk sync: ${data.error}`);
        setBulkSyncing(false);
        return;
      }

      // Reload the page to show updated invoices
      alert(`Synced ${data.total} invoices. ${data.updated} updated, ${data.errors} errors.`);
      window.location.reload();
    } catch (error) {
      console.error('Error bulk syncing:', error);
      alert('An error occurred while syncing invoices');
      setBulkSyncing(false);
    }
  };

  const handleSyncStatus = async (invoice: Invoice) => {
    if (!invoice.stripe_invoice_id) {
      alert('This invoice has no Stripe invoice ID');
      return;
    }

    // Set loading state
    setStripeStatuses(prev => new Map(prev).set(invoice.invoice_id, {
      stripe_status: null,
      in_sync: false,
      loading: true,
    }));

    try {
      const response = await fetch(`/api/admin/invoices/${invoice.invoice_id}/sync-status`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to sync status: ${data.error}`);
        setStripeStatuses(prev => {
          const newMap = new Map(prev);
          newMap.delete(invoice.invoice_id);
          return newMap;
        });
        return;
      }

      // Update Stripe status state
      setStripeStatuses(prev => new Map(prev).set(invoice.invoice_id, {
        stripe_status: data.stripe_status,
        in_sync: data.in_sync,
        loading: false,
      }));

      // If status was updated, refresh the invoice in the list
      if (data.updated) {
        setInvoices(prev =>
          prev.map(inv =>
            inv.invoice_id === invoice.invoice_id
              ? { ...inv, payment_status: data.local_status_after }
              : inv
          )
        );
        alert(`Invoice status synced: ${data.local_status_before} → ${data.local_status_after}`);
      }
    } catch (error) {
      console.error('Error syncing status:', error);
      alert('An error occurred while syncing status');
      setStripeStatuses(prev => {
        const newMap = new Map(prev);
        newMap.delete(invoice.invoice_id);
        return newMap;
      });
    }
  };

  const handleVoidClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowConfirmModal(true);
  };

  const handleConfirmVoid = async () => {
    if (!selectedInvoice) return;

    setVoidingInvoiceId(selectedInvoice.invoice_id);
    setShowConfirmModal(false);

    try {
      const response = await fetch(`/api/admin/invoices/${selectedInvoice.invoice_id}/void`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to void invoice: ${data.error}`);
        setVoidingInvoiceId(null);
        return;
      }

      // Update local state
      setInvoices(prev =>
        prev.map(inv =>
          inv.invoice_id === selectedInvoice.invoice_id
            ? { ...inv, payment_status: 'void' as const }
            : inv
        )
      );

      alert('Invoice voided successfully');
    } catch (error) {
      console.error('Error voiding invoice:', error);
      alert('An error occurred while voiding the invoice');
    } finally {
      setVoidingInvoiceId(null);
      setSelectedInvoice(null);
    }
  };

  // Filter invoices based on showVoidInvoices toggle
  const filteredInvoices = showVoidInvoices
    ? invoices
    : invoices.filter(inv => inv.payment_status !== 'void');

  return (
    <>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showVoidInvoices}
              onChange={(e) => setShowVoidInvoices(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show void invoices ({invoices.filter(inv => inv.payment_status === 'void').length})
          </label>
        </div>
        <button
          onClick={handleBulkSync}
          disabled={bulkSyncing}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {bulkSyncing ? 'Syncing...' : 'Sync All from Stripe'}
        </button>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Local Status</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Stripe Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => {
                const stripeStatus = stripeStatuses.get(invoice.invoice_id);
                return (
                  <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-900">
                        {invoice.invoice_number || invoice.invoice_id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/company/${invoice.company_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {invoice.company_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      £{invoice.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${invoice.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.payment_status === 'void'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                        {invoice.payment_status === 'paid' ? 'Paid' : invoice.payment_status === 'void' ? 'Void' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {stripeStatus?.loading ? (
                        <span className="text-xs text-gray-500">Checking...</span>
                      ) : stripeStatus?.stripe_status ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            stripeStatus.stripe_status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : stripeStatus.stripe_status === 'void'
                              ? 'bg-gray-100 text-gray-700'
                              : stripeStatus.stripe_status === 'open'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {stripeStatus.stripe_status}
                          </span>
                          {!stripeStatus.in_sync && (
                            <span className="text-xs text-red-600 font-semibold">Out of sync!</span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSyncStatus(invoice)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Check Status
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {invoice.invoice_url && (
                          <a
                            href={invoice.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </a>
                        )}
                        {stripeStatus?.stripe_status && stripeStatus.stripe_status !== 'open' ? (
                          <span className="text-xs text-gray-500">
                            Cannot void ({stripeStatus.stripe_status})
                          </span>
                        ) : invoice.payment_status !== 'void' && invoice.payment_status !== 'paid' && (
                          <button
                            onClick={() => handleVoidClick(invoice)}
                            disabled={voidingInvoiceId === invoice.invoice_id}
                            className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {voidingInvoiceId === invoice.invoice_id ? 'Voiding...' : 'Void'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Void Invoice?
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to void invoice <strong>{selectedInvoice.invoice_number || selectedInvoice.invoice_id.slice(0, 8)}</strong> for{' '}
              <strong>{selectedInvoice.company_name}</strong>?
            </p>
            <p className="text-sm text-gray-700 mb-4">
              Amount: <strong>£{selectedInvoice.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</strong>
            </p>
            <p className="text-xs text-red-600 mb-6">
              This action will void the invoice in Stripe and cannot be easily undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVoid}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Void Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
