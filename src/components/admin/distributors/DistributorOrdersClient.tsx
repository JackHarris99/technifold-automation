/**
 * Distributor Orders Client Component
 * Interactive table for viewing all distributor orders
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OrderItem {
  order_id: string;
  po_number: string | null;
  created_at: string;
  status: string;
  total_amount: number;
  currency: string;
  approved_at: string | null;
  approved_by: string | null;
  companies: {
    company_id: string;
    company_name: string;
    sage_customer_code: string | null;
  } | null;
  users: {
    full_name: string;
  } | null;
}

interface Props {
  orders: OrderItem[];
}

export default function DistributorOrdersClient({ orders }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.companies?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.companies?.sage_customer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by company, PO number, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Distributor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                PO Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Approved By
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-700">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {order.order_id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.companies?.company_name || 'Unknown'}
                    </div>
                    {order.companies?.sage_customer_code && (
                      <div className="text-xs text-gray-600">
                        {order.companies.sage_customer_code}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.po_number || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {order.currency === 'GBP' ? '£' : order.currency}
                      {order.total_amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.users?.full_name ? (
                      <div className="text-sm text-gray-900">{order.users.full_name}</div>
                    ) : (
                      <div className="text-sm text-gray-500">—</div>
                    )}
                    {order.approved_at && (
                      <div className="text-xs text-gray-600">
                        {new Date(order.approved_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/distributors/orders/${order.order_id}`}
                      className="text-teal-600 hover:text-teal-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Total Orders:</span>{' '}
              <span className="text-gray-700">{orders.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Pending:</span>{' '}
              <span className="text-orange-600">
                {orders.filter((o) => o.status === 'pending').length}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Approved:</span>{' '}
              <span className="text-green-600">
                {orders.filter((o) => o.status === 'approved').length}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Rejected:</span>{' '}
              <span className="text-red-600">
                {orders.filter((o) => o.status === 'rejected').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
