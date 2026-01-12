/**
 * Distributor Dashboard Component
 * Product catalog, cart, and invoice history
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  consumable_code: string;
  name: string;
  unit_price: number;
  pricing_tier: string | null;
  category: string | null;
  min_order_qty: number | null;
}

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  status: string | null;
}

interface DistributorDashboardProps {
  distributor: {
    company_id: string;
    company_name: string;
  };
  invoices: Invoice[];
  products: Product[];
}

export default function DistributorDashboard({
  distributor,
  invoices,
  products,
}: DistributorDashboardProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.consumable_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateQuantity = (productCode: string, quantity: number) => {
    const newCart = new Map(cart);
    if (quantity <= 0) {
      newCart.delete(productCode);
    } else {
      newCart.set(productCode, quantity);
    }
    setCart(newCart);
  };

  const cartItems = Array.from(cart.entries())
    .map(([code, qty]) => {
      const product = products.find((p) => p.consumable_code === code);
      return product ? { product, quantity: qty } : null;
    })
    .filter((item): item is { product: Product; quantity: number } => item !== null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.unit_price * item.quantity,
    0
  );

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/distributor/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product_code: item.product.consumable_code,
            quantity: item.quantity,
            unit_price: item.product.unit_price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      // Refresh page to show new invoice
      router.refresh();
      setCart(new Map());
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column - Product Catalog */}
      <div className="col-span-7 space-y-4">
        {/* Search */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all"
          />
        </div>

        {/* Products */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-[#e8e8e8]">
            <h2 className="text-[17px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">Product Catalog</h2>
            <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="px-8 pb-8 pt-4 space-y-4 max-h-[600px] overflow-y-auto">
            {filteredProducts.map((product) => {
              const currentQty = cart.get(product.consumable_code) || 0;

              return (
                <div
                  key={product.consumable_code}
                  className="p-4 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-[14px] font-[600] text-[#0a0a0a]">{product.name}</div>
                      <div className="text-[12px] text-[#1e293b] mt-1 font-mono">{product.consumable_code}</div>
                      {product.category && (
                        <div className="text-[11px] text-[#475569] font-[500] mt-1">
                          {product.category}
                        </div>
                      )}
                      <div className="mt-2">
                        <div className="text-[18px] font-[700] text-[#0a0a0a]">
                          £{product.unit_price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-3">
                        <label className="text-[13px] text-[#1e293b] font-[500]">Qty:</label>
                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) =>
                            updateQuantity(product.consumable_code, parseInt(e.target.value) || 0)
                          }
                          className="w-20 px-3 py-2 border border-[#e8e8e8] rounded-[8px] text-center font-[600] focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column - Cart & Invoices */}
      <div className="col-span-5 space-y-6">
        {/* Cart Summary */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50/50 to-transparent border-b border-[#e8e8e8]">
            <h2 className="text-[17px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">Order Summary</h2>
            <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px] text-[#475569] font-[400]">No items in cart</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.consumable_code}
                      className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-[600] text-[#0a0a0a] leading-tight">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-[#475569] font-mono mt-0.5">
                            {item.product.consumable_code}
                          </div>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.product.consumable_code, 0)}
                          className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-[#475569] font-[500]">
                          {item.quantity} × £{item.product.unit_price.toFixed(2)}
                        </div>
                        <div className="text-[14px] font-[700] text-[#0a0a0a]">
                          £{(item.quantity * item.product.unit_price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-[#e8e8e8] pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[15px] font-[700] text-[#0a0a0a]">Subtotal</div>
                    <div className="text-[24px] font-[800] text-[#15803d] tracking-[-0.02em]">
                      £{subtotal.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || cartItems.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white rounded-[10px] font-[600] text-[14px] tracking-[-0.01em] hover:from-[#14532d] hover:to-[#15803d] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting Order...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50/50 to-transparent border-b border-[#e8e8e8]">
            <h2 className="text-[17px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">Recent Orders</h2>
            <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="p-6 max-h-[400px] overflow-y-auto">
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px] text-[#475569] font-[400]">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.slice(0, 10).map((invoice) => (
                  <div
                    key={invoice.invoice_id}
                    className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-[13px] font-[600] text-[#0a0a0a] font-mono">
                            {invoice.invoice_number}
                          </div>
                          {invoice.status && (
                            <div className={`px-2 py-0.5 rounded-[6px] text-[9px] font-[700] uppercase tracking-wide ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] text-[#475569] font-[500] mt-0.5">
                          {new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="text-[15px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">
                        £{invoice.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
