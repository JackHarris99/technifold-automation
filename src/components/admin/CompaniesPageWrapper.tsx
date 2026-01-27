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
}

interface CompaniesPageWrapperProps {
  companies: Company[];
  totalCompanies: number;
  viewMode: ViewMode;
}

type SortField = 'company_name' | 'account_owner' | 'country' | 'billing_city' | 'billing_postal_code' | 'last_invoice_at';
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
          company.billing_address_line_1?.toLowerCase().includes(term)
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Companies</h1>
          <p className="text-gray-800 mt-2">
            {filteredAndSortedCompanies.length} of {totalCompanies} companies • {getViewModeLabel(viewMode)}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Company
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search companies by name, location, owner..."
            className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
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
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!companies || companies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-700 mb-4">No companies found.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Add Your First Company
          </button>
        </div>
      ) : filteredAndSortedCompanies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-700 mb-4">No companies match your search &quot;{searchTerm}&quot;</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('company_name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Company <SortIcon field="company_name" />
                  </th>
                  <th
                    onClick={() => handleSort('account_owner')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Owner <SortIcon field="account_owner" />
                  </th>
                  <th
                    onClick={() => handleSort('billing_city')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    City <SortIcon field="billing_city" />
                  </th>
                  <th
                    onClick={() => handleSort('billing_postal_code')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Postcode <SortIcon field="billing_postal_code" />
                  </th>
                  <th
                    onClick={() => handleSort('country')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Country <SortIcon field="country" />
                  </th>
                  <th
                    onClick={() => handleSort('last_invoice_at')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Last Invoice <SortIcon field="last_invoice_at" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCompanies.map((company) => (
                  <tr key={company.company_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                      <div className="text-xs text-gray-500">{company.company_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{company.account_owner || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{company.billing_city || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{company.billing_postal_code || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{company.country || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.last_invoice_at ? (
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-700">
                            {new Date(company.last_invoice_at).toLocaleDateString('en-GB')}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            (() => {
                              const daysSince = Math.floor((Date.now() - new Date(company.last_invoice_at).getTime()) / (1000 * 60 * 60 * 24));
                              if (daysSince > 365) return 'bg-red-100 text-red-700';
                              if (daysSince > 180) return 'bg-orange-100 text-orange-700';
                              if (daysSince > 90) return 'bg-yellow-100 text-yellow-700';
                              return 'bg-green-100 text-green-700';
                            })()
                          }`}>
                            {(() => {
                              const daysSince = Math.floor((Date.now() - new Date(company.last_invoice_at).getTime()) / (1000 * 60 * 60 * 24));
                              return `${daysSince}d ago`;
                            })()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Never</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/company/${company.company_id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
