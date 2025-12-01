/**
 * Order Management Page
 * /admin/orders
 * View and manage all orders from Stripe checkouts
 */

import OrdersTable from '@/components/admin/OrdersTable';

export default function OrdersPage() {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">
          View and manage all customer orders
        </p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <OrdersTable />
      </div>
    </div>
  );
}
