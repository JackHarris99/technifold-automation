/**
 * Quote Requests Table
 * Interactive table for managing quote requests
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuoteRequest {
  quote_request_id: string;
  company_id: string;
  contact_id: string;
  machine_slug?: string;
  status: string;
  source: string;
  assigned_to?: string;
  notes?: string;
  marketing_token?: string;
  quote_token?: string;
  lost_reason?: string;
  won_amount?: number;
  created_at: string;
  updated_at: string;
  quote_sent_at?: string;
  closed_at?: string;
  companies: {
    company_id: string;
    company_name: string;
    country: string;
  };
  contacts: {
    contact_id: string;
    email: string;
    full_name?: string;
    first_name?: string;
  };
}

interface QuoteRequestsTableProps {
  initialData: QuoteRequest[];
}

export default function QuoteRequestsTable({ initialData }: QuoteRequestsTableProps) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(initialData);
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');

  // Filter quote requests
  const filteredRequests = quoteRequests.filter(request => {
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    if (assignedToFilter !== 'all' && request.assigned_to !== assignedToFilter) return false;
    return true;
  });

  // Get unique assigned_to values
  const assignedToOptions = Array.from(
    new Set(quoteRequests.map(r => r.assigned_to).filter(Boolean))
  );

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'quote_sent': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'too_soon': return 'bg-orange-100 text-orange-800';
      case 'not_ready': return 'bg-gray-100 text-gray-800';
      case 'too_expensive': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-800 block mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="requested">New Requests</option>
            <option value="quote_sent">Quotes Sent</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="too_soon">Too Soon</option>
            <option value="not_ready">Not Ready</option>
            <option value="too_expensive">Too Expensive</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-800 block mb-1">Assigned To</label>
          <select
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Reps</option>
            {assignedToOptions.map(rep => (
              <option key={rep} value={rep}>{rep}</option>
            ))}
            <option value="">Unassigned</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-800 self-end pb-2">
          Showing {filteredRequests.length} of {quoteRequests.length} requests
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">Machine</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">Assigned</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-700">
                  No quote requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.quote_request_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/company/${request.company_id}`}
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {request.companies.company_name}
                    </Link>
                    <div className="text-xs text-gray-700">{request.company_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{request.contacts.full_name || request.contacts.first_name || 'No name'}</div>
                    <div className="text-xs text-gray-700">{request.contacts.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{request.machine_slug || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {formatStatus(request.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-800">{formatStatus(request.source)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{request.assigned_to || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-800">{formatDate(request.created_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {request.status === 'requested' && (
                        <Link
                          href={`/admin/quote-builder-v2?request_id=${request.quote_request_id}`}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Build Quote
                        </Link>
                      )}
                      {request.quote_token && (
                        <a
                          href={`/q/${request.quote_token}`}
                          target="_blank"
                          className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
