/**
 * Quote Preview Component
 * Shows sales rep exactly what customer will see with editing capabilities
 */

'use client';

import { useState } from 'react';
import MediaImage from '../shared/MediaImage';

interface Product {
  product_code: string;
  description: string;
  price?: number;
  rental_price_monthly?: number;
  currency?: string;
  type?: string;
  category?: string;
  image_url?: string;
}

interface QuoteItem {
  product: Product;
  quantity: number;
  discount_percent: number;
}

interface QuotePreviewProps {
  company: {
    company_id: string;
    company_name: string;
  };
  contact: {
    contact_id: string;
    email: string;
    full_name?: string;
    first_name?: string;
  };
  products: Product[];
  onGenerateQuote: (items: QuoteItem[], globalDiscount: number) => void;
  onBack: () => void;
}

export default function QuotePreview({
  company,
  contact,
  products,
  onGenerateQuote,
  onBack,
}: QuotePreviewProps) {
  // Initialize quote items with quantity 1 and no discount
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>(
    products.map(p => ({
      product: p,
      quantity: 1,
      discount_percent: 0,
    }))
  );

  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [viewMode, setViewMode] = useState<'rental' | 'purchase'>('rental');

  // Update quantity for a product
  const updateQuantity = (productCode: string, quantity: number) => {
    setQuoteItems(items =>
      items.map(item =>
        item.product.product_code === productCode
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  // Update discount for a product
  const updateDiscount = (productCode: string, discount: number) => {
    setQuoteItems(items =>
      items.map(item =>
        item.product.product_code === productCode
          ? { ...item, discount_percent: Math.max(0, Math.min(100, discount)) }
          : item
      )
    );
  };

  // Remove product from quote
  const removeProduct = (productCode: string) => {
    setQuoteItems(items => items.filter(item => item.product.product_code !== productCode));
  };

  // Calculate pricing
  const calculateTotals = () => {
    const toolItem = quoteItems.find(item => item.product.type === 'tool');
    if (!toolItem) return { subtotal: 0, discount: 0, total: 0 };

    const basePrice = viewMode === 'rental'
      ? (toolItem.product.rental_price_monthly || 50) * toolItem.quantity
      : (toolItem.product.price || 1500) * toolItem.quantity;

    const itemDiscount = (basePrice * toolItem.discount_percent) / 100;
    const subtotalAfterItemDiscount = basePrice - itemDiscount;
    const globalDiscountAmount = (subtotalAfterItemDiscount * globalDiscount) / 100;
    const total = subtotalAfterItemDiscount - globalDiscountAmount;

    return {
      subtotal: basePrice,
      itemDiscount,
      globalDiscountAmount,
      total,
    };
  };

  const totals = calculateTotals();
  const toolItem = quoteItems.find(item => item.product.type === 'tool');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quote Preview</h2>
            <p className="text-gray-600">
              Review and edit before sending to {contact.full_name || contact.email}
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Builder
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Company:</strong> {company.company_name} • <strong>Contact:</strong> {contact.email}
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Preview As:
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode('rental')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              viewMode === 'rental'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly Rental
          </button>
          <button
            onClick={() => setViewMode('purchase')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              viewMode === 'purchase'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            One-Time Purchase
          </button>
        </div>
      </div>

      {/* Products List with Editing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Products & Pricing</h3>

        <div className="space-y-4">
          {quoteItems.map((item) => (
            <div
              key={item.product.product_code}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                {item.product.image_url && (
                  <div className="w-24 h-24 bg-gray-50 rounded-lg p-2 flex-shrink-0">
                    <MediaImage
                      src={item.product.image_url}
                      alt={item.product.description}
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{item.product.product_code}</p>
                      <p className="text-sm text-gray-600">{item.product.description}</p>
                      {item.product.type && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {item.product.type}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeProduct(item.product.product_code)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Quantity & Discount Controls */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.product_code, parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Discount %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount_percent}
                        onChange={(e) => updateDiscount(item.product.product_code, parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {viewMode === 'rental' ? 'Price/Month' : 'Price'}
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg font-bold text-gray-900">
                        £{viewMode === 'rental'
                          ? (item.product.rental_price_monthly || 50)
                          : (item.product.price || 1500)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Discount */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">
              Additional Global Discount:
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={globalDiscount}
              onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white rounded-xl border-2 border-blue-500 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Will See</h3>

        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span className="font-semibold">£{totals.subtotal.toFixed(2)}{viewMode === 'rental' ? '/month' : ''}</span>
          </div>
          {toolItem && toolItem.discount_percent > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Product Discount ({toolItem.discount_percent}%):</span>
              <span className="font-semibold">-£{totals.itemDiscount.toFixed(2)}</span>
            </div>
          )}
          {globalDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Additional Discount ({globalDiscount}%):</span>
              <span className="font-semibold">-£{totals.globalDiscountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-3 border-t-2 border-gray-300 flex justify-between text-xl font-bold text-gray-900">
            <span>Total:</span>
            <span className="text-blue-600">£{totals.total.toFixed(2)}{viewMode === 'rental' ? '/month' : ''}</span>
          </div>
        </div>

        {viewMode === 'rental' && (
          <div className="mt-6 pt-6 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-bold text-blue-900 mb-2">Rental Terms Customer Will Accept:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>✓ 30-day free trial period</li>
              <li>✓ 24-month minimum rental term</li>
              <li>✓ Billing begins after trial period</li>
              <li>✓ Equipment remains property of Technifold</li>
            </ul>
          </div>
        )}

        {viewMode === 'purchase' && (
          <div className="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-lg p-4">
            <p className="text-sm font-bold text-green-900 mb-2">Purchase Terms:</p>
            <ul className="text-xs text-green-800 space-y-1">
              <li>✓ One-time payment</li>
              <li>✓ Full ownership transferred on delivery</li>
              <li>✓ Standard warranty included</li>
              <li>✓ Free shipping</li>
            </ul>
          </div>
        )}
      </div>

      {/* Generate Quote Button */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          onClick={() => onGenerateQuote(quoteItems, globalDiscount)}
          disabled={quoteItems.length === 0}
          className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          ✓ Approve & Generate Quote Link
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          This will create the final quote link with these exact products, quantities, and pricing
        </p>
      </div>
    </div>
  );
}
