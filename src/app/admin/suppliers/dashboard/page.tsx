/**
 * Suppliers Dashboard
 * Central hub for managing supplier relationships and purchase orders
 */

import Link from 'next/link';

export default async function SuppliersDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Management Dashboard</h1>
        <p className="text-gray-600">Manage supplier relationships, purchase orders, and product catalogs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Suppliers Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">🏭 Total Suppliers</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">187</p>
          <p className="text-sm text-gray-600 mb-4">Active supplier relationships</p>
          <Link
            href="/admin/suppliers/companies"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            View all suppliers →
          </Link>
        </div>

        {/* Purchase Orders Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📦 Purchase Orders</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">-</p>
          <p className="text-sm text-gray-600 mb-4">Active orders</p>
          <Link
            href="/admin/suppliers/orders"
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View orders →
          </Link>
        </div>

        {/* Pending Delivery Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">⏳ Pending Delivery</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">-</p>
          <p className="text-sm text-gray-600 mb-4">Awaiting delivery</p>
          <Link
            href="/admin/suppliers/orders/pending"
            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            View pending →
          </Link>
        </div>

        {/* Supplier Contacts Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">👥 Contacts</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">283</p>
          <p className="text-sm text-gray-600 mb-4">Supplier contacts</p>
          <Link
            href="/admin/suppliers/contacts"
            className="text-cyan-600 hover:text-cyan-700 font-medium text-sm"
          >
            View contacts →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/suppliers/companies"
            className="p-4 border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
          >
            <div className="text-2xl mb-2">🏭</div>
            <div className="font-medium text-gray-900">View Suppliers</div>
            <div className="text-sm text-gray-600">Browse all suppliers</div>
          </Link>

          <Link
            href="/admin/suppliers/orders"
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium text-gray-900">Purchase Orders</div>
            <div className="text-sm text-gray-600">Manage orders</div>
          </Link>

          <Link
            href="/admin/suppliers/catalogs"
            className="p-4 border-2 border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-colors"
          >
            <div className="text-2xl mb-2">📑</div>
            <div className="font-medium text-gray-900">Catalogs</div>
            <div className="text-sm text-gray-600">Product catalogs</div>
          </Link>

          <Link
            href="/admin/suppliers/pricing"
            className="p-4 border-2 border-cyan-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition-colors"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium text-gray-900">Pricing History</div>
            <div className="text-sm text-gray-600">Track price changes</div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <h3 className="font-semibold text-emerald-900 mb-2">🚀 Getting Started</h3>
        <p className="text-emerald-800 text-sm mb-3">
          Your supplier database has been imported from Pipedrive. Next steps:
        </p>
        <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
          <li>Review and categorize suppliers by product category</li>
          <li>Upload supplier catalogs and pricing information</li>
          <li>Set up purchase order workflows</li>
          <li>Track delivery performance and lead times</li>
        </ul>
      </div>
    </div>
  );
}
