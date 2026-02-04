/**
 * Distributor Order Review Component
 * Interactive UI for reviewing stock, addresses, and creating invoices
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface OrderItem {
  item_id: string;
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  status: string;
  image_url: string | null;
}

interface Order {
  order_id: string;
  company_id: string;
  user_email: string;
  user_name: string;
  subtotal: number;
  predicted_shipping: number;
  vat_amount: number;
  total_amount: number;
  billing_address_line_1: string | null;
  billing_address_line_2: string | null;
  billing_city: string | null;
  billing_state_province: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  vat_number: string | null;
  shipping_address_line_1: string | null;
  shipping_address_line_2: string | null;
  shipping_city: string | null;
  shipping_state_province: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  companies: {
    company_name: string;
    vat_number: string | null;
    stripe_customer_id: string | null;
  };
}

interface Props {
  order: Order;
  items: OrderItem[];
  currentUser: any;
  backUrl?: string;
}

export default function DistributorOrderReview({ order, items, currentUser, backUrl = '/admin/distributor-orders/pending' }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Item statuses: in_stock or back_order
  const [itemStatuses, setItemStatuses] = useState<Record<string, 'in_stock' | 'back_order'>>(
    () => Object.fromEntries(items.map(item => [item.item_id, 'in_stock']))
  );

  // Back-order dates
  const [backOrderDates, setBackOrderDates] = useState<Record<string, string>>({});
  const [backOrderNotes, setBackOrderNotes] = useState<Record<string, string>>({});

  // Billing address overrides (start with original values)
  const [billingLine1, setBillingLine1] = useState(order.billing_address_line_1 || '');
  const [billingLine2, setBillingLine2] = useState(order.billing_address_line_2 || '');
  const [billingCity, setBillingCity] = useState(order.billing_city || '');
  const [billingState, setBillingState] = useState(order.billing_state_province || '');
  const [billingPostal, setBillingPostal] = useState(order.billing_postal_code || '');
  const [billingCountry, setBillingCountry] = useState(order.billing_country || '');

  // Shipping address overrides (start with original values)
  const [shippingLine1, setShippingLine1] = useState(order.shipping_address_line_1 || '');
  const [shippingLine2, setShippingLine2] = useState(order.shipping_address_line_2 || '');
  const [shippingCity, setShippingCity] = useState(order.shipping_city || '');
  const [shippingState, setShippingState] = useState(order.shipping_state_province || '');
  const [shippingPostal, setShippingPostal] = useState(order.shipping_postal_code || '');
  const [shippingCountry, setShippingCountry] = useState(order.shipping_country || '');

  // Shipping cost override
  const [shippingCost, setShippingCost] = useState(order.predicted_shipping.toString());
  const [freeShipping, setFreeShipping] = useState(false);
  const [shippingOverrideReason, setShippingOverrideReason] = useState('');

  // Item quantity and price overrides
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries(items.map(item => [item.item_id, item.quantity]))
  );
  const [itemPrices, setItemPrices] = useState<Record<string, number>>(
    () => Object.fromEntries(items.map(item => [item.item_id, item.unit_price]))
  );

  // Calculate invoice total preview with updated quantities and prices
  const invoicePreview = useMemo(() => {
    const inStockItems = items.filter(item => itemStatuses[item.item_id] === 'in_stock');
    const subtotal = inStockItems.reduce((sum, item) => {
      const qty = itemQuantities[item.item_id] || item.quantity;
      const price = itemPrices[item.item_id] || item.unit_price;
      return sum + (qty * price);
    }, 0);
    const shipping = freeShipping ? 0 : parseFloat(shippingCost) || 0;
    const taxableAmount = subtotal + shipping;

    // VAT calculation (simplified - use order's original VAT rate)
    const vatRate = order.subtotal > 0 ? order.vat_amount / (order.subtotal + order.predicted_shipping) : 0;
    const vat = taxableAmount * vatRate;
    const total = subtotal + shipping + vat;

    return {
      inStockItems,
      backOrderItems: items.filter(item => itemStatuses[item.item_id] === 'back_order'),
      subtotal,
      shipping,
      vat,
      total,
    };
  }, [items, itemStatuses, itemQuantities, itemPrices, shippingCost, freeShipping, order]);

  const handleApproveOrder = async () => {
    if (submitting) return;

    // Validate that at least one item is in stock
    if (invoicePreview.inStockItems.length === 0) {
      alert('Cannot create invoice with no items in stock. Please mark at least one item as in stock.');
      return;
    }

    // Validate back-order items have predicted dates
    const backOrderItemsWithoutDates = invoicePreview.backOrderItems.filter(
      item => !backOrderDates[item.item_id]
    );
    if (backOrderItemsWithoutDates.length > 0) {
      alert('Please set predicted delivery dates for all back-ordered items.');
      return;
    }

    // Validate shipping override reason if shipping was changed
    const shippingChanged = freeShipping || parseFloat(shippingCost) !== order.predicted_shipping;
    if (shippingChanged && !shippingOverrideReason.trim()) {
      alert('Please provide a reason for the shipping cost override.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/distributor-orders/${order.order_id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_statuses: itemStatuses,
          back_order_dates: backOrderDates,
          back_order_notes: backOrderNotes,

          // Item quantity and price overrides
          item_quantities: itemQuantities,
          item_prices: itemPrices,

          // Billing address (check if changed from original)
          admin_billing_line_1: billingLine1 !== order.billing_address_line_1 ? billingLine1 : null,
          admin_billing_line_2: billingLine2 !== order.billing_address_line_2 ? billingLine2 : null,
          admin_billing_city: billingCity !== order.billing_city ? billingCity : null,
          admin_billing_state: billingState !== order.billing_state_province ? billingState : null,
          admin_billing_postal: billingPostal !== order.billing_postal_code ? billingPostal : null,
          admin_billing_country: billingCountry !== order.billing_country ? billingCountry : null,

          // Shipping address (check if changed from original)
          admin_shipping_line_1: shippingLine1 !== order.shipping_address_line_1 ? shippingLine1 : null,
          admin_shipping_line_2: shippingLine2 !== order.shipping_address_line_2 ? shippingLine2 : null,
          admin_shipping_city: shippingCity !== order.shipping_city ? shippingCity : null,
          admin_shipping_state: shippingState !== order.shipping_state_province ? shippingState : null,
          admin_shipping_postal: shippingPostal !== order.shipping_postal_code ? shippingPostal : null,
          admin_shipping_country: shippingCountry !== order.shipping_country ? shippingCountry : null,

          // Shipping override
          confirmed_shipping: shippingChanged ? (freeShipping ? 0 : parseFloat(shippingCost)) : null,
          shipping_override_reason: shippingChanged ? shippingOverrideReason : null,

          reviewed_by: currentUser.sales_rep_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve order');
      }

      alert(`Invoice created successfully!\nInvoice ID: ${data.invoice_id}\nStripe Invoice: ${data.stripe_invoice_id}`);
      router.push(backUrl);
      router.refresh();
    } catch (error: any) {
      console.error('Error approving order:', error);
      alert(`Failed to approve order: ${error.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">
              Review Order: <span className="text-[#1e40af] font-mono">{order.order_id}</span>
            </h1>
            <p className="text-sm text-[#666]">
              {order.companies.company_name} • Submitted by {order.user_name} ({order.user_email})
            </p>
            {order.po_number && (
              <p className="text-sm text-[#666] mt-1">
                <strong>PO Number:</strong> <span className="font-mono text-[#1e40af]">{order.po_number}</span>
              </p>
            )}
          </div>
          <a
            href={backUrl}
            className="px-4 py-2 border border-[#e8e8e8] text-[#475569] rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Orders
          </a>
        </div>
      </div>

      {/* Order Items with Stock Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-6">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">Order Items & Stock Availability</h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.item_id}
              className="border-2 border-blue-200 rounded-xl p-4 hover:border-blue-400 transition-all"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative w-24 h-24 bg-[#f9fafb] rounded-lg flex-shrink-0 overflow-hidden border border-[#e8e8e8]">
                  <Image
                    src={item.image_url || '/product-placeholder.svg'}
                    alt={item.description}
                    fill
                    className="object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/product-placeholder.svg';
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-[#0a0a0a] text-lg mb-1">
                        {item.description}
                      </div>
                      <div className="text-sm text-[#666] font-mono">{item.product_code}</div>

                      {/* Editable Quantity and Price */}
                      <div className="mt-3 flex items-center gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#666] mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={itemQuantities[item.item_id] || item.quantity}
                            onChange={(e) => setItemQuantities(prev => ({
                              ...prev,
                              [item.item_id]: parseInt(e.target.value) || 0
                            }))}
                            className="w-20 px-2 py-1 border border-[#e8e8e8] rounded text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[#666] text-lg">×</div>
                        <div>
                          <label className="block text-xs font-semibold text-[#666] mb-1">Unit Price</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={itemPrices[item.item_id] || item.unit_price}
                            onChange={(e) => setItemPrices(prev => ({
                              ...prev,
                              [item.item_id]: parseFloat(e.target.value) || 0
                            }))}
                            className="w-24 px-2 py-1 border border-[#e8e8e8] rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[#666] text-lg">=</div>
                        <div>
                          <label className="block text-xs font-semibold text-[#666] mb-1">Line Total</label>
                          <div className="text-lg font-bold text-[#16a34a]">
                            £{((itemQuantities[item.item_id] || item.quantity) * (itemPrices[item.item_id] || item.unit_price)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status Selection */}
                  <div className="mt-4 flex items-start gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`in-stock-${item.item_id}`}
                        checked={itemStatuses[item.item_id] === 'in_stock'}
                        onChange={() => setItemStatuses(prev => ({ ...prev, [item.item_id]: 'in_stock' }))}
                        className="w-4 h-4 text-green-600"
                      />
                      <label htmlFor={`in-stock-${item.item_id}`} className="text-sm font-semibold text-green-700 flex items-center gap-1.5 cursor-pointer">
                        ✅ In Stock
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`back-order-${item.item_id}`}
                        checked={itemStatuses[item.item_id] === 'back_order'}
                        onChange={() => setItemStatuses(prev => ({ ...prev, [item.item_id]: 'back_order' }))}
                        className="w-4 h-4 text-amber-600"
                      />
                      <label htmlFor={`back-order-${item.item_id}`} className="text-sm font-semibold text-amber-700 flex items-center gap-1.5 cursor-pointer">
                        📦 Back-Order
                      </label>
                    </div>
                  </div>

                  {/* Back-Order Details */}
                  {itemStatuses[item.item_id] === 'back_order' && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#0a0a0a] mb-1">
                            Predicted Delivery Date *
                          </label>
                          <input
                            type="date"
                            value={backOrderDates[item.item_id] || ''}
                            onChange={(e) => setBackOrderDates(prev => ({ ...prev, [item.item_id]: e.target.value }))}
                            className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0a0a0a] mb-1">
                            Notes (optional)
                          </label>
                          <input
                            type="text"
                            value={backOrderNotes[item.item_id] || ''}
                            onChange={(e) => setBackOrderNotes(prev => ({ ...prev, [item.item_id]: e.target.value }))}
                            placeholder="e.g., Awaiting supplier shipment"
                            className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address Review & Editing */}
      <div className="grid grid-cols-2 gap-6">
        {/* Billing Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-6">
          <h2 className="text-lg font-bold text-[#0a0a0a] mb-4">Billing Address</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#666] mb-1">Address Line 1</label>
              <input
                type="text"
                value={billingLine1}
                onChange={(e) => setBillingLine1(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666] mb-1">Address Line 2</label>
              <input
                type="text"
                value={billingLine2}
                onChange={(e) => setBillingLine2(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#666] mb-1">City</label>
                <input
                  type="text"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#666] mb-1">State/Province</label>
                <input
                  type="text"
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#666] mb-1">Postal Code</label>
                <input
                  type="text"
                  value={billingPostal}
                  onChange={(e) => setBillingPostal(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#666] mb-1">Country</label>
                <input
                  type="text"
                  value={billingCountry}
                  onChange={(e) => setBillingCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-6">
          <h2 className="text-lg font-bold text-[#0a0a0a] mb-4">Shipping Address</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#666] mb-1">Address Line 1</label>
              <input
                type="text"
                value={shippingLine1}
                onChange={(e) => setShippingLine1(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666] mb-1">Address Line 2</label>
              <input
                type="text"
                value={shippingLine2}
                onChange={(e) => setShippingLine2(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#666] mb-1">City</label>
                <input
                  type="text"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#666] mb-1">State/Province</label>
                <input
                  type="text"
                  value={shippingState}
                  onChange={(e) => setShippingState(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#666] mb-1">Postal Code</label>
                <input
                  type="text"
                  value={shippingPostal}
                  onChange={(e) => setShippingPostal(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#666] mb-1">Country</label>
                <input
                  type="text"
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Cost Override */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-6">
        <h2 className="text-lg font-bold text-[#0a0a0a] mb-4">Shipping Cost</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#666] mb-1">
              Predicted Shipping (from distributor)
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-[#e8e8e8] rounded-lg text-sm font-mono">
              £{order.predicted_shipping.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#666] mb-1">
              Confirmed Shipping Cost
            </label>
            <input
              type="number"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              disabled={freeShipping}
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={freeShipping}
                onChange={(e) => setFreeShipping(e.target.checked)}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm font-semibold text-green-700">Free Shipping</span>
            </label>
          </div>
        </div>

        {(freeShipping || parseFloat(shippingCost) !== order.predicted_shipping) && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-[#666] mb-1">
              Reason for shipping override *
            </label>
            <input
              type="text"
              value={shippingOverrideReason}
              onChange={(e) => setShippingOverrideReason(e.target.value)}
              placeholder="e.g., Promotional free shipping, Bulk discount, Corrected calculation"
              className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Invoice Preview */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-6">Invoice Preview</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#999]">In-Stock Items ({invoicePreview.inStockItems.length})</span>
            <span className="font-bold text-lg">£{invoicePreview.subtotal.toFixed(2)}</span>
          </div>

          {invoicePreview.backOrderItems.length > 0 && (
            <div className="flex justify-between items-center text-amber-400">
              <span>Back-Ordered Items ({invoicePreview.backOrderItems.length})</span>
              <span className="font-semibold">
                £{invoicePreview.backOrderItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)} (later)
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-[#999]">Shipping</span>
            <span className="font-semibold">
              {invoicePreview.shipping === 0 ? 'FREE' : `£${invoicePreview.shipping.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
            <span className="text-[#999]">VAT</span>
            <span className="font-semibold">£{invoicePreview.vat.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Invoice Total</span>
            <span className="text-3xl font-bold text-[#16a34a]">£{invoicePreview.total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleApproveOrder}
          disabled={submitting || invoicePreview.inStockItems.length === 0}
          className="w-full mt-6 py-4 bg-[#16a34a] text-white rounded-xl font-bold text-lg hover:bg-[#15803d] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Invoice...
            </span>
          ) : (
            'Approve & Create Invoice'
          )}
        </button>
      </div>
    </div>
  );
}
