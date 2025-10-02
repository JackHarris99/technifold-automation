import Link from 'next/link';
import { CustomerProfile, OrderHistory } from '@/types';
import { AdminHeader } from './AdminHeader';
import { generatePortalUrl } from '@/lib/supabase';

interface Tool {
  product_code: string;
  description: string;
  category: string;
  price?: number;
  [key: string]: unknown;
}

interface Consumable {
  product_code: string;
  description: string;
  category: string;
  type: string;
  price?: number;
  [key: string]: unknown;
}

interface CustomerProfilePageProps {
  profile: CustomerProfile;
  orderHistory: OrderHistory[];
  ownedTools?: Tool[];
  orderedConsumables?: Consumable[];
}

export function CustomerProfilePage({ profile, orderHistory, ownedTools = [], orderedConsumables = [] }: CustomerProfilePageProps) {
  const portalUrl = generatePortalUrl(profile.portal_token);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header with company name and actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{profile.company_name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-gray-600">ID: {profile.company_id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (profile as { category?: string }).category === 'customer' ? 'bg-green-100 text-green-800' :
                (profile as { category?: string }).category === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                (profile as { category?: string }).category === 'partner' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {(profile as { category?: string }).category || 'Unknown'}
              </span>
            </div>
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
              View Portal
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Company Details</h3>
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
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{(profile as { category?: string }).category || 'Not Set'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Country</dt>
                  <dd className="mt-1 text-sm text-gray-900">{(profile as { country?: string }).country || 'Not Set'}</dd>
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

                {/* Contact Information */}
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
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Orders</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">{orderHistory.length}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Spent</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      £{orderHistory.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tools Owned</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">{ownedTools.length}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Order</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {orderHistory.length > 0
                        ? new Date(orderHistory[0].order_date).toLocaleDateString('en-US')
                        : 'No orders yet'
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tools Owned */}
            {ownedTools && ownedTools.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Tools Owned</h3>
                  <p className="text-sm text-gray-500 mt-1">Equipment purchased by this company</p>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    {ownedTools.map((tool, index) => (
                      <div key={`tool-${index}`} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tool.description || 'Unknown Product'}</p>
                          <p className="text-xs text-gray-500 font-mono">{tool.product_code || 'N/A'}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {tool.category || 'Tool'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Order History */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order History</h3>
                <p className="text-sm text-gray-500 mt-1">All purchases grouped by invoice</p>
              </div>
              <div className="p-6">
                {orderHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No order history</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This company hasn&apos;t placed any orders yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {orderHistory.map((order) => (
                      <div key={order.order_id} className="border border-gray-200 rounded-lg">
                        <div className="p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Invoice: {order.order_id}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(order.order_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                £{order.total_amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-gray-500">
                                <th className="pb-2">Product Code</th>
                                <th className="pb-2">Description</th>
                                <th className="pb-2 text-right">Qty</th>
                                <th className="pb-2 text-right">Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {order.items.map((item, idx) => (
                                <tr key={`${order.order_id}-${idx}`}>
                                  <td className="py-2 font-mono text-xs">{item.consumable_code}</td>
                                  <td className="py-2">{item.description}</td>
                                  <td className="py-2 text-right">{item.quantity}</td>
                                  <td className="py-2 text-right">£{item.total_price.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Consumables Ordered */}
            {orderedConsumables && orderedConsumables.length > 0 ? (
              <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Consumables Ordered</h3>
                  <p className="text-sm text-gray-500 mt-1">All consumable products this company has purchased</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {orderedConsumables.map((consumable) => {
                      const imagePath = `/product_images/${consumable.product_code}.jpg`;
                      return (
                        <div key={consumable.product_code} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="aspect-square bg-gray-100 relative flex items-center justify-center">
                            <img
                              src={imagePath}
                              alt={consumable.description}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent infinite loop
                                target.src = '/product-placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="text-xs font-medium text-gray-900 truncate" title={consumable.description}>
                              {consumable.description}
                            </h4>
                            <p className="text-xs text-gray-500 font-mono mt-1">{consumable.product_code}</p>
                            <div className="mt-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {consumable.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Consumables Ordered</h3>
                  <p className="text-sm text-gray-500 mt-1">Products this company has purchased</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500">No consumables ordered yet or data not available.</p>
                  <p className="text-xs text-gray-400 mt-2">No consumable products found in order history</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}