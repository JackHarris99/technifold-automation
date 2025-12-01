/**
 * Sales History Tabs - Client component for historical sales view
 * Tabs: Tool Sales, Consumable Sales, Subscriptions, Lost Deals
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

type TabType = 'tools' | 'consumables' | 'rentals' | 'lost';

interface Order {
  order_id: string;
  created_at: string;
  total_amount: number;
  status: string;
  companies: { company_name: string };
  order_items: Array<{
    product_code: string;
    description: string;
    qty: number;
    unit_price: number;
    products: { type: string };
  }>;
}

interface Rental {
  rental_id: string;
  start_date: string;
  end_date?: string;
  monthly_price: number;
  status: string;
  tool_code: string;
  companies: { company_name: string };
}

interface LostDeal {
  quote_request_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  estimated_value?: number;
  companies: { company_id: string; company_name: string };
  contacts: { contact_id: string; full_name: string; email: string };
}

interface SalesHistoryTabsProps {
  toolOrders: Order[];
  consumableOrders: Order[];
  rentals: Rental[];
  lostDeals: LostDeal[];
}

export default function SalesHistoryTabs({
  toolOrders,
  consumableOrders,
  rentals,
  lostDeals,
}: SalesHistoryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tools');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
            <p className="mt-2 text-gray-600">Historical view of all completed deals</p>
          </div>
          <Link
            href="/admin/pipeline"
            className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold"
          >
            ← Back to Pipeline
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('tools')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'tools'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tool Sales ({toolOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('consumables')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'consumables'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Consumable Sales ({consumableOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('rentals')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'rentals'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Subscriptions ({rentals.length})
              </button>
              <button
                onClick={() => setActiveTab('lost')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'lost'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Lost Deals ({lostDeals.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Tool Sales Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-3">
                {toolOrders.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">No tool sales yet</p>
                ) : (
                  toolOrders.map(order => (
                    <div key={order.order_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">{order.companies.company_name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.order_items?.length} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            £{order.total_amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-green-600 font-semibold">
                            £{(order.total_amount * 0.10).toFixed(2)} commission
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Consumable Sales Tab */}
            {activeTab === 'consumables' && (
              <div className="space-y-3">
                {consumableOrders.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">No consumable sales yet</p>
                ) : (
                  consumableOrders.map(order => (
                    <div key={order.order_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">{order.companies.company_name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.order_items?.length} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            £{order.total_amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-green-600 font-semibold">
                            £{(order.total_amount * 0.01).toFixed(2)} commission
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Rentals Tab */}
            {activeTab === 'rentals' && (
              <div className="space-y-3">
                {rentals.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">No subscriptions yet</p>
                ) : (
                  rentals.map(rental => (
                    <div key={rental.rental_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">{rental.companies.company_name}</div>
                          <div className="text-sm text-gray-600">
                            {rental.tool_code}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Started: {new Date(rental.start_date).toLocaleDateString()}
                            {rental.end_date && ` • Ended: ${new Date(rental.end_date).toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            £{rental.monthly_price.toFixed(2)}/mo
                          </div>
                          <div className="text-sm text-green-600 font-semibold">
                            £{(rental.monthly_price * 0.10).toFixed(2)}/mo commission
                          </div>
                          <span className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                            rental.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rental.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Lost Deals Tab */}
            {activeTab === 'lost' && (
              <div className="space-y-3">
                {lostDeals.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">No lost deals (great job!)</p>
                ) : (
                  lostDeals.map(deal => (
                    <Link
                      key={deal.quote_request_id}
                      href={`/admin/company/${deal.companies.company_id}`}
                      className="block border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">{deal.companies.company_name}</div>
                          <div className="text-sm text-gray-600">{deal.contacts.full_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(deal.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {deal.estimated_value && (
                            <div className="text-xl font-bold text-gray-900">
                              £{deal.estimated_value.toFixed(2)}
                            </div>
                          )}
                          <span className="mt-2 inline-block px-3 py-1 rounded-lg text-sm font-semibold bg-red-100 text-red-800 border border-red-300">
                            {deal.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
