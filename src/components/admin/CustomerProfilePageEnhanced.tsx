'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CustomerProfile, OrderHistory } from '@/types';
import { AdminHeader } from './AdminHeader';
import { ToolsAndConsumablesSection } from './ToolsAndConsumablesSection';
import CompanyHeader from './CompanyHeader';
import EngagementTimeline from './EngagementTimeline';
import SuggestionsPanel from './SuggestionsPanel';
import MarketingBuilderTab from './MarketingBuilderTab';

interface Contact {
  contact_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  marketing_status?: string;
  gdpr_consent_at?: string | null;
  [key: string]: unknown;
}

interface ToolWithConsumables {
  tool: {
    product_code: string;
    description: string;
    category?: string;
    type: string;
    [key: string]: unknown;
  } | null;
  consumables: Array<{
    product_code: string;
    description: string;
    category?: string;
    type: string;
    [key: string]: unknown;
  }>;
}

interface CustomerProfilePageProps {
  profile: CustomerProfile;
  orderHistory: OrderHistory[];
  toolsWithConsumables?: ToolWithConsumables[];
  contacts?: Contact[];
}

export function CustomerProfilePage({ profile, orderHistory, toolsWithConsumables = [], contacts = [] }: CustomerProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'contacts' | 'marketing'>('overview');

  // Format company object for CompanyHeader
  const companyForHeader = {
    company_id: profile.company_id,
    company_name: profile.company_name,
    country: (profile as any).country || null,
    category: (profile as any).category || null,
    portal_token: profile.portal_token,
    zoho_account_id: (profile as any).zoho_account_id || null,
    stripe_customer_id: (profile as any).stripe_customer_id || null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Company Header with Action Buttons */}
        <CompanyHeader company={companyForHeader} />

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'timeline'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contacts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contacts ({contacts.length})
              </button>
              <button
                onClick={() => setActiveTab('marketing')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'marketing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Marketing Builder
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div>
                {/* Suggestions Panel */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Next Best Actions</h3>
                  <SuggestionsPanel companyId={profile.company_id} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Company Information & Stats */}
                  <div className="lg:col-span-1 space-y-6">
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
                            <dd className="mt-1 text-2xl font-semibold text-gray-900">{toolsWithConsumables.length}</dd>
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

                    {/* Company Details */}
                    <div className="bg-white shadow-sm rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Company Details</h3>
                      </div>
                      <div className="p-6 space-y-4">
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
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="lg:col-span-2 space-y-6">
                    <ToolsAndConsumablesSection toolsWithConsumables={toolsWithConsumables} />

                    {/* Order History */}
                    <div className="bg-white shadow-sm rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Order History</h3>
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
                            {orderHistory.slice(0, 5).map((order) => (
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
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Timeline</h3>
                <EngagementTimeline companyId={profile.company_id} />
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                {contacts.length === 0 ? (
                  <div className="bg-white shadow-sm rounded-lg p-12 text-center">
                    <p className="text-gray-500">No contacts found for this company</p>
                  </div>
                ) : (
                  <div className="bg-white shadow-sm rounded-lg">
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contacts.map((contact, index) => {
                          const displayName = contact.full_name ||
                                             `${contact.first_name || ''} ${contact.last_name || ''}`.trim() ||
                                             'Unknown Contact';

                          return (
                            <div key={contact.contact_id || index} className="border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900">{displayName}</h4>
                              {contact.role && (
                                <p className="text-sm text-gray-600 mb-2">{contact.role}</p>
                              )}
                              {contact.email && (
                                <a href={`mailto:${contact.email}`} className="block text-sm text-blue-600 hover:text-blue-800 mb-1">
                                  {contact.email}
                                </a>
                              )}
                              {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="block text-sm text-gray-600 mb-2">
                                  {contact.phone}
                                </a>
                              )}
                              {contact.marketing_status && (
                                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                                  contact.marketing_status === 'subscribed'
                                    ? 'bg-green-100 text-green-800'
                                    : contact.marketing_status === 'unsubscribed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {contact.marketing_status}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'marketing' && (
              <div>
                <MarketingBuilderTab
                  companyId={profile.company_id}
                  companyName={profile.company_name}
                  contacts={contacts}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
