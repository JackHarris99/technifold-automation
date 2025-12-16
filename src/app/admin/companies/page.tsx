/**
 * Companies List - Territory Filtered
 * Directors see all, sales reps see their companies
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CompaniesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch ALL companies (bypass 1000 row limit with batching)
  let allCompanies: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner, category, country, last_invoice_at')
      .order('company_name')
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('[Companies] Query error:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allCompanies = allCompanies.concat(batch);
      start += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  const companies = allCompanies;
  const totalCompanies = companies.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Companies</h1>
        <p className="text-gray-600 mt-2">
          {totalCompanies} companies • All reps can view and manage
        </p>
      </div>

      {!companies || companies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No companies found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Invoice
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => {
                const isMyCompany = company.account_owner === user.sales_rep_id;
                return (
                <tr key={company.company_id} className={`hover:bg-gray-50 ${isMyCompany ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/company/${company.company_id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {company.company_name}
                    </Link>
                    <div className="text-sm text-gray-500">{company.company_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {company.account_owner ? (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isMyCompany
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {company.account_owner}
                        </span>
                        {isMyCompany && (
                          <span className="text-xs text-blue-600 font-semibold">YOU</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.category && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {company.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.country || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.last_invoice_at || 'Never'}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
