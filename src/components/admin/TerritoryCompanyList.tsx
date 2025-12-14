/**
 * Territory Company List
 * Shows ONLY companies for current user's territory
 * Streamlined view with action buttons
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TerritoryCompanyListProps {
  userId: string;
  userName: string;
}

export default function TerritoryCompanyList({ userId, userName }: TerritoryCompanyListProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'machines' | 'subscriptions'>('name');

  useEffect(() => {
    fetchTerritoryCompanies();
  }, [userId]);

  async function fetchTerritoryCompanies() {
    setLoading(true);
    try {
      // Fetch companies filtered by account_owner on server side
      const response = await fetch(`/api/admin/companies/territory?user_id=${userId}`);
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch territory companies:', error);
    } finally {
      setLoading(false);
    }
  }

  const sorted = [...companies].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.company_name || '').localeCompare(b.company_name || '');
      case 'machines':
        return (b.machine_count || 0) - (a.machine_count || 0);
      case 'subscriptions':
        return (b.subscription_count || 0) - (a.subscription_count || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return <div className="text-center py-12">Loading your territory...</div>;
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Companies Assigned</h3>
        <p className="text-gray-600">
          You don't have any companies assigned to your territory yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{companies.length}</div>
          <div className="text-sm text-gray-600">Companies</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">
            {companies.reduce((sum, c) => sum + (c.machine_count || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Machines</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">
            {companies.reduce((sum, c) => sum + (c.subscription_count || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Active Subscriptions</div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <button
            onClick={() => setSortBy('name')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Company Name
          </button>
          <button
            onClick={() => setSortBy('machines')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'machines'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Machines
          </button>
          <button
            onClick={() => setSortBy('subscriptions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'subscriptions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Subscriptions
          </button>
        </div>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((company) => (
          <div
            key={company.company_id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {company.company_name}
                  </h3>
                  <p className="text-sm text-gray-600">{company.country || 'UK'}</p>
                </div>
                <div className="flex gap-2">
                  {company.has_trial && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Trial
                    </span>
                  )}
                  {company.subscription_count > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {company.machine_count || 0}
                  </div>
                  <div className="text-xs text-gray-600">Machines</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {company.subscription_count || 0}
                  </div>
                  <div className="text-xs text-gray-600">Subscriptions</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/sales/company/${company.company_id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  View Details
                </Link>
                <Link
                  href={`/admin/quote-builder?company_id=${company.company_id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                >
                  Quote
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
