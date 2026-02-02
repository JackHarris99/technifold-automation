/**
 * Distributor Management Client
 * Bulk edit pricing tiers and send portal links
 */

'use client';

import { useState, useMemo } from 'react';

interface Distributor {
  sage_customer_code: string;
  company_name: string;
  country: string | null;
  pricing_tier: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  distributors: Distributor[];
}

const PRICING_TIERS = [
  { value: 'tier_1', label: 'Tier 1 (40% off)', color: 'bg-green-100 text-green-800' },
  { value: 'tier_2', label: 'Tier 2 (30% off)', color: 'bg-blue-100 text-blue-800' },
  { value: 'tier_3', label: 'Tier 3 (20% off)', color: 'bg-orange-100 text-orange-800' },
];

export default function DistributorManagementClient({ distributors: initialDistributors }: Props) {
  const [distributors, setDistributors] = useState<Distributor[]>(initialDistributors);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof Distributor>('company_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [modifiedCodes, setModifiedCodes] = useState<Set<string>>(new Set());
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Get unique countries
  const allCountries = useMemo(() => {
    const countrySet = new Set<string>();
    distributors.forEach((d) => {
      if (d.country) {
        countrySet.add(d.country);
      }
    });
    return Array.from(countrySet).sort();
  }, [distributors]);

  // Sort handler
  const handleSort = (column: keyof Distributor) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort
  const filteredDistributors = useMemo(() => {
    let filtered = [...distributors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.sage_customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (d.country && d.country.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Tier filter
    if (tierFilter) {
      filtered = filtered.filter((d) => d.pricing_tier === tierFilter);
    }

    // Country filter
    if (countryFilter) {
      filtered = filtered.filter((d) => d.country === countryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [distributors, searchTerm, tierFilter, countryFilter, sortColumn, sortDirection]);

  // Update tier
  const updateTier = (code: string, tier: string) => {
    setDistributors((prev) =>
      prev.map((d) =>
        d.sage_customer_code === code ? { ...d, pricing_tier: tier } : d
      )
    );
    setModifiedCodes((prev) => new Set(prev).add(code));
  };

  // Bulk update tiers
  const bulkUpdateTier = async (tier: string) => {
    if (selectedCodes.size === 0) {
      alert('Please select distributors first');
      return;
    }

    selectedCodes.forEach((code) => {
      updateTier(code, tier);
    });
  };

  // Save changes
  const saveChanges = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const modifiedDistributors = distributors.filter((d) =>
        modifiedCodes.has(d.sage_customer_code)
      );

      const response = await fetch('/api/admin/distributors/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributors: modifiedDistributors }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      setSaveStatus(`✓ Saved ${modifiedDistributors.length} distributors successfully`);
      setModifiedCodes(new Set());
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('✗ Failed to save changes');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Toggle selection
  const toggleSelect = (code: string) => {
    setSelectedCodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }
      return newSet;
    });
  };

  // Select all filtered
  const selectAll = () => {
    setSelectedCodes(new Set(filteredDistributors.map((d) => d.sage_customer_code)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedCodes(new Set());
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setTierFilter('');
    setCountryFilter('');
  };

  // Get portal URL
  const getPortalUrl = (code: string) => {
    return `${window.location.origin}/portal/distributor/${code}`;
  };

  // Copy portal link
  const copyPortalLink = (code: string) => {
    const url = getPortalUrl(code);
    navigator.clipboard.writeText(url);
    alert('Portal link copied to clipboard!');
  };

  // Copy all selected links
  const copySelectedLinks = () => {
    const links = Array.from(selectedCodes)
      .map((code) => {
        const dist = distributors.find((d) => d.sage_customer_code === code);
        return `${dist?.company_name}: ${getPortalUrl(code)}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(links);
    alert(`Copied ${selectedCodes.size} portal links!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Distributor Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage pricing tiers and portal access
                {modifiedCodes.size > 0 && (
                  <span className="ml-2 text-orange-600 font-medium">
                    ({modifiedCodes.size} modified)
                  </span>
                )}
                {selectedCodes.size > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({selectedCodes.size} selected)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {saveStatus && (
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    saveStatus.startsWith('✓')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {saveStatus}
                </div>
              )}
              <button
                onClick={saveChanges}
                disabled={saving || modifiedCodes.size === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  modifiedCodes.size > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? 'Saving...' : `Save Changes (${modifiedCodes.size})`}
              </button>
            </div>
          </div>

          {/* Search and Bulk Actions */}
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Search by company name, code, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {selectedCodes.size > 0 && (
              <div className="flex gap-2 items-center bg-blue-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  Bulk actions for {selectedCodes.size} selected:
                </span>
                {PRICING_TIERS.map((tier) => (
                  <button
                    key={tier.value}
                    onClick={() => bulkUpdateTier(tier.value)}
                    className="px-3 py-1 text-sm bg-white border border-blue-300 rounded hover:bg-blue-100 transition-colors"
                  >
                    Set to {tier.label}
                  </button>
                ))}
                <button
                  onClick={copySelectedLinks}
                  className="px-3 py-1 text-sm bg-white border border-blue-300 rounded hover:bg-blue-100 transition-colors"
                >
                  Copy Portal Links
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Select All ({filteredDistributors.length})
              </button>
              {(tierFilter || countryFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Distributors Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCodes.size === filteredDistributors.length && filteredDistributors.length > 0}
                      onChange={selectedCodes.size === filteredDistributors.length ? clearSelection : selectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('company_name')}
                  >
                    <div className="flex items-center gap-1">
                      Company Name
                      {sortColumn === 'company_name' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('sage_customer_code')}
                  >
                    <div className="flex items-center gap-1">
                      Code
                      {sortColumn === 'sage_customer_code' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('country')}
                  >
                    <div className="flex items-center gap-1">
                      Country
                      {sortColumn === 'country' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('pricing_tier')}
                  >
                    <div className="flex items-center gap-1">
                      Pricing Tier
                      {sortColumn === 'pricing_tier' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Portal Link
                  </th>
                </tr>
                {/* Filter Row */}
                <tr className="bg-white">
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2">
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Countries</option>
                      {allCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="px-4 py-2">
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Tiers</option>
                      {PRICING_TIERS.map((tier) => (
                        <option key={tier.value} value={tier.value}>
                          {tier.label}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDistributors.map((dist) => {
                  const tierInfo = PRICING_TIERS.find((t) => t.value === dist.pricing_tier);
                  return (
                    <tr
                      key={dist.sage_customer_code}
                      className={`hover:bg-gray-50 transition-colors ${
                        modifiedCodes.has(dist.sage_customer_code) ? 'bg-orange-50' : ''
                      } ${
                        selectedCodes.has(dist.sage_customer_code) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCodes.has(dist.sage_customer_code)}
                          onChange={() => toggleSelect(dist.sage_customer_code)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{dist.company_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-gray-600">
                          {dist.sage_customer_code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{dist.country || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={dist.pricing_tier || ''}
                          onChange={(e) =>
                            updateTier(dist.sage_customer_code, e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          {PRICING_TIERS.map((tier) => (
                            <option key={tier.value} value={tier.value}>
                              {tier.label}
                            </option>
                          ))}
                        </select>
                        {tierInfo && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${tierInfo.color}`}>
                            {tierInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyPortalLink(dist.sage_customer_code)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        >
                          Copy Link
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDistributors.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No distributors found matching your search
            </div>
          )}

          {filteredDistributors.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              Showing {filteredDistributors.length} distributors
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
