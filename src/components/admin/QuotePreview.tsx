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

  // Calculate pricing
  const calculatePricing = () => {
    const toolProduct = selectedProducts.find(p => p.type === 'tool');
    if (!toolProduct) return { rental: 0, purchase: 0, rentalBase: 0, purchaseBase: 0, itemDiscount: 0, globalDiscountAmount: 0 };

    // Base prices
    const rentalBase = (toolProduct.rental_price_monthly || 50) * toolProduct.quantity;
    const purchaseBase = (toolProduct.price || 1500) * toolProduct.quantity;

    // Apply product discount
    const rentalItemDiscount = (rentalBase * toolProduct.discount_percent) / 100;
    const purchaseItemDiscount = (purchaseBase * toolProduct.discount_percent) / 100;

    const rentalAfterItemDiscount = rentalBase - rentalItemDiscount;
    const purchaseAfterItemDiscount = purchaseBase - purchaseItemDiscount;

    // Apply global discount
    const rentalGlobalDiscount = (rentalAfterItemDiscount * globalDiscount) / 100;
    const purchaseGlobalDiscount = (purchaseAfterItemDiscount * globalDiscount) / 100;

    return {
      rental: rentalAfterItemDiscount - rentalGlobalDiscount,
      purchase: purchaseAfterItemDiscount - purchaseGlobalDiscount,
      rentalBase,
      purchaseBase,
      itemDiscount: purchaseType === 'rental' ? rentalItemDiscount : purchaseItemDiscount,
      globalDiscountAmount: purchaseType === 'rental' ? rentalGlobalDiscount : purchaseGlobalDiscount,
    };
  };

  const pricing = calculatePricing();

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

        {/* Products Section - Customer View */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Solutions Included in Your Quote</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {selectedProducts.map(product => (
              <div key={product.product_code} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-colors">
                {product.image_url && (
                  <div className="w-full bg-gray-50 p-4 h-40 flex items-center justify-center">
                    <MediaImage
                      src={product.image_url}
                      alt={product.description}
                      width={150}
                      height={150}
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                )}
                <div className="p-4 bg-white">
                  <p className="text-sm font-bold text-blue-600 mb-1">{product.product_code}</p>
                  <p className="text-xs text-gray-600 line-clamp-3">{product.description}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Quantity: <span className="font-bold text-gray-900">{product.quantity}</span></p>
                    {product.discount_percent > 0 && (
                      <p className="text-xs text-green-600 font-semibold">{product.discount_percent}% discount applied</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary - Both Options Visible */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Payment Option</h2>
          <p className="text-gray-600 mb-6">Select rental or purchase below. Final pricing shown at checkout.</p>

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
                £{pricing.rental.toFixed(2)}
                <span className="text-2xl text-gray-600">/month</span>
              </div>

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
                £{pricing.purchase.toFixed(2)}
                <span className="text-2xl text-gray-500"> once</span>
              </div>

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
          {(globalDiscount > 0 || selectedProducts.some(p => p.discount_percent > 0)) && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Your Discounts Applied</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Price ({purchaseType === 'rental' ? 'Monthly Rental' : 'Purchase'}):</span>
                  <span className="font-semibold">£{(purchaseType === 'rental' ? pricing.rentalBase : pricing.purchaseBase).toFixed(2)}</span>
                </div>
                {selectedProducts.some(p => p.discount_percent > 0) && (
                  <div className="flex justify-between text-green-700">
                    <span>Product Discount:</span>
                    <span className="font-semibold">-£{pricing.itemDiscount.toFixed(2)}</span>
                  </div>
                )}
                {globalDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Additional Discount ({globalDiscount}%):</span>
                    <span className="font-semibold">-£{pricing.globalDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t-2 border-blue-300 flex justify-between text-lg font-bold text-blue-900">
                  <span>Final Price:</span>
                  <span>£{(purchaseType === 'rental' ? pricing.rental : pricing.purchase).toFixed(2)}{purchaseType === 'rental' ? '/mo' : ''}</span>
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
                      <span>Monthly payments of £{pricing.rental.toFixed(2)} begin after the trial period</span>
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
                <div className="text-sm font-normal mt-1">Then £{pricing.rental.toFixed(2)}/month</div>
              </>
            ) : (
              <>
                💳 Pay £{pricing.purchase.toFixed(2)} Now
                <div className="text-sm font-normal mt-1">One-time payment for full ownership</div>
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
