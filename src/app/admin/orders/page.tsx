/**
 * Order Management Page
 * /admin/orders
 * View and manage all orders from Stripe checkouts
 * ⚠️ DEPRECATED - Use Stripe Invoices instead
 */

import OrdersTable from '@/components/admin/OrdersTable';
import DeprecationBanner from '@/components/admin/DeprecationBanner';
import AdminLayout from '@/components/admin/AdminLayout';

export default function OrdersPage() {
  return (
    <AdminLayout>
      <div className="h-full flex flex-col bg-white">
      <DeprecationBanner
        message="This page uses historic Sage order data which is messy and inconsistent. Use Stripe Invoices for future invoicing."
        replacementUrl="/admin/invoices"
        replacementLabel="View Stripe Invoices"
        reason="Historic orders from Sage have incorrect prices and inconsistent data. This table is kept for reference only."
      />

      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Orders (Deprecated)</h1>
        <p className="text-gray-600 mt-2">
          View and manage all customer orders
        </p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <OrdersTable />
      </div>
    </div>
    </AdminLayout>
  );
}
