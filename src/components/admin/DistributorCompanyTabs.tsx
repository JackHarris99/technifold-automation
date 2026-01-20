'use client';

import { useState } from 'react';
import DistributorCatalogManager from './DistributorCatalogManager';

type TabType = 'overview' | 'catalog';

interface DistributorUser {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  active: boolean;
}

interface Contact {
  contact_id: string;
  full_name: string | null;
  email: string | null;
}

interface Invoice {
  invoice_id: string;
  invoice_number: string | null;
  invoice_date: string;
  total_amount: number;
  status: string | null;
}

interface Product {
  product_code: string;
  description: string;
  type: string;
  category: string | null;
  price: number | null;
  active: boolean;
  show_in_distributor_portal: boolean;
}

interface CatalogEntry {
  product_code: string;
  visible: boolean;
}

interface DistributorPricing {
  product_code: string;
  standard_price: number;
}

interface CompanyPricing {
  product_code: string;
  custom_price: number;
}

interface DistributorCompanyTabsProps {
  companyId: string;
  users: DistributorUser[];
  contacts: Contact[];
  invoices: Invoice[];
  products?: Product[];
  catalogEntries?: CatalogEntry[];
  distributorPricing?: DistributorPricing[];
  companyPricing?: CompanyPricing[];
}

export default function DistributorCompanyTabs({
  companyId,
  users,
  contacts,
  invoices,
  products = [],
  catalogEntries = [],
  distributorPricing = [],
  companyPricing = [],
}: DistributorCompanyTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'catalog'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Custom Catalog & Pricing
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portal Users */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Portal Users ({users.length})</h2>
              </div>
              <div className="p-6">
                {users.length === 0 ? (
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
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Recent Orders ({invoices.length})</h2>
              </div>
              <div className="p-6">
                {invoices.length === 0 ? (
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
            {/* Contacts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Contacts ({contacts.length})</h3>
              {contacts.length === 0 ? (
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
          </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <DistributorCatalogManager
          companyId={companyId}
          products={products}
          catalogEntries={catalogEntries}
          distributorPricing={distributorPricing}
          companyPricing={companyPricing}
        />
      )}
    </>
  );
}
