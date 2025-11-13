/**
 * Admin Rentals Page
 * View all tool rental subscriptions
 */

import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

export const metadata = {
  title: 'Tool Rentals | Technifold Admin',
  description: 'View active tool rental subscriptions',
};

export default async function RentalsPage() {
  const supabase = getSupabaseClient();

  // Fetch all rentals with company details
  const { data: rentals } = await supabase
    .from('rental_agreements')
    .select(`
      rental_id,
      company_id,
      tool_code,
      stripe_subscription_id,
      status,
      start_date,
      end_date,
      monthly_price,
      created_at,
      companies (
        company_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(500);

  const activeRentals = rentals?.filter(r => r.status === 'active') || [];
  const cancelledRentals = rentals?.filter(r => r.status === 'cancelled') || [];

  return (
    <div className="h-full flex flex-col overflow-auto bg-gray-50">
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Tool Rentals</h1>
        <p className="mt-2 text-gray-600">
          Manage tool rental subscriptions
        </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">Total Rentals</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{rentals?.length || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-green-600 uppercase">Active</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{activeRentals.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">Cancelled</div>
            <div className="mt-2 text-3xl font-bold text-gray-600">{cancelledRentals.length}</div>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Rentals</h2>
          {activeRentals.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No active rentals</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stripe
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeRentals.map((rental: any) => (
                    <tr key={rental.rental_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/company/${rental.company_id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {rental.companies?.company_name || rental.company_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{rental.tool_code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          £{(rental.monthly_price / 100).toFixed(2)}/mo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rental.start_date ? new Date(rental.start_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rental.stripe_subscription_id ? (
                          <a
                            href={`https://dashboard.stripe.com/subscriptions/${rental.stripe_subscription_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View in Stripe →
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cancelled Rentals */}
        {cancelledRentals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancelled Rentals</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stripe
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cancelledRentals.map((rental: any) => (
                    <tr key={rental.rental_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/company/${rental.company_id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {rental.companies?.company_name || rental.company_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{rental.tool_code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rental.start_date ? new Date(rental.start_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rental.end_date ? new Date(rental.end_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rental.stripe_subscription_id ? (
                          <a
                            href={`https://dashboard.stripe.com/subscriptions/${rental.stripe_subscription_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View in Stripe →
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      <div className="px-6 py-6">
        {/* Content padding */}
      </div>
    </div>
  );
}
