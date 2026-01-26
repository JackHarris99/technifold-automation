/**
 * Distributor Dashboard Tabs Component
 * Splits view between Direct Distributors (buy & resell) and Partner Network (commission-based)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DirectDistributorMetrics {
  totalDistributors: number;
  pendingOrders: number;
  totalOrdersThisMonth: number;
  revenueThisMonth: number;
  recentPendingOrders: any[];
  topDistributors: any[];
}

interface PartnerNetworkMetrics {
  totalPartners: number;
  totalCustomers: number;
  pendingCommissions: number;
  totalCommissionsThisMonth: number;
}

interface DistributorDashboardTabsProps {
  directMetrics: DirectDistributorMetrics;
  partnerMetrics: PartnerNetworkMetrics;
}

export default function DistributorDashboardTabs({
  directMetrics,
  partnerMetrics,
}: DistributorDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'direct' | 'partner'>('direct');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('direct')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'direct'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Direct Distributors
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                {directMetrics.totalDistributors}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'partner'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Partner Network
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                {partnerMetrics.totalPartners}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'direct' && (
          <DirectDistributorsTab metrics={directMetrics} />
        )}
        {activeTab === 'partner' && (
          <PartnerNetworkTab metrics={partnerMetrics} />
        )}
      </div>
    </div>
  );
}

function DirectDistributorsTab({ metrics }: { metrics: DirectDistributorMetrics }) {
  return (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Direct Distributors */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">
              Direct Distributors
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.totalDistributors}
            </dd>
            <div className="mt-2">
              <Link
                href="/admin/distributors/companies?type=direct"
                className="text-sm text-teal-600 hover:text-teal-800"
              >
                View all →
              </Link>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Buy & resell model
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Pending Orders</dt>
            <dd className="mt-1 text-3xl font-semibold text-orange-600">
              {metrics.pendingOrders}
            </dd>
            <div className="mt-2">
              <Link
                href="/admin/distributors/orders/pending"
                className="text-sm text-teal-600 hover:text-teal-800"
              >
                Review now →
              </Link>
            </div>
          </div>
        </div>

        {/* Orders This Month */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Orders This Month</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.totalOrdersThisMonth}
            </dd>
            <div className="mt-2">
              <Link href="/admin/distributors/orders" className="text-sm text-teal-600 hover:text-teal-800">
                View all →
              </Link>
            </div>
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Revenue This Month</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              £{metrics.revenueThisMonth.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </dd>
            <div className="mt-2">
              <Link href="/admin/distributors/sales" className="text-sm text-teal-600 hover:text-teal-800">
                View report →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Pending Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Pending Orders</h2>
            <p className="text-sm text-gray-800">Orders awaiting your approval</p>
          </div>
          <div className="divide-y divide-gray-200">
            {metrics.recentPendingOrders && metrics.recentPendingOrders.length > 0 ? (
              metrics.recentPendingOrders.map((order: any) => (
                <div key={order.order_id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.companies?.company_name || 'Unknown Distributor'}
                      </p>
                      <p className="text-xs text-gray-700">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        £{order.total_amount.toFixed(2)}
                      </p>
                      <Link
                        href={`/admin/distributors/orders/${order.order_id}`}
                        className="text-xs text-teal-600 hover:text-teal-800"
                      >
                        Review →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-700">
                No pending orders
              </div>
            )}
          </div>
          {metrics.recentPendingOrders && metrics.recentPendingOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Link
                href="/admin/distributors/orders/pending"
                className="text-sm text-teal-600 hover:text-teal-800 font-medium"
              >
                View all pending orders →
              </Link>
            </div>
          )}
        </div>

        {/* Top Distributors This Month */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Distributors This Month</h2>
            <p className="text-sm text-gray-800">Highest sales volume</p>
          </div>
          <div className="divide-y divide-gray-200">
            {metrics.topDistributors && metrics.topDistributors.length > 0 ? (
              metrics.topDistributors.map((dist: any, index: number) => (
                <div key={dist.company_id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {dist.companies?.company_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        £{dist.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-700">
                No sales this month
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/distributors/companies?type=direct"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="text-2xl">🏢</div>
            <div>
              <p className="font-medium text-gray-900">Manage Distributors</p>
              <p className="text-xs text-gray-700">View and edit distributor companies</p>
            </div>
          </Link>
          <Link
            href="/admin/distributors/pricing"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="text-2xl">💰</div>
            <div>
              <p className="font-medium text-gray-900">Set Pricing</p>
              <p className="text-xs text-gray-700">Manage standard distributor pricing</p>
            </div>
          </Link>
          <Link
            href="/admin/distributors/custom-pricing"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="text-2xl">🎯</div>
            <div>
              <p className="font-medium text-gray-900">Custom Pricing</p>
              <p className="text-xs text-gray-700">Set per-distributor pricing</p>
            </div>
          </Link>
          <Link
            href="/admin/distributors/orders"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="text-2xl">📦</div>
            <div>
              <p className="font-medium text-gray-900">View All Orders</p>
              <p className="text-xs text-gray-700">Complete order history</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

function PartnerNetworkTab({ metrics }: { metrics: PartnerNetworkMetrics }) {
  return (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Partners */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">
              Commission Partners
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.totalPartners}
            </dd>
            <div className="mt-2 text-xs text-gray-600">
              Sell on our behalf model
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Partner Customers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.totalCustomers}
            </dd>
            <div className="mt-2 text-xs text-gray-600">
              Customers brought by partners
            </div>
          </div>
        </div>

        {/* Pending Commissions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Pending Commissions</dt>
            <dd className="mt-1 text-3xl font-semibold text-orange-600">
              £{metrics.pendingCommissions.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </dd>
            <div className="mt-2 text-xs text-gray-600">
              Awaiting payment
            </div>
          </div>
        </div>

        {/* Commissions This Month */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Commissions This Month</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              £{metrics.totalCommissionsThisMonth.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </dd>
            <div className="mt-2 text-xs text-gray-600">
              Total earned by partners
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/partners"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <div className="text-2xl">🤝</div>
            <div>
              <p className="font-medium text-gray-900">Manage Partners</p>
              <p className="text-xs text-gray-700">View and create partner distributors</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
            <div className="text-2xl">🔗</div>
            <div>
              <p className="font-medium text-gray-900">Link Customers</p>
              <p className="text-xs text-gray-700">Associate customers with partners</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
            <div className="text-2xl">💰</div>
            <div>
              <p className="font-medium text-gray-900">Commission Payments</p>
              <p className="text-xs text-gray-700">Track and pay commissions</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-4">
          More features coming: customer association interface, automatic commission calculation, partner portal
        </p>
      </div>
    </>
  );
}
