/**
 * Press Outlets Page
 * View and manage media outlets and publications
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function PressOutletsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch press companies
  const { data: outlets, error } = await supabase
    .from('companies')
    .select('*')
    .eq('type', 'press')
    .order('company_name', { ascending: true });

  const pressOutlets = outlets || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Outlets</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage relationships with publications and media organizations
              </p>
            </div>
            <Link
              href="/admin/press/dashboard"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-700">Total Media Outlets</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{pressOutlets.length}</p>
        </div>

        {/* Outlets List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Media Outlets</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Outlet Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Website</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pressOutlets.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-700">
                      No media outlets found
                    </td>
                  </tr>
                ) : (
                  pressOutlets.map((outlet) => (
                    <tr key={outlet.company_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{outlet.company_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        {outlet.website ? (
                          <a
                            href={outlet.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            {outlet.website}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{outlet.country || '-'}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
