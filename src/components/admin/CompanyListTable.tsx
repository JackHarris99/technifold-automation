/**
 * Company List Table
 * Sortable, color-coded by sales rep
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const REP_COLORS: Record<string, string> = {
  'Lee': 'border-red-500 bg-red-50',
  'Callum': 'border-blue-500 bg-blue-50',
  'Steve': 'border-green-500 bg-green-50',
  'jack_harris': 'border-purple-500 bg-purple-50',
};

export default function CompanyListTable() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'orders' | 'last_order'>('value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/companies/with-metrics');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = companies.filter(c => {
    if (filter === 'all') return true;
    return c.account_owner === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'name':
        aVal = a.company_name || '';
        bVal = b.company_name || '';
        break;
      case 'value':
        aVal = a.lifetime_value || 0;
        bVal = b.lifetime_value || 0;
        break;
      case 'orders':
        aVal = a.order_count || 0;
        bVal = b.order_count || 0;
        break;
      case 'last_order':
        aVal = a.last_order || '';
        bVal = b.last_order || '';
        break;
    }

    const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return sortDir === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return <div className="text-center py-12">Loading companies...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Reps ({companies.length})</option>
          <option value="Lee">🔴 Lee</option>
          <option value="Callum">🔵 Callum</option>
          <option value="Steve">🟢 Steve</option>
          <option value="jack_harris">🟣 Jack Harris</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="value">Sort by Value</option>
          <option value="orders">Sort by Orders</option>
          <option value="last_order">Sort by Last Order</option>
          <option value="name">Sort by Name</option>
        </select>

        <button
          onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          {sortDir === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {sorted.map((company) => {
          const colorClass = REP_COLORS[company.account_owner || ''] || 'border-gray-300';
          const repName = company.account_owner || 'Unassigned';

          return (
            <Link
              key={company.company_id}
              href={`/admin/company/${company.company_id}`}
              className={`block bg-white border-l-4 rounded-lg shadow hover:shadow-lg transition-all p-4 ${colorClass}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-900">{company.company_name}</div>
                  <div className="text-sm text-gray-600">{company.company_id} • Owner: {repName}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900">£{(company.lifetime_value || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{company.order_count || 0} orders</div>
                  {company.last_order && (
                    <div className="text-xs text-gray-500">Last: {company.last_order}</div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No companies found
        </div>
      )}
    </div>
  );
}
