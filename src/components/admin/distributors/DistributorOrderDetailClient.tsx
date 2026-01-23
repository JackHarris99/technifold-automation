/**
 * Distributor Order Detail Client Component
 * Display and manage individual distributor order
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  product_code: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  order_id: string;
  po_number: string | null;
  created_at: string;
  status: string;
  total_amount: number;
  currency: string;
  notes: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  companies: {
    company_id: string;
    company_name: string;
    sage_customer_code: string | null;
    distributor_email: string | null;
    phone: string | null;
    billing_address: string | null;
    billing_city: string | null;
    billing_postcode: string | null;
    billing_country: string | null;
  } | null;
  approved_by_user: {
    full_name: string;
    email: string;
  } | null;
  rejected_by_user: {
    full_name: string;
    email: string;
  } | null;
}

interface Props {
  order: Order;
  orderItems: OrderItem[];
  currentUserId: string;
}

export default function DistributorOrderDetailClient({
  order,
  orderItems,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  // Get status badge classes
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle approve order
  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this order?')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/distributors/orders/${order.order_id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved_by: currentUserId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve order');
      }

      router.refresh();
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject order
  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejecting this order:');
    if (!reason) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/distributors/orders/${order.order_id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason, rejected_by: currentUserId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject order');
      }

      router.refresh();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-teal-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                order.status
              )}`}
            >
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Order Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-700">Order ID</dt>
                  <dd className="text-sm font-mono text-gray-900">{order.order_id}</dd>
                </div>
                {order.po_number && (
                  <div>
                    <dt className="text-sm text-gray-700">PO Number</dt>
                    <dd className="text-sm text-gray-900">{order.po_number}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-700">Order Date</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-700">Total Amount</dt>
                  <dd className="text-lg font-bold text-gray-900">
                    {order.currency === 'GBP' ? '£' : order.currency}
                    {order.total_amount.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Distributor Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-700">Company</dt>
                  <dd className="text-sm text-gray-900">
                    {order.companies?.company_name || 'Unknown'}
                  </dd>
                </div>
                {order.companies?.sage_customer_code && (
                  <div>
                    <dt className="text-sm text-gray-700">Customer Code</dt>
                    <dd className="text-sm text-gray-900">
                      {order.companies.sage_customer_code}
                    </dd>
                  </div>
                )}
                {order.companies?.distributor_email && (
                  <div>
                    <dt className="text-sm text-gray-700">Email</dt>
                    <dd className="text-sm text-gray-900">
                      {order.companies.distributor_email}
                    </dd>
                  </div>
                )}
                {order.companies?.phone && (
                  <div>
                    <dt className="text-sm text-gray-700">Phone</dt>
                    <dd className="text-sm text-gray-900">{order.companies.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Order Notes</h3>
              <p className="text-sm text-gray-900">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Information */}
      {(order.approved_at || order.rejected_at) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
          {order.approved_at && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-green-700">✓ Approved</span>
              </div>
              <p className="text-sm text-gray-700">
                By {order.approved_by_user?.full_name || 'Unknown'} on{' '}
                {new Date(order.approved_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
          {order.rejected_at && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-red-700">✗ Rejected</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                By {order.rejected_by_user?.full_name || 'Unknown'} on{' '}
                {new Date(order.rejected_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {order.rejection_reason && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Reason: </span>
                    {order.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Items ({orderItems.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Product Code
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.product_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{item.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      £{item.unit_price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      £{(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Total:
                </td>
                <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                  £{order.total_amount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions (only for pending orders) */}
      {order.status === 'pending' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Reject Order'}
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Approve Order'}
            </button>
          </div>
        </div>
      )}

      {/* Billing Address */}
      {order.companies && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
          <div className="text-sm text-gray-900 space-y-1">
            <p>{order.companies.company_name}</p>
            {order.companies.billing_address && <p>{order.companies.billing_address}</p>}
            {order.companies.billing_city && <p>{order.companies.billing_city}</p>}
            {order.companies.billing_postcode && <p>{order.companies.billing_postcode}</p>}
            {order.companies.billing_country && <p>{order.companies.billing_country}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
