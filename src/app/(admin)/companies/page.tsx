/**
 * Companies List Page - Admin Control Plane
 * Searchable/sortable company directory
 */

import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface Company {
  company_id: string;
  company_name: string;
  country: string | null;
  category: string | null;
  last_invoice_at: string | null;
  total_orders?: number;
  engagement_score?: number;
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const sortBy = params.sort || 'company_name';

  const supabase = getSupabaseClient();

  // Fetch companies with basic stats
  let dbQuery = supabase
    .from('companies')
    .select('company_id, company_name, country, category, last_invoice_at, type')
    .order(sortBy === 'last_activity' ? 'last_invoice_at' : 'company_name', {
      ascending: sortBy !== 'last_activity',
      nullsFirst: false,
    });

  if (query) {
    dbQuery = dbQuery.or(`company_name.ilike.%${query}%,company_id.ilike.%${query}%`);
  }

  const { data: companies, error } = await dbQuery.limit(100);

  if (error) {
    console.error('[companies-page] Error fetching companies:', error);
  }

  // Get engagement scores (simplified - count recent events)
  const companyIds = companies?.map(c => c.company_id) || [];
  const { data: engagementData } = companyIds.length > 0
    ? await supabase
        .from('engagement_events')
        .select('company_id')
        .in('company_id', companyIds)
        .gte('occurred_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    : { data: [] };

  const engagementCounts = (engagementData || []).reduce((acc, e) => {
    acc[e.company_id] = (acc[e.company_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const enrichedCompanies: Company[] = (companies || []).map(c => ({
    ...c,
    engagement_score: engagementCounts[c.company_id] || 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage customer companies, view engagement, and take actions
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex gap-4">
        <form className="flex-1" action="/companies" method="get">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search companies..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </form>
        <select
          name="sort"
          defaultValue={sortBy}
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set('sort', e.target.value);
            window.location.href = url.toString();
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="company_name">Sort by Name</option>
          <option value="last_activity">Sort by Last Activity</option>
        </select>
      </div>

      {/* Companies Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enrichedCompanies.map((company) => (
              <tr key={company.company_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {company.company_name}
                  </div>
                  <div className="text-sm text-gray-500">{company.company_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.country || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {company.category && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {company.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.last_invoice_at
                    ? new Date(company.last_invoice_at).toLocaleDateString()
                    : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {company.engagement_score}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/companies/${company.company_id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {enrichedCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No companies found</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {enrichedCompanies.length} companies
      </div>
    </div>
  );
}
