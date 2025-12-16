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
  const isDirector = user.role === 'director';

  // Territory filtering
  let query = supabase
    .from('companies')
    .select('company_id, company_name, account_owner, category, country, last_invoice_at')
    .order('company_name');

  // Sales reps only see their territory
  if (!isDirector && user.sales_rep_id) {
    query = query.eq('account_owner', user.sales_rep_id);
  }

  const { data: companies, error } = await query;

  if (error) {
    console.error('[Companies] Query error:', error);
  }

  const totalCompanies = companies?.length || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <p className="text-gray-600 mt-2">
          {isDirector ? 'All companies' : `Your territory`} • {totalCompanies} companies
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
              {companies.map((company) => (
                <tr key={company.company_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/company/${company.company_id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {company.company_name}
                    </Link>
                    <div className="text-sm text-gray-500">{company.company_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.account_owner || '-'}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
