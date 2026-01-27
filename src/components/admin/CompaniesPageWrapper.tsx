'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AddCompanyModal from './modals/AddCompanyModal';
import { getViewModeLabel, type ViewMode } from '@/lib/viewMode';

interface Company {
  company_id: string;
  company_name: string;
  account_owner?: string;
  type?: string;
  country?: string;
  billing_city?: string;
  billing_postal_code?: string;
  billing_address_line_1?: string;
  last_invoice_at?: string;
  sage_customer_code?: string;
}

interface CompaniesPageWrapperProps {
  companies: Company[];
  totalCompanies: number;
  viewMode: ViewMode;
}

type SortField = 'company_name' | 'account_owner' | 'country' | 'billing_city' | 'last_invoice_at';
type SortDirection = 'asc' | 'desc';

export default function CompaniesPageWrapper({ companies, totalCompanies, viewMode }: CompaniesPageWrapperProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('company_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleAddSuccess = () => {
    // Refresh the page to show new company
    window.location.reload();
  };

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = companies.filter(company => {
        return (
          company.company_name?.toLowerCase().includes(term) ||
          company.company_id?.toLowerCase().includes(term) ||
          company.account_owner?.toLowerCase().includes(term) ||
          company.country?.toLowerCase().includes(term) ||
          company.billing_city?.toLowerCase().includes(term) ||
          company.billing_postal_code?.toLowerCase().includes(term) ||
          company.billing_address_line_1?.toLowerCase().includes(term) ||
          company.sage_customer_code?.toLowerCase().includes(term)
        );
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';

      if (sortField === 'last_invoice_at') {
        const aDate = aVal ? new Date(aVal as string).getTime() : 0;
        const bDate = bVal ? new Date(bVal as string).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }

      const comparison = aVal.toString().localeCompare(bVal.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [companies, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  function getLastOrderBadge(lastInvoiceAt?: string) {
    if (!lastInvoiceAt) {
      return { color: 'bg-gray-100 text-gray-700', label: 'Never ordered' };
    }

    const daysSince = Math.floor((Date.now() - new Date(lastInvoiceAt).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince > 365) return { color: 'bg-red-100 text-red-700', label: `${daysSince}d ago (Dormant)` };
    if (daysSince > 180) return { color: 'bg-orange-100 text-orange-700', label: `${daysSince}d ago (At Risk)` };
    if (daysSince > 90) return { color: 'bg-yellow-100 text-yellow-700', label: `${daysSince}d ago (Due Soon)` };
    return { color: 'bg-green-100 text-green-700', label: `${daysSince}d ago (Recent)` };
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Companies</h1>
        <p className="text-sm text-gray-800 mt-1">
          {filteredAndSortedCompanies.length} of {totalCompanies} companies • {getViewModeLabel(viewMode)}
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white rounded-lg border-2 border-blue-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies by name, location, owner, Sage code..."
              className="w-full px-4 py-2 pl-10 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-800">Sort by:</label>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="company_name">Company Name</option>
              <option value="account_owner">Owner</option>
              <option value="billing_city">City</option>
              <option value="country">Country</option>
              <option value="last_invoice_at">Last Order</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-bold bg-white hover:border-blue-500 hover:bg-blue-50"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-xl">+</span>
            Add Company
          </button>
        </div>
      </div>

      {/* Companies List */}
      <div className="space-y-3">
        {filteredAndSortedCompanies.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-700">
            {searchTerm ? `No companies match your search "${searchTerm}"` : 'No companies found'}
          </div>
        ) : (
          filteredAndSortedCompanies.map((company) => {
            const lastOrderBadge = getLastOrderBadge(company.last_invoice_at);

            return (
              <div key={company.company_id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Link
                          href={`/admin/company/${company.company_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {company.company_name}
                        </Link>
                        {company.sage_customer_code && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            Sage: {company.sage_customer_code}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {company.account_owner || 'Unassigned'} • {company.company_id.slice(0, 8)}
                      </div>
                    </div>
                    <Link
                      href={`/admin/company/${company.company_id}`}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-200">
                    {/* Location */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Location</div>
                      <div className="text-sm font-medium text-gray-900">
                        {company.billing_city || 'No city'}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {company.billing_postal_code || '-'} • {company.country || '-'}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Address</div>
                      <div className="text-sm text-gray-700">
                        {company.billing_address_line_1 || 'No address on file'}
                      </div>
                    </div>

                    {/* Last Order */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Last Order</div>
                      {company.last_invoice_at ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(company.last_invoice_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold mt-1 ${lastOrderBadge.color}`}>
                            {lastOrderBadge.label}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">Never ordered</div>
                      )}
                    </div>

                    {/* Account Owner */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Account Owner</div>
                      <div className="text-sm font-medium text-gray-900">
                        {company.account_owner || 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-3">
                    <div className="text-xs text-gray-500">
                      Company ID: {company.company_id}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/send-reorder?company_id=${company.company_id}`}
                        className="px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                      >
                        📧 Send Reorder
                      </Link>
                      <Link
                        href={`/admin/quote-builder/tools?company_id=${company.company_id}`}
                        className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                      >
                        🔧 Tools Quote
                      </Link>
                      <Link
                        href={`/admin/quote-builder/consumables?company_id=${company.company_id}`}
                        className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                      >
                        📦 Consumables Quote
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredAndSortedCompanies.length > 0 && (
        <div className="mt-4 text-sm text-gray-800 text-center">
          Showing {filteredAndSortedCompanies.length} companies {searchTerm && `matching "${searchTerm}"`}
        </div>
      )}

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
