/**
 * Company Category Management Table
 * Quick dropdown categorization for territory prep
 */

'use client';

import { useState, useEffect } from 'react';

export default function CategoryTable({ companies: initialCompanies }: { companies: any[] }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    setLoading(true);
    try {
      // Fetch with metrics
      const response = await fetch('/api/admin/companies/with-metrics');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateCategory(companyId: string, newCategory: string) {
    try {
      await fetch('/api/admin/companies/update-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, category: newCategory })
      });

      // Update local state
      setCompanies(prev =>
        prev.map(c => c.company_id === companyId ? { ...c, category: newCategory } : c)
      );
    } catch (error) {
      alert('Failed to update category');
    }
  }

  const filtered = companies.filter(c => {
    if (filter !== 'all' && c.category !== filter) return false;
    if (search && !c.company_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    customer: companies.filter(c => c.category === 'customer').length,
    prospect: companies.filter(c => c.category === 'prospect').length,
    distributor: companies.filter(c => c.category === 'distributor').length,
    uncategorized: companies.filter(c => !c.category).length
  };

  if (loading) {
    return <div className="text-center py-12">Loading companies...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All ({companies.length})</option>
            <option value="customer">Customers ({stats.customer})</option>
            <option value="prospect">Prospects ({stats.prospect})</option>
            <option value="distributor">Distributors ({stats.distributor})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Lifetime Value</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((company) => (
                <tr key={company.company_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                    <div className="text-sm text-gray-500">{company.company_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={company.category || 'prospect'}
                      onChange={(e) => updateCategory(company.company_id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-3 py-1"
                    >
                      <option value="customer">Customer</option>
                      <option value="prospect">Prospect</option>
                      <option value="distributor">Distributor</option>
                      <option value="supplier">Supplier</option>
                      <option value="partner">Partner</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    £{(company.lifetime_value || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {company.order_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.first_order || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.last_order || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {filtered.length} of {companies.length} companies
      </div>
    </div>
  );
}
