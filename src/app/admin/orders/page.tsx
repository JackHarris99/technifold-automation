/**
 * Order Management Page
 * /admin/orders
 * View and manage all orders from Stripe checkouts
 */

import OrdersTable from '@/components/admin/OrdersTable';

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">
            View and manage all customer orders
          </p>
        </div>

        <OrdersTable />
      </div>
    </div>
  );
}
