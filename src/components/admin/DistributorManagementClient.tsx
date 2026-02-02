/**
 * Distributor Management Client
 * Bulk edit pricing tiers and send portal links
 */

'use client';

import { useState, useMemo } from 'react';

interface Distributor {
  sage_customer_code: string;
  company_id: string;
  company_name: string;
  country: string | null;
  pricing_tier: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  contacts: Array<{
    contact_id: string;
    email: string;
    full_name: string;
  }>;
  users: Array<{
    user_id: string;
    email: string;
    invitation_token: string | null;
  }>;
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
  const [sendingInvitations, setSendingInvitations] = useState(false);
  const [invitationStatus, setInvitationStatus] = useState<string | null>(null);

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

  // Send invitations to selected distributors
  const sendBulkInvitations = async () => {
    if (selectedCodes.size === 0) {
      alert('Please select distributors first');
      return;
    }

    setSendingInvitations(true);
    setInvitationStatus(null);

    try {
      const selectedDists = distributors.filter(d => selectedCodes.has(d.sage_customer_code));

      // Filter to only those with contacts and no users (or pending users)
      const invitations = selectedDists
        .filter(d => d.contacts.length > 0)
        .map(d => {
          // Get contacts without user accounts
          const existingEmails = new Set(d.users.map(u => u.email.toLowerCase()));
          const eligibleContacts = d.contacts
            .filter(c => c.email && !existingEmails.has(c.email.toLowerCase()))
            .map(c => ({
              email: c.email,
              full_name: c.full_name || c.email.split('@')[0]
            }));

          return {
            company_id: d.company_id,
            sage_customer_code: d.sage_customer_code,
            company_name: d.company_name,
            contacts: eligibleContacts
          };
        })
        .filter(inv => inv.contacts.length > 0);

      if (invitations.length === 0) {
        setInvitationStatus('✗ No eligible contacts found (all may already have accounts)');
        return;
      }

      const response = await fetch('/api/admin/distributors/send-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitations }),
      });

      const data = await response.json();

      if (response.ok) {
        const totalSent = data.results.reduce((sum: number, r: any) =>
          sum + r.contacts.filter((c: any) => c.success).length, 0
        );
        setInvitationStatus(`✓ Sent ${totalSent} invitations to ${invitations.length} companies`);

        // Refresh after 2 seconds
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setInvitationStatus(`✗ Failed to send invitations: ${data.error}`);
      }
    } catch (error) {
      console.error('Invitation error:', error);
      setInvitationStatus('✗ Failed to send invitations');
    } finally {
      setSendingInvitations(false);
    }
  };

  // Send invitation to single distributor
  const sendInvitation = async (dist: Distributor) => {
    if (dist.contacts.length === 0) {
      alert('This distributor has no contacts. Add contacts first.');
      return;
    }

    const existingEmails = new Set(dist.users.map(u => u.email.toLowerCase()));
    const eligibleContacts = dist.contacts
      .filter(c => c.email && !existingEmails.has(c.email.toLowerCase()))
      .map(c => ({
        email: c.email,
        full_name: c.full_name || c.email.split('@')[0]
      }));

    if (eligibleContacts.length === 0) {
      alert('All contacts already have distributor accounts');
      return;
    }

    setSendingInvitations(true);
    setInvitationStatus(null);

    try {
      const response = await fetch('/api/admin/distributors/send-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitations: [{
            company_id: dist.company_id,
            sage_customer_code: dist.sage_customer_code,
            company_name: dist.company_name,
            contacts: eligibleContacts
          }]
        }),
      });

      if (response.ok) {
        setInvitationStatus(`✓ Sent invitations to ${dist.company_name}`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setInvitationStatus(`✗ Failed to send invitations`);
      }
    } catch (error) {
      console.error('Invitation error:', error);
      setInvitationStatus('✗ Failed to send invitations');
    } finally {
      setSendingInvitations(false);
    }
  };

  // Get invitation status for a distributor
  const getInvitationStatus = (dist: Distributor) => {
    if (dist.users.length === 0) {
      return dist.contacts.length > 0 ? 'No users' : 'No contacts';
    }
    const pendingUsers = dist.users.filter(u => u.invitation_token).length;
    if (pendingUsers > 0) {
      return `${dist.users.length} users (${pendingUsers} pending)`;
    }
    return `${dist.users.length} active`;
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
                  onClick={sendBulkInvitations}
                  disabled={sendingInvitations}
                  className="px-3 py-1 text-sm bg-green-600 text-white border border-green-700 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {sendingInvitations ? 'Sending...' : 'Send Invitations'}
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {invitationStatus && (
              <div className={`p-3 rounded-lg text-sm ${
                invitationStatus.startsWith('✓')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {invitationStatus}
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
                    Users/Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
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
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {getInvitationStatus(dist)}
                          </div>
                          {dist.contacts.length > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {dist.contacts.length} contact{dist.contacts.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => sendInvitation(dist)}
                          disabled={sendingInvitations || dist.contacts.length === 0}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={dist.contacts.length === 0 ? 'No contacts to invite' : 'Send invitation to contacts'}
                        >
                          Send
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
