/**
 * Quote Page Client Component
 * Interactive quote with rental vs purchase options
 */

'use client';

import { useState } from 'react';
import { MarketingHeader } from '../marketing/MarketingHeader';
import { MarketingFooter } from '../marketing/MarketingFooter';
import MediaImage from '../shared/MediaImage';

interface Product {
  product_code: string;
  description: string;
  image_url?: string;
  category?: string;
  price?: number;
  currency?: string;
}

interface ShippingAddress {
  address_id: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state_province?: string;
  postal_code: string;
  country: string;
}

interface QuotePageClientProps {
  company: {
    company_id: string;
    company_name: string;
    country?: string;
  };
  contact: {
    contact_id: string;
    full_name?: string;
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
  products: Product[];
  solutionCards: any[];
  existingAddress: ShippingAddress | null;
  token: string;
}

export default function QuotePageClient({
  company,
  contact,
  products,
  solutionCards,
  existingAddress,
  token
}: QuotePageClientProps) {
  const [purchaseType, setPurchaseType] = useState<'rental' | 'purchase'>('rental');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Address form state
  const [address, setAddress] = useState({
    address_line_1: existingAddress?.address_line_1 || '',
    address_line_2: existingAddress?.address_line_2 || '',
    city: existingAddress?.city || '',
    state_province: existingAddress?.state_province || '',
    postal_code: existingAddress?.postal_code || '',
    country: existingAddress?.country || company.country || 'GB',
  });

  // Calculate pricing from products table
  const calculatePrice = () => {
    if (products.length === 0) return { amount: 0, period: '' };

    // Find the tool product (type = 'tool') or use first product
    const toolProduct = products.find((p: any) => p.type === 'tool') || products[0];

    if (!toolProduct) {
      return { amount: 0, period: '' };
    }

    if (purchaseType === 'rental') {
      const rentalPrice = toolProduct.rental_price_monthly || 50; // Fallback to £50 if not set
      return {
        amount: rentalPrice,
        period: '/month',
        setup: 0,
        trial: '30-day free trial'
      };
    } else {
      const purchasePrice = toolProduct.price || 1500; // Fallback to £1500 if not set
      return {
        amount: purchasePrice,
        period: ' one-time',
        setup: 0
      };
    }
  };

  const pricing = calculatePrice();

  const handleCheckout = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    // Validate address
    if (!address.address_line_1 || !address.city || !address.postal_code) {
      alert('Please complete the shipping address');
      return;
    }

    if (!contact) {
      alert('Contact information missing');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/quote/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.company_id,
          contact_id: contact.contact_id,
          purchase_type: purchaseType,
          products: products.map(p => ({
            product_code: p.product_code,
            quantity: 1
          })),
          shipping_address: address,
          agreed_to_terms: agreedToTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Solution Quote
          </h1>
          <p className="text-xl text-gray-600">
            For {company.company_name}
          </p>
        </div>

        {/* Products Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Solutions Included</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.product_code} className="border border-gray-200 rounded-lg p-4">
                {product.image_url && (
                  <div className="w-full bg-gray-50 rounded-lg mb-3 p-2">
                    <MediaImage
                      src={product.image_url}
                      alt={product.description}
                      width={200}
                      height={200}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}
                <p className="text-sm font-semibold text-gray-900">{product.product_code}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Option</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Rental Option */}
            <button
              onClick={() => setPurchaseType('rental')}
              className={`border-4 rounded-2xl p-8 text-left transition-all ${
                purchaseType === 'rental'
                  ? 'border-blue-600 bg-blue-50'
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
              <div className="text-5xl font-bold text-blue-600 mb-4">
                £{pricing.amount}
                <span className="text-2xl text-gray-600">{pricing.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
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
                  ? 'border-gray-600 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-end mb-4">
                {purchaseType === 'purchase' && (
                  <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-2">Purchase Outright</h3>
              <div className="text-5xl font-bold text-gray-600 mb-4">
                £{pricing.amount}
                <span className="text-2xl text-gray-500">{pricing.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
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
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address Line 1 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={address.address_line_1}
                onChange={(e) => setAddress({ ...address, address_line_1: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Street address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                value={address.address_line_2}
                onChange={(e) => setAddress({ ...address, address_line_2: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={address.state_province}
                onChange={(e) => setAddress({ ...address, state_province: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Postal Code <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={address.postal_code}
                onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country <span className="text-red-600">*</span>
              </label>
              <select
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Terms and Checkout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Order</h2>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 mb-8 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                Terms and Conditions
              </a>
              {purchaseType === 'rental' && (
                <> and understand that:
                  <ul className="mt-2 ml-4 space-y-1 text-gray-600">
                    <li>• The 30-day free trial begins upon delivery</li>
                    <li>• Monthly payments of £{pricing.amount} begin after the trial period</li>
                    <li>• I am committing to a 24-month minimum term</li>
                    <li>• If I default on payment, the full tool price is due</li>
                    <li>• I will return the tool at my expense if I cancel after the minimum term</li>
                  </ul>
                </>
              )}
            </span>
          </label>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={!agreedToTerms || isProcessing}
            className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              'Processing...'
            ) : purchaseType === 'rental' ? (
              `Start 30-Day Free Trial`
            ) : (
              `Pay £${pricing.amount} Now`
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Secure payment powered by Stripe
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
