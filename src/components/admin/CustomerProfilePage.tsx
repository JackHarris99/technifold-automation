import Link from 'next/link';
import { CustomerProfile, OrderHistory, CompanyPayload } from '@/types';
import { AdminHeader } from './AdminHeader';
import { generatePortalUrl } from '@/lib/supabase';

interface CustomerProfilePageProps {
  profile: CustomerProfile;
  orderHistory: OrderHistory[];
  portalData: CompanyPayload | null;
}

export function CustomerProfilePage({ profile, orderHistory, portalData }: CustomerProfilePageProps) {
  const portalUrl = generatePortalUrl(profile.portal_token);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header with company name and actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Companies
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{profile.company_name}</h1>
            <p className="text-gray-600 mt-1">Customer ID: {profile.company_id}</p>
          </div>
          <div className="flex space-x-3">
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Customer Portal
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Information */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.company_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company ID</dt>
                  <dd className="mt-1 text-sm font-mono text-gray-900">{profile.company_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Portal Token</dt>
                  <dd className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {profile.portal_token}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </dd>
                </div>
                
                {/* Contact Information (when available) */}
                {profile.contact_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.contact_name}</dd>
                  </div>
                )}
                {profile.contact_email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:${profile.contact_email}`} className="text-blue-600 hover:text-blue-800">
                        {profile.contact_email}
                      </a>
                    </dd>
                  </div>
                )}
                {profile.contact_phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`tel:${profile.contact_phone}`} className="text-blue-600 hover:text-blue-800">
                        {profile.contact_phone}
                      </a>
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Orders</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">{profile.total_orders}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Spent</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      £{profile.total_spent.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Order</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {profile.last_order_date 
                        ? new Date(profile.last_order_date).toLocaleDateString('en-US')
                        : 'No orders yet'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Portal Last Accessed</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {profile.portal_last_accessed 
                        ? new Date(profile.portal_last_accessed).toLocaleDateString('en-US')
                        : 'Never accessed'
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Products */}
            {portalData && (
              <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Available Products</h3>
                  <p className="text-sm text-gray-500 mt-1">What this customer can currently order</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reorder Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Recent Items ({portalData.reorder_items.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {portalData.reorder_items.slice(0, 10).map((item) => (
                          <div key={item.consumable_code} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                            <span className="truncate">{item.description}</span>
                            <span className="font-medium">£{item.price}</span>
                          </div>
                        ))}
                        {portalData.reorder_items.length > 10 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{portalData.reorder_items.length - 10} more items
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tool Tabs */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Tool Categories ({portalData.by_tool_tabs.length})
                      </h4>
                      <div className="space-y-2">
                        {portalData.by_tool_tabs.map((tab) => (
                          <div key={tab.tool_code} className="text-xs bg-blue-50 p-2 rounded">
                            <div className="font-medium text-blue-900">{tab.tool_desc}</div>
                            <div className="text-blue-700">{tab.items.length} available items</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order History */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order History</h3>
                <p className="text-sm text-gray-500 mt-1">Complete purchase timeline</p>
              </div>
              <div className="p-6">
                {orderHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No order history</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This customer hasn&apos;t placed any orders yet, or order tracking isn&apos;t configured.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.order_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            Order #{order.order_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.order_date).toLocaleDateString('en-US')}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          £{order.total_amount} • {order.items.length} items • {order.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Notes */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Internal Notes</h3>
                <p className="text-sm text-gray-500 mt-1">Team notes about this customer</p>
              </div>
              <div className="p-6">
                <textarea
                  placeholder="Add internal notes about this customer..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700">
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}