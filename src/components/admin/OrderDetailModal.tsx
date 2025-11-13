'use client';

import { useState, useEffect } from 'react';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function OrderDetailModal({ orderId, onClose, onUpdate }: OrderDetailModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
        setStatus(data.order.status);
        setTrackingNumber(data.order.tracking_number || '');
        setCarrier(data.order.carrier || '');
        setEstimatedDelivery(data.order.estimated_delivery || '');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || null,
          carrier: carrier || null,
          estimated_delivery: estimatedDelivery || null,
        }),
      });

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const currency = order.currency === 'GBP' ? '£' : order.currency;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Order ID</h3>
              <p className="font-mono text-sm">{order.order_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Created</h3>
              <p>{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Company</h3>
              <p className="font-semibold">{order.companies?.company_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contact</h3>
              <p className="font-semibold">{order.contacts?.full_name}</p>
              <p className="text-sm text-gray-600">{order.contacts?.email}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Item</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Total</th>
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
                      <td className="px-4 py-3 text-right">{currency}{item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{currency}{item.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-semibold">Subtotal:</td>
                    <td className="px-4 py-2 text-right font-semibold">{currency}{order.subtotal.toFixed(2)}</td>
                  </tr>
                  {order.tax_amount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-semibold">VAT:</td>
                      <td className="px-4 py-2 text-right font-semibold">{currency}{order.tax_amount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2">
                    <td colSpan={3} className="px-4 py-3 text-right text-lg font-bold">Total:</td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-green-600">{currency}{order.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Management */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Management</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Carrier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select carrier...</option>
                  <option value="Royal Mail">Royal Mail</option>
                  <option value="DHL">DHL</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Estimated Delivery */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Delivery</label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  placeholder="e.g., Friday, Feb 2nd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {status === 'shipped' && trackingNumber && carrier && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📧 <strong>Shipping notification will be sent automatically</strong> when you save with status "Shipped" and tracking info.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
