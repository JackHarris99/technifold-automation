/**
 * Quote Preview Component
 * Shows sales rep exactly what customer will see - mimics the actual quote page
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

interface ProductWithSelection extends Product {
  quantity: number;
  discount_percent: number;
}

export default function QuotePreview({
  company,
  contact,
  products,
  onGenerateQuote,
  onBack,
}: QuotePreviewProps) {
  // Product selection state - customers can choose which products to include
  const [productSelections, setProductSelections] = useState<ProductWithSelection[]>(
    products.map(p => ({
      ...p,
      quantity: 1,
      discount_percent: 0,
    }))
  );

  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [purchaseType, setPurchaseType] = useState<'rental' | 'purchase'>('rental');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [editMode, setEditMode] = useState(false); // Toggle between customer view and editing

  // Update quantity for a product (0 = exclude from quote)
  const updateQuantity = (productCode: string, quantity: number) => {
    setProductSelections(items =>
      items.map(item =>
        item.product_code === productCode
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      )
    );
  };

  // Update discount for a product
  const updateDiscount = (productCode: string, discount: number) => {
    setProductSelections(items =>
      items.map(item =>
        item.product_code === productCode
          ? { ...item, discount_percent: Math.max(0, Math.min(100, discount)) }
          : item
      )
    );
  };

  // Get selected products (quantity > 0)
  const selectedProducts = productSelections.filter(p => p.quantity > 0);

  // Calculate line item pricing for each product
  const calculateLineItems = () => {
    return selectedProducts.map(product => {
      const rentalBase = (product.rental_price_monthly || 0) * product.quantity;
      const purchaseBase = (product.price || 0) * product.quantity;

      const rentalDiscount = (rentalBase * product.discount_percent) / 100;
      const purchaseDiscount = (purchaseBase * product.discount_percent) / 100;

      return {
        product,
        rentalBase,
        purchaseBase,
        rentalDiscount,
        purchaseDiscount,
        rentalSubtotal: rentalBase - rentalDiscount,
        purchaseSubtotal: purchaseBase - purchaseDiscount,
      };
    });
  };

  const lineItems = calculateLineItems();

  // Calculate totals
  const calculateTotals = () => {
    const rentalSubtotal = lineItems.reduce((sum, item) => sum + item.rentalSubtotal, 0);
    const purchaseSubtotal = lineItems.reduce((sum, item) => sum + item.purchaseSubtotal, 0);

    const rentalGlobalDiscount = (rentalSubtotal * globalDiscount) / 100;
    const purchaseGlobalDiscount = (purchaseSubtotal * globalDiscount) / 100;

    return {
      rentalSubtotal,
      purchaseSubtotal,
      rentalGlobalDiscount,
      purchaseGlobalDiscount,
      rentalTotal: rentalSubtotal - rentalGlobalDiscount,
      purchaseTotal: purchaseSubtotal - purchaseGlobalDiscount,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Control Bar - Sticky at top */}
      <div className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Quote Preview Mode</div>
              <div className="text-sm">
                <strong>{company.company_name}</strong> • {contact.email}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  editMode
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {editMode ? '👁️ Preview Mode' : '✏️ Edit Mode'}
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-sm"
              >
                ← Back to Builder
              </button>
              <button
                onClick={() => {
                  const items = selectedProducts.map(p => ({
                    product: {
                      product_code: p.product_code,
                      description: p.description,
                      price: p.price,
                      rental_price_monthly: p.rental_price_monthly,
                      currency: p.currency,
                      type: p.type,
                      category: p.category,
                      image_url: p.image_url,
                    },
                    quantity: p.quantity,
                    discount_percent: p.discount_percent,
                  }));
                  onGenerateQuote(items, globalDiscount);
                }}
                disabled={selectedProducts.length === 0}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-sm"
              >
                ✓ Generate Quote Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Customer-Facing Quote Page */}
      <div className="bg-white border-b border-gray-200 py-5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-8">
            {/* Brand Logos Placeholder */}
            <div className="h-12 w-32 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500 font-semibold">TECHNIFOLD</span>
            </div>
            <div className="h-10 w-28 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500 font-semibold">TECHNICREASE</span>
            </div>
            <div className="h-10 w-28 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500 font-semibold">CREASESTREAM</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">{/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Solution Quote
          </h1>
          <p className="text-xl text-gray-600">
            For {company.company_name}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Contact: {contact.full_name || contact.email}
          </p>
        </div>

        {/* Edit Mode Panel */}
        {editMode && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-yellow-900 mb-4">✏️ Edit Pricing & Products</h3>

            <div className="space-y-4 mb-6">
              {productSelections.map((product) => (
                <div key={product.product_code} className="bg-white rounded-lg border border-yellow-300 p-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="col-span-1">
                      <p className="font-bold text-sm">{product.product_code}</p>
                      <p className="text-xs text-gray-600">{product.description}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={product.quantity}
                        onChange={(e) => updateQuantity(product.product_code, parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">(Set to 0 to exclude)</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Discount %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={product.discount_percent}
                        onChange={(e) => updateDiscount(product.product_code, parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Rental Price</p>
                      <p className="text-sm font-bold">£{product.rental_price_monthly || 50}/mo</p>
                      <p className="text-xs text-gray-600">Purchase: £{product.price || 1500}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-yellow-300 p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Global Discount (applies to all products):
              </label>
              <div className="flex items-center gap-3">
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
        )}

        {/* Itemized Quote Table - Customer Can Adjust Quantities */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Itemized Quote</h2>
          <p className="text-sm text-gray-600 mb-6">Adjust quantities below to see live pricing updates</p>

          <div className="space-y-4">
            {lineItems.map((item) => (
              <div key={item.product.product_code} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
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

                  {/* Product Details & Pricing */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{item.product.product_code}</h3>
                        <p className="text-sm text-gray-600">{item.product.description}</p>
                        {item.product.type && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {item.product.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.product_code, item.product.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-700"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.product.quantity}
                            onChange={(e) => updateQuantity(item.product.product_code, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border-2 border-gray-300 rounded text-center font-bold"
                          />
                          <button
                            onClick={() => updateQuantity(item.product.product_code, item.product.quantity + 1)}
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded font-bold text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Unit Price (Rental)</label>
                        <p className="text-lg font-bold text-gray-900">£{(item.product.rental_price_monthly || 0).toFixed(2)}/mo</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Unit Price (Purchase)</label>
                        <p className="text-lg font-bold text-gray-900">£{(item.product.price || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded p-2">
                        <p className="text-xs text-blue-700 font-semibold">Line Total (Rental)</p>
                        <p className="text-xl font-bold text-blue-900">£{item.rentalSubtotal.toFixed(2)}/mo</p>
                        {item.rentalDiscount > 0 && (
                          <p className="text-xs text-green-600">Saved £{item.rentalDiscount.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-700 font-semibold">Line Total (Purchase)</p>
                        <p className="text-xl font-bold text-gray-900">£{item.purchaseSubtotal.toFixed(2)}</p>
                        {item.purchaseDiscount > 0 && (
                          <p className="text-xs text-green-600">Saved £{item.purchaseDiscount.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary - Both Options Visible */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Total Pricing</h2>
          <p className="text-gray-600 mb-6">Both rental and purchase options shown below - choose your preferred option at checkout</p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Rental Option */}
            <button
              onClick={() => setPurchaseType('rental')}
              className={`border-4 rounded-2xl p-8 text-left transition-all ${
                purchaseType === 'rental'
                  ? 'border-blue-600 bg-blue-50 shadow-xl'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  RECOMMENDED
                </span>
                {purchaseType === 'rental' && (
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-2">Monthly Rental</h3>
              <div className="text-5xl font-bold text-blue-600 mb-6">
                £{totals.rentalTotal.toFixed(2)}
                <span className="text-2xl text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Total for all {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''}</p>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700"><strong>30-day free trial</strong> - Try before you commit</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">24-month minimum term</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">No large upfront cost</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Return or continue after term</span>
                </li>
              </ul>
            </button>

            {/* Purchase Option */}
            <button
              onClick={() => setPurchaseType('purchase')}
              className={`border-4 rounded-2xl p-8 text-left transition-all ${
                purchaseType === 'purchase'
                  ? 'border-gray-600 bg-gray-50 shadow-xl'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-end mb-4 h-10">
                {purchaseType === 'purchase' && (
                  <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-2">Purchase Outright</h3>
              <div className="text-5xl font-bold text-gray-600 mb-6">
                £{totals.purchaseTotal.toFixed(2)}
                <span className="text-2xl text-gray-500"> once</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Total for all {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''}</p>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Own the tool outright</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">No monthly payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Yours to keep forever</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-500">Large upfront investment</span>
                </li>
              </ul>
            </button>
          </div>

          {/* Discount Breakdown (if applicable) */}
          {globalDiscount > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Global Discount Applied</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-blue-900">Rental Pricing:</p>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">£{totals.rentalSubtotal.toFixed(2)}/mo</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Global Discount ({globalDiscount}%):</span>
                    <span className="font-semibold">-£{totals.rentalGlobalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t-2 border-blue-300 flex justify-between text-lg font-bold text-blue-900">
                    <span>Final Total:</span>
                    <span>£{totals.rentalTotal.toFixed(2)}/mo</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-900">Purchase Pricing:</p>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">£{totals.purchaseSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Global Discount ({globalDiscount}%):</span>
                    <span className="font-semibold">-£{totals.purchaseGlobalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t-2 border-gray-300 flex justify-between text-lg font-bold text-gray-900">
                    <span>Final Total:</span>
                    <span>£{totals.purchaseTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terms and Checkout - Customer View */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Order</h2>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 mb-8 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline font-semibold">
                Terms and Conditions
              </a>
              {purchaseType === 'rental' && (
                <> and understand that:
                  <ul className="mt-3 ml-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>The 30-day free trial begins upon delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Monthly payments of £{totals.rentalTotal.toFixed(2)} begin after the trial period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>I am committing to a 24-month minimum term</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>If I default on payment, the full tool price is due</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>I will return the tool at my expense if I cancel after the minimum term</span>
                    </li>
                  </ul>
                </>
              )}
            </span>
          </label>

          {/* Shipping Address Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Shipping address will be collected on the next page before payment.
            </p>
          </div>

          {/* Checkout Button */}
          <button
            disabled={!agreedToTerms}
            className="w-full bg-blue-600 text-white px-8 py-5 rounded-xl font-bold text-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {purchaseType === 'rental' ? (
              <>
                🎉 Start 30-Day Free Trial
                <div className="text-sm font-normal mt-1">Then £{totals.rentalTotal.toFixed(2)}/month for {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''}</div>
              </>
            ) : (
              <>
                💳 Pay £{totals.purchaseTotal.toFixed(2)} Now
                <div className="text-sm font-normal mt-1">One-time payment for {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''}</div>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            🔒 Secure payment powered by Stripe
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t border-gray-300 py-8 mt-12">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Questions about this quote? Contact us at{' '}
              <a href="mailto:sales@technifold.com" className="text-blue-600 hover:underline font-semibold">
                sales@technifold.com
              </a>
            </p>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Technifold. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
