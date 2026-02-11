/**
 * Pending Orders Client Component
 * Displays list of customer orders awaiting review or approval
 */

'use client';

interface OrderItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  order_id: string;
  po_number: string | null;
  created_at: string;
  status: string;
  subtotal: number;
  predicted_shipping: number;
  vat_amount: number;
  total_amount: number;
  currency: string;
  shipping_address_line_1: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  items: OrderItem[];
}

interface Props {
  orders: Order[];
}

export default function PendingOrdersClient({ orders }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    if (status === 'approved') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'pending_review') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'approved') return 'Approved - Creating Invoice';
    if (status === 'pending_review') return 'Pending Review';
    return status;
  };

  const getStatusDescription = (status: string) => {
    if (status === 'approved') return 'Your order has been approved and we are creating your invoice.';
    if (status === 'pending_review') return 'Our sales team is reviewing your order.';
    return '';
  };

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0a0a0a] mb-2">No Pending Orders</h2>
          <p className="text-[#666] mb-6">You don't have any orders awaiting review or approval.</p>
          <a
            href="/customer/portal"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            Browse Products
          </a>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.order_id}
            className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-[#e8e8e8]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-[#0a0a0a]">
                      {order.po_number || `Order ${order.order_id.substring(0, 15)}`}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-[#666]">{getStatusDescription(order.status)}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#666] mb-1">Submitted</div>
                  <div className="text-sm font-semibold text-[#0a0a0a]">
                    {formatDate(order.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-6">
              {/* Items List */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666] uppercase mb-3">Items</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.product_code}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-[#0a0a0a]">{item.product_code}</div>
                        <div className="text-sm text-[#666]">{item.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#666]">
                          {item.quantity} × {formatCurrency(item.unit_price, order.currency)}
                        </div>
                        <div className="font-semibold text-[#0a0a0a]">
                          {formatCurrency(item.line_total, order.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666] uppercase mb-2">Shipping Address</h4>
                <div className="text-sm text-[#0a0a0a]">
                  {order.shipping_address_line_1}
                  {order.shipping_address_line_1 && <br />}
                  {order.shipping_city && `${order.shipping_city}, `}
                  {order.shipping_postal_code} {order.shipping_country}
                </div>
              </div>

              {/* Order Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#666]">Subtotal</span>
                    <span className="text-[#0a0a0a] font-medium">
                      {formatCurrency(order.subtotal, order.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#666]">Shipping (estimated)</span>
                    <span className="text-[#0a0a0a] font-medium">
                      {formatCurrency(order.predicted_shipping, order.currency)}
                    </span>
                  </div>
                  {order.vat_amount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#666]">VAT</span>
                      <span className="text-[#0a0a0a] font-medium">
                        {formatCurrency(order.vat_amount, order.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-base font-semibold text-[#0a0a0a]">Total</span>
                    <span className="text-xl font-bold text-[#0a0a0a]">
                      {formatCurrency(order.total_amount, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
