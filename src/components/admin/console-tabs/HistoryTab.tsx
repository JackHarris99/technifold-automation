/**
 * History Tab - Orders, emails, engagement timeline
 */

'use client';

export default function HistoryTab({ companyId, orders, machines }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order & Engagement History</h2>

      {/* Orders */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Orders</h3>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order.order_id} className="border-b border-gray-200 pb-3 last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{order.order_id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    £{order.total_amount?.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
