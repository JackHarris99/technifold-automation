/**
 * Company Selector with Typeahead
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface Company {
  company_id: string;
  company_name: string;
  account_owner: string | null;
}

interface CompanySelectorProps {
  currentCompanyId: string;
  currentCompanyName: string;
  onCompanySelect: (companyId: string) => void;
}

export default function CompanySelector({
  currentCompanyId,
  currentCompanyName,
  onCompanySelect
}: CompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setCompanies([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/companies/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setCompanies(data.companies || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Company search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <input
          type="text"
          placeholder={currentCompanyName}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && companies.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
          {companies.map((comp) => (
            <button
              key={comp.company_id}
              onClick={() => {
                onCompanySelect(comp.company_id);
                setSearchTerm('');
                setShowDropdown(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-semibold text-gray-900">{comp.company_name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{comp.company_id}</span>
                {comp.account_owner && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600">
                      {comp.account_owner}
                    </span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
}
