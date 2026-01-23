/**
 * Distributor Companies Client Component
 * Interactive table for managing distributor companies
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Distributor {
  company_id: string;
  company_name: string;
  sage_customer_code: string | null;
  country: string | null;
  account_opened_at: string | null;
  status: string | null;
  distributor_email: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  distributors: Distributor[];
}

export default function DistributorCompaniesClient({ distributors }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter distributors
  const filteredDistributors = distributors.filter(dist => {
    const matchesSearch = dist.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.sage_customer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.distributor_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && dist.status === 'active') ||
      (statusFilter === 'inactive' && dist.status !== 'active');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search distributors..."
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
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          Showing {filteredDistributors.length} of {distributors.length} distributors
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Account Opened
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDistributors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-700">
                  No distributors found
                </td>
              </tr>
            ) : (
              filteredDistributors.map((dist) => (
                <tr key={dist.company_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{dist.company_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dist.sage_customer_code || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dist.distributor_email || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dist.country || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dist.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dist.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {dist.account_opened_at
                      ? new Date(dist.account_opened_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/company/${dist.company_id}`}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/distributors/custom-pricing?company_id=${dist.company_id}`}
                        className="text-gray-800 hover:text-gray-900"
                      >
                        Pricing
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      {distributors.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Total Distributors:</span>{' '}
              <span className="text-gray-700">{distributors.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Active:</span>{' '}
              <span className="text-green-600">{distributors.filter(d => d.status === 'active').length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Inactive:</span>{' '}
              <span className="text-gray-600">{distributors.filter(d => d.status !== 'active').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
