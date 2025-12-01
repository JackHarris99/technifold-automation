/**
 * History Tab - Visual order history with products, quantities, images
 */

'use client';

import { useState, useEffect } from 'react';
import MediaImage from '@/components/shared/MediaImage';

interface OrderItem {
  product_code: string;
  quantity: number;
  price: number;
  description: string;
}

interface Order {
  order_id: string;
  created_at: string;
  total_amount: number;
  payment_status: string;
  status: string;
  items: OrderItem[];
  stripe_checkout_session_id?: string;
  books_invoice_id?: string;
}

interface ProductImage {
  product_code: string;
  image_url: string | null;
}

export default function HistoryTab({ companyId, orders }: { companyId: string; orders: Order[] }) {
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState(true);

  // Fetch product images on mount
  useEffect(() => {
    async function fetchImages() {
      if (orders.length === 0) return;

      // Get all unique product codes from all orders
      const allProductCodes = new Set<string>();
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => allProductCodes.add(item.product_code));
        }
      });

      if (allProductCodes.size === 0) return;

      try {
        const response = await fetch('/api/admin/products/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_codes: Array.from(allProductCodes) })
        });

        if (response.ok) {
          const data = await response.json();
          const imageMap: Record<string, string> = {};
          data.products?.forEach((p: ProductImage) => {
            if (p.image_url) imageMap[p.product_code] = p.image_url;
          });
          setProductImages(imageMap);
        }
      } catch (err) {
        console.error('Failed to fetch product images:', err);
      } finally {
        setLoadingImages(false);
      }
    }

    fetchImages();
  }, [orders]);

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">✓ Paid</span>;
    }
    if (paymentStatus === 'pending') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">⏱ Pending</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <p className="text-gray-600">Complete purchase history with product details</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📦</div>
          <p className="text-gray-600 text-lg font-semibold">No orders yet</p>
          <p className="text-gray-500 text-sm mt-2">Orders will appear here once the customer makes a purchase</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: Order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

            return (
              <div key={order.order_id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {order.books_invoice_id ? `Invoice #${order.books_invoice_id}` : `Order #${order.order_id.split('-')[0].toUpperCase()}`}
                      </h3>
                      {getStatusBadge(order.status, order.payment_status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📅 {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                      <span>•</span>
                      <span>📦 {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      £{order.total_amount?.toFixed(2) || '0.00'}
                    </div>
                    {order.stripe_checkout_session_id && (
                      <a
                        href={`https://dashboard.stripe.com/search?query=${order.stripe_checkout_session_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View in Stripe →
                      </a>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const imageUrl = productImages[item.product_code];

                    return (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                          <MediaImage
                            src={imageUrl}
                            alt={item.description}
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 truncate">{item.description || item.product_code}</div>
                          <div className="text-sm text-gray-600 font-mono">{item.product_code}</div>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-gray-500">Qty</div>
                            <div className="font-bold text-gray-900">{item.quantity}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Unit</div>
                            <div className="font-bold text-gray-900">£{item.price?.toFixed(2)}</div>
                          </div>
                          <div className="text-center min-w-[80px]">
                            <div className="text-gray-500">Total</div>
                            <div className="font-bold text-gray-900">£{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                {items.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Order Total</div>
                      <div className="text-xl font-bold text-gray-900">£{order.total_amount?.toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
