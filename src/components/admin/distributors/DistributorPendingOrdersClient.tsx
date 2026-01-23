/**
 * Distributor Pending Orders Client Component
 * Interactive component for reviewing and approving/rejecting distributor orders
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
  total_amount: number;
  currency: string;
  notes: string | null;
  companies: {
    company_id: string;
    company_name: string;
    sage_customer_code: string | null;
    distributor_email: string | null;
  } | null;
  items: OrderItem[];
}

interface Props {
  orders: Order[];
  currentUserId: string;
}

export default function DistributorPendingOrdersClient({ orders, currentUserId }: Props) {
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders
  const filteredOrders = orders.filter((order) =>
    order.companies?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.companies?.sage_customer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.po_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle approve order
  const handleApprove = async (orderId: string) => {
    if (!confirm('Are you sure you want to approve this order?')) {
      return;
    }

    setProcessing(orderId);
    try {
      const response = await fetch(`/api/admin/distributors/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: currentUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve order');
      }

      router.refresh();
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  // Handle reject order
  const handleReject = async (orderId: string) => {
    const reason = prompt('Please provide a reason for rejecting this order:');
    if (!reason) {
      return;
    }

    setProcessing(orderId);
    try {
      const response = await fetch(`/api/admin/distributors/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, rejected_by: currentUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject order');
      }

      router.refresh();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <input
          type="text"
          placeholder="Search by company, PO number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <div className="mt-2 text-sm text-gray-700">
          Showing {filteredOrders.length} of {orders.length} pending orders
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-500 text-lg">
            {orders.length === 0 ? 'No pending orders' : 'No orders match your search'}
          </div>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div key={order.order_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.companies?.company_name || 'Unknown Distributor'}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Pending
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-700">Order ID:</span>{' '}
                      <span className="font-mono text-gray-900">
                        {order.order_id.slice(0, 8)}...
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-700">Date:</span>{' '}
                      <span className="text-gray-900">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {order.po_number && (
                      <div>
                        <span className="text-gray-700">PO Number:</span>{' '}
                        <span className="text-gray-900">{order.po_number}</span>
                      </div>
                    )}
                    {order.companies?.sage_customer_code && (
                      <div>
                        <span className="text-gray-700">Customer Code:</span>{' '}
                        <span className="text-gray-900">{order.companies.sage_customer_code}</span>
                      </div>
                    )}
                    {order.companies?.distributor_email && (
                      <div>
                        <span className="text-gray-700">Email:</span>{' '}
                        <span className="text-gray-900">{order.companies.distributor_email}</span>
                      </div>
                    )}
                  </div>
                  {order.notes && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-700 font-medium">Notes:</span>{' '}
                      <span className="text-gray-900">{order.notes}</span>
                    </div>
                  )}
                </div>
                <div className="text-right ml-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {order.currency === 'GBP' ? '£' : order.currency}
                    {order.total_amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Toggle */}
            <div className="border-b border-gray-200">
              <button
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)
                }
                className="w-full px-6 py-3 text-left text-sm font-medium text-teal-600 hover:text-teal-800 hover:bg-gray-50"
              >
                {expandedOrder === order.order_id ? '▼' : '►'} View Order Items (
                {order.items.length})
              </button>
            </div>

            {/* Order Items Table */}
            {expandedOrder === order.order_id && (
              <div className="p-6 bg-gray-50">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                        Product Code
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase">
                        Quantity
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase">
                        Unit Price
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900">
                          {item.product_code}
                        </td>
                        <td className="px-3 py-3 text-sm text-right text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-3 text-sm text-right text-gray-900">
                          £{item.unit_price.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-sm text-right font-semibold text-gray-900">
                          £{(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => handleReject(order.order_id)}
                disabled={processing === order.order_id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === order.order_id ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(order.order_id)}
                disabled={processing === order.order_id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === order.order_id ? 'Processing...' : 'Approve Order'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
