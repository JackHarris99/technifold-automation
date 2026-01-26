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
  reviewed_at: string | null;
  reviewed_by: string | null;
  billing_address_line_1: string | null;
  billing_address_line_2: string | null;
  billing_city: string | null;
  billing_state_province: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  vat_number: string | null;
  shipping_address_line_1: string | null;
  shipping_address_line_2: string | null;
  shipping_city: string | null;
  shipping_state_province: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  companies: {
    company_id: string;
    company_name: string;
    sage_customer_code: string | null;
    distributor_email: string | null;
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
      case 'pending_review':
        return 'bg-orange-100 text-orange-800';
      case 'fully_fulfilled':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'Pending Review';
      case 'fully_fulfilled':
        return 'Fulfilled';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
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
              {formatStatus(order.status)}
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
      {order.reviewed_at && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Review History</h2>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${order.status === 'fully_fulfilled' ? 'text-green-700' : 'text-gray-700'}`}>
                Reviewed
              </span>
            </div>
            <p className="text-sm text-gray-700">
              By {order.reviewed_by || 'Unknown'} on{' '}
              {new Date(order.reviewed_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
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

      {/* Billing and Shipping Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billing Address */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
          <div className="text-sm text-gray-900 space-y-1">
            <p className="font-medium">{order.companies?.company_name}</p>
            {order.billing_address_line_1 && <p>{order.billing_address_line_1}</p>}
            {order.billing_address_line_2 && <p>{order.billing_address_line_2}</p>}
            {order.billing_city && (
              <p>
                {order.billing_city}
                {order.billing_state_province && `, ${order.billing_state_province}`}
              </p>
            )}
            {order.billing_postal_code && <p>{order.billing_postal_code}</p>}
            {order.billing_country && <p><strong>{order.billing_country}</strong></p>}
            {order.vat_number && (
              <p className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-700">VAT: </span>
                <span className="font-mono">{order.vat_number}</span>
              </p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <div className="text-sm text-gray-900 space-y-1">
            <p className="font-medium">{order.companies?.company_name}</p>
            {order.shipping_address_line_1 && <p>{order.shipping_address_line_1}</p>}
            {order.shipping_address_line_2 && <p>{order.shipping_address_line_2}</p>}
            {order.shipping_city && (
              <p>
                {order.shipping_city}
                {order.shipping_state_province && `, ${order.shipping_state_province}`}
              </p>
            )}
            {order.shipping_postal_code && <p>{order.shipping_postal_code}</p>}
            {order.shipping_country && <p><strong>{order.shipping_country}</strong></p>}
          </div>
        </div>
      </div>
    </div>
  );
}
