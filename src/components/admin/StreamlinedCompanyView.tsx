/**
 * Streamlined Company View for Sales Center
 * Uses FACT TABLES: company_tools, company_consumables, subscription_tools
 * Shows ONLY action-relevant data (NO order history bloat)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import ManageToolsModal from './ManageToolsModal';

interface StreamlinedCompanyViewProps {
  company: any;
  tools: any[];  // From company_tools fact table
  subscriptions: any[];  // From subscriptions with subscription_tools
  consumables: any[];  // From company_consumables fact table
  contacts: any[];
}

export default function StreamlinedCompanyView({
  company,
  tools,
  subscriptions,
  consumables,
  contacts,
}: StreamlinedCompanyViewProps) {
  const [showManageToolsModal, setShowManageToolsModal] = useState(false);

  function handleToolsSaved() {
    // Reload the page to show updated tools
    window.location.reload();
  }

  return (
    <>
      <ManageToolsModal
        companyId={company.company_id}
        companyName={company.company_name}
        isOpen={showManageToolsModal}
        onClose={() => setShowManageToolsModal(false)}
        onSaved={handleToolsSaved}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{tools.length}</div>
          <div className="text-sm text-gray-600">Tools Owned</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{subscriptions.length}</div>
          <div className="text-sm text-gray-600">Active Subscriptions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{consumables.length}</div>
          <div className="text-sm text-gray-600">Consumable Products</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{contacts.length}</div>
          <div className="text-sm text-gray-600">Contacts</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tools Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Tools Owned</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowManageToolsModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                  Manage Tools
                </button>
                <Link
                  href={`/admin/company/${company.company_id}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View Full CRM →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {tools.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No tools owned yet</p>
              ) : (
                <div className="space-y-3">
                  {tools.map((tool) => (
                    <div
                      key={tool.tool_code}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{tool.products?.description || tool.tool_code}</h3>
                            <span className="text-xs text-gray-500">({tool.tool_code})</span>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            Qty: {tool.total_units} • Last seen: {new Date(tool.last_seen_at).toLocaleDateString('en-GB')}
                          </div>
                          {tool.products?.category && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {tool.products.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Active Subscriptions</h2>
            </div>
            <div className="p-6">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No active subscriptions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.subscription_id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              £{sub.monthly_price?.toFixed(2)}/month
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              sub.status === 'active' ? 'bg-green-100 text-green-800' :
                              sub.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          {sub.trial_end_date && sub.status === 'trial' && (
                            <p className="text-sm text-gray-600 mt-1">
                              Trial ends: {new Date(sub.trial_end_date).toLocaleDateString('en-GB')}
                            </p>
                          )}
                          {sub.contacts && (
                            <p className="text-sm text-gray-600 mt-1">
                              Contact: {sub.contacts.full_name} ({sub.contacts.email})
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tools on subscription */}
                      {sub.subscription_tools && sub.subscription_tools.length > 0 ? (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Tools Included:</p>
                          <div className="flex flex-wrap gap-2">
                            {sub.subscription_tools.map((st: any) => (
                              <span key={st.tool_code} className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                                {st.products?.description || st.tool_code}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-amber-600">⚠️ No tools allocated - needs manual assignment</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Consumables Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Consumables</h2>
              <Link
                href={`/admin/company/${company.company_id}/reorder`}
                className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
              >
                Send Reorder Link
              </Link>
            </div>
            <div className="p-6">
              {consumables.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No consumable orders yet</p>
              ) : (
                <div className="space-y-3">
                  {consumables.map((consumable) => {
                    const daysSinceOrder = Math.floor(
                      (Date.now() - new Date(consumable.last_ordered_at).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const isReorderOpportunity = daysSinceOrder > 90;

                    return (
                      <div
                        key={consumable.consumable_code}
                        className={`border rounded-lg p-4 ${
                          isReorderOpportunity ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {consumable.products?.description || consumable.consumable_code}
                              </h3>
                              {isReorderOpportunity && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                  Reorder!
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              Last ordered: {new Date(consumable.last_ordered_at).toLocaleDateString('en-GB')} ({daysSinceOrder} days ago)
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              Last qty: {consumable.last_order_quantity} • Total ordered: {consumable.total_quantity} ({consumable.total_orders} orders)
                            </div>
                            {consumable.last_order_amount && (
                              <div className="mt-1 text-sm font-medium text-gray-900">
                                £{consumable.last_order_amount.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Contacts Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Contacts</h2>
            </div>
            <div className="p-6">
              {contacts.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No contacts</p>
              ) : (
                <div className="space-y-3">
                  {contacts.slice(0, 5).map((contact) => (
                    <div key={contact.contact_id} className="border-b border-gray-100 pb-3 last:border-0">
                      <div className="font-medium text-gray-900">{contact.full_name || `${contact.first_name} ${contact.last_name}`}</div>
                      {contact.email && <div className="text-sm text-gray-600">{contact.email}</div>}
                      {contact.role && <div className="text-xs text-gray-500">{contact.role}</div>}
                    </div>
                  ))}
                  {contacts.length > 5 && (
                    <Link
                      href={`/admin/company/${company.company_id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View all {contacts.length} contacts →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link
                href={`/admin/company/${company.company_id}/reorder`}
                className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium"
              >
                Send Reorder Email
              </Link>
              <Link
                href={`/admin/quote-builder?company_id=${company.company_id}`}
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
              >
                Create Quote
              </Link>
              <Link
                href={`/admin/invoices/new?company_id=${company.company_id}`}
                className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center font-medium"
              >
                Create Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
