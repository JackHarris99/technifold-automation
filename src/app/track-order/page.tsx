/**
 * Customer Order Tracking Page
 * /track-order
 * Customers can enter order ID and email to track their order
 */

'use client';

import { useState } from 'react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/track-order?orderId=${orderId}&email=${email}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statuses = {
      paid: { label: 'Payment Received', color: 'bg-green-100 text-green-800', icon: '✓' },
      processing: { label: 'Processing Order', color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
      shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: '📦' },
      completed: { label: 'Delivered', color: 'bg-gray-100 text-gray-800', icon: '✓' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '✗' },
    };

    return statuses[status as keyof typeof statuses] || statuses.paid;
  };

  const currency = order?.currency === 'GBP' ? '£' : order?.currency;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Track Your Order</h1>
          <p className="text-lg text-gray-600">Enter your order details to see the latest status</p>
        </div>

        {/* Search Form */}
        {!order && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Found in your order confirmation email</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email used when ordering"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Status</h2>
                <button
                  onClick={() => setOrder(null)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Track Another Order
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className={`px-6 py-3 rounded-full text-lg font-semibold ${getStatusDisplay(order.status).color}`}>
                  {getStatusDisplay(order.status).icon} {getStatusDisplay(order.status).label}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="relative pt-8 pb-4">
                <div className="flex justify-between mb-2">
                  <div className={`flex flex-col items-center ${order.status === 'paid' ? 'text-green-600' : order.status === 'cancelled' ? 'text-gray-400' : 'text-green-600'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${order.status === 'paid' ? 'bg-green-100' : 'bg-green-500 text-white'}`}>
                      ✓
                    </div>
                    <span className="text-xs font-semibold">Paid</span>
                  </div>
                  <div className={`flex flex-col items-center ${['processing', 'shipped', 'completed'].includes(order.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${['processing', 'shipped', 'completed'].includes(order.status) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                      {['processing', 'shipped', 'completed'].includes(order.status) ? '✓' : '2'}
                    </div>
                    <span className="text-xs font-semibold">Processing</span>
                  </div>
                  <div className={`flex flex-col items-center ${['shipped', 'completed'].includes(order.status) ? 'text-purple-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${['shipped', 'completed'].includes(order.status) ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
                      {['shipped', 'completed'].includes(order.status) ? '✓' : '3'}
                    </div>
                    <span className="text-xs font-semibold">Shipped</span>
                  </div>
                  <div className={`flex flex-col items-center ${order.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${order.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                      {order.status === 'completed' ? '✓' : '4'}
                    </div>
                    <span className="text-xs font-semibold">Delivered</span>
                  </div>
                </div>
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10" style={{ top: '2.5rem' }}></div>
              </div>

              {/* Tracking Info */}
              {order.tracking_number && (
                <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3">Tracking Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-blue-700">Tracking Number:</span>
                      <p className="font-mono text-lg font-bold text-blue-900">{order.tracking_number}</p>
                    </div>
                    {order.carrier && (
                      <div>
                        <span className="text-sm text-blue-700">Carrier:</span>
                        <p className="font-semibold text-blue-900">{order.carrier}</p>
                      </div>
                    )}
                    {order.estimated_delivery && (
                      <div>
                        <span className="text-sm text-blue-700">Estimated Delivery:</span>
                        <p className="font-semibold text-blue-900">{order.estimated_delivery}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Order ID</span>
                  <p className="font-mono text-sm mt-1">{order.order_id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Order Date</span>
                  <p className="mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Item</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{item.product_code}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-semibold">{currency}{item.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-right font-semibold">Subtotal:</td>
                      <td className="px-4 py-2 text-right font-semibold">{currency}{order.subtotal.toFixed(2)}</td>
                    </tr>
                    {order.tax_amount > 0 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-2 text-right font-semibold">VAT:</td>
                        <td className="px-4 py-2 text-right font-semibold">{currency}{order.tax_amount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="border-t-2">
                      <td colSpan={2} className="px-4 py-3 text-right text-lg font-bold">Total:</td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-green-600">{currency}{order.total_amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Help */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Need help with your order?</strong><br />
                  Contact us at <a href="mailto:info@technifold.co.uk" className="text-blue-600 hover:underline">info@technifold.co.uk</a> or call +44 (0)1455 554491
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
