/**
 * Company Quick Find - Search and select company
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  company_id: string;
  company_name: string;
  account_owner: string | null;
}

export default function CompanyQuickFind({ recentCompanies }: { recentCompanies: Company[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/admin/companies/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      setSearchResults(data.companies || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectCompany = (companyId: string) => {
    router.push(`/admin/company/${companyId}`);
  };

  const displayResults = searchTerm.length >= 2 ? searchResults : recentCompanies;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
      {/* Search */}
      <div className="mb-6">
        <label htmlFor="company-search" className="block text-sm font-bold text-gray-900 mb-3">
          Search Companies
        </label>
        <div className="relative">
          <input
            type="text"
            id="company-search"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type company name..."
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          {searching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          {searchTerm.length >= 2 ? 'Search Results' : 'Recently Updated'}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {displayResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm.length >= 2 ? 'No companies found' : 'Start typing to search'}
            </div>
          ) : (
            displayResults.map((company) => (
              <button
                key={company.company_id}
                onClick={() => selectCompany(company.company_id)}
                className="w-full px-5 py-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{company.company_name}</div>
                    <div className="text-sm text-gray-500 mt-1">{company.company_id}</div>
                  </div>
                  {company.account_owner && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {company.account_owner}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
