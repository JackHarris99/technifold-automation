'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  quote: any;
  lineItems: any[];
  user: any;
}

export default function TechnicreaseQuoteApprovalClient({ quote, lineItems, user }: Props) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  async function approveQuote() {
    if (!confirm('Approve this TechniCrease quote and generate invoice?')) {
      return;
    }

    setApproving(true);
    try {
      const response = await fetch(`/api/admin/technicrease-quotes/${quote.quote_id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('✓ Quote approved and invoice generated!');
        router.push('/admin/technicrease-quotes');
      } else {
        alert('Failed to approve quote: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error approving quote');
      console.error(err);
    } finally {
      setApproving(false);
    }
  }

  async function rejectQuote() {
    const reason = prompt('Reason for rejection (will be sent to customer):');
    if (!reason) return;

    setRejecting(true);
    try {
      const response = await fetch(`/api/admin/technicrease-quotes/${quote.quote_id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✓ Quote rejected');
        router.push('/admin/technicrease-quotes');
      } else {
        alert('Failed to reject quote: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error rejecting quote');
      console.error(err);
    } finally {
      setRejecting(false);
    }
  }

  const isPending = quote.approval_status === 'pending_approval';
  const isApproved = quote.approval_status === 'approved';
  const isRejected = quote.approval_status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-orange-600 hover:text-orange-700 font-semibold mb-4"
          >
            ← Back to Quotes
          </button>
          <h1 className="text-3xl font-bold text-gray-900">TechniCrease Quote Review</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-gray-600">Quote ID: {quote.quote_id}</span>
            {isPending && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                Pending Review
              </span>
            )}
            {isApproved && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                Approved
              </span>
            )}
            {isRejected && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                Rejected
              </span>
            )}
          </div>
        </div>

        {/* Company & Contact Info */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Company</h3>
              <p className="text-gray-900">{quote.companies.company_name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {quote.companies.billing_address_line_1}
                {quote.companies.billing_city && `, ${quote.companies.billing_city}`}
                {quote.companies.billing_postal_code && ` ${quote.companies.billing_postal_code}`}
              </p>
              <p className="text-sm text-gray-600">
                {quote.companies.billing_country}
              </p>
              {quote.companies.vat_number && (
                <p className="text-sm text-gray-600 mt-1">VAT: {quote.companies.vat_number}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Contact</h3>
              <p className="text-gray-900">{quote.contacts.full_name}</p>
              <p className="text-sm text-gray-600">{quote.contacts.email}</p>
              {quote.contacts.phone && (
                <p className="text-sm text-gray-600">{quote.contacts.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 text-gray-900">{new Date(quote.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Accepted:</span>
              <span className="ml-2 text-gray-900">{new Date(quote.accepted_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Quote Type:</span>
              <span className="ml-2 text-gray-900 capitalize">{quote.quote_type}</span>
            </div>
            <div>
              <span className="text-gray-600">Free Shipping:</span>
              <span className="ml-2 text-gray-900">{quote.free_shipping ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Line Items */}
          <h3 className="font-semibold text-gray-700 mb-3">Products</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lineItems.map((item: any) => (
                  <tr key={item.line_number}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.description}</div>
                      <div className="text-xs text-gray-500">{item.product_code}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      £{item.unit_price.toLocaleString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      £{(item.quantity * item.unit_price).toLocaleString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">
                    Subtotal:
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    £{quote.subtotal.toLocaleString('en-GB')}
                  </td>
                </tr>
                {quote.discount_amount > 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-gray-700">
                      Discount:
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      -£{quote.discount_amount.toLocaleString('en-GB')}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 text-lg">
                    £{quote.total_amount.toLocaleString('en-GB')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Approval Actions */}
        {isPending && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Actions</h2>
            <div className="flex gap-4">
              <button
                onClick={approveQuote}
                disabled={approving}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {approving ? 'Approving...' : '✓ Approve & Generate Invoice'}
              </button>
              <button
                onClick={rejectQuote}
                disabled={rejecting}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejecting ? 'Rejecting...' : '✗ Reject Quote'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
