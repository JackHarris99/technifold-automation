/**
 * Distributor Company Detail Page
 * Shows distributor-specific info: users, pricing, orders
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function DistributorCompanyPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { company_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch company details
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('company_id', company_id)
    .eq('type', 'distributor')
    .single();

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Distributor Not Found</h1>
          <Link href="/admin/distributors" className="text-blue-600 hover:text-blue-800">
            ← Back to Distributors
          </Link>
        </div>
      </div>
    );
  }

  // Fetch distributor users
  const { data: users } = await supabase
    .from('distributor_users')
    .select('*')
    .eq('company_id', company_id)
    .order('created_at');

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', company_id)
    .order('full_name');

  // Fetch recent invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('invoice_id, invoice_number, invoice_date, total_amount, status')
    .eq('company_id', company_id)
    .order('invoice_date', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/admin/distributors"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Distributors
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.company_name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                  Distributor
                </span>
                {company.country && (
                  <span className="text-gray-600">📍 {company.country}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portal Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Portal Users ({users?.length || 0})</h2>
            </div>
            <div className="p-6">
              {!users || users.length === 0 ? (
                <p className="text-gray-700 text-center py-4">No portal users yet</p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.user_id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-700">{user.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : user.role === 'user'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {user.role}
                            </span>
                            {user.active ? (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/admin/distributors"
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                → Manage users in Distributors page
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders ({invoices?.length || 0})</h2>
            </div>
            <div className="p-6">
              {!invoices || invoices.length === 0 ? (
                <p className="text-gray-700 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div key={invoice.invoice_id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{invoice.invoice_number}</div>
                        <div className="text-sm text-gray-700">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          £{invoice.total_amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">{invoice.status || 'pending'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Company Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-700 font-medium">Company ID</div>
                <div className="text-gray-900 font-mono">{company.company_id}</div>
              </div>
              {company.account_owner && (
                <div>
                  <div className="text-gray-700 font-medium">Account Owner</div>
                  <div className="text-gray-900">{company.account_owner}</div>
                </div>
              )}
              {company.country && (
                <div>
                  <div className="text-gray-700 font-medium">Country</div>
                  <div className="text-gray-900">{company.country}</div>
                </div>
              )}
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Contacts ({contacts?.length || 0})</h3>
            {!contacts || contacts.length === 0 ? (
              <p className="text-gray-700 text-sm">No contacts</p>
            ) : (
              <div className="space-y-2">
                {contacts.slice(0, 5).map((contact) => (
                  <div key={contact.contact_id} className="text-sm">
                    <div className="font-medium text-gray-900">{contact.full_name}</div>
                    <div className="text-gray-700">{contact.email}</div>
                  </div>
                ))}
                {contacts.length > 5 && (
                  <div className="text-xs text-gray-600">+{contacts.length - 5} more</div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/distributors"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm text-center"
              >
                Manage Portal Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
