/**
 * Universal Company Search - Quick navigation from anywhere
 * Shows in sidebar for instant access to any company
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  company_id: string;
  company_name: string;
  account_owner?: string;
}

export default function CompanySearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/companies/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setResults(data.companies || []);
        setShowResults(true);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigateToCompany(results[selectedIndex].company_id);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const navigateToCompany = (companyId: string) => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
    router.push(`/admin/company/${companyId}`);
  };

  const getOwnerColor = (owner?: string) => {
    const colors: Record<string, string> = {
      'Lee': 'text-red-600',
      'Callum': 'text-blue-600',
      'Steve': 'text-green-600',
      'jack_harris': 'text-purple-600',
    };
    return colors[owner || ''] || 'text-gray-600';
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setShowResults(true)}
          placeholder="Search companies... (⌘K)"
          className="w-full px-4 py-2 pl-10 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 placeholder-gray-400"
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
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {results.map((company, index) => (
            <button
              key={company.company_id}
              onClick={() => navigateToCompany(company.company_id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-semibold text-gray-900">{company.company_name}</div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-gray-500">{company.company_id}</span>
                {company.account_owner && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className={`font-medium ${getOwnerColor(company.account_owner)}`}>
                      {company.account_owner}
                    </span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchTerm && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500">
          No companies found for "{searchTerm}"
        </div>
      )}
    </div>
  );
}
