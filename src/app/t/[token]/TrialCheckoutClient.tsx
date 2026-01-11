'use client';

import { useState } from 'react';

interface TrialCheckoutClientProps {
  token: string;
  machineName: string;
  machineSlug: string;
  offerPrice: number;
  companyName: string;
  contactName: string;
  email: string;
}

export default function TrialCheckoutClient({
  token,
  machineName,
  machineSlug,
  offerPrice,
  companyName,
  contactName,
  email,
}: TrialCheckoutClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartTrial() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-trial-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_slug: machineSlug,
          offer_price: offerPrice,
          company_name: companyName,
          contact_name: contactName,
          email: email,
          token: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show full error details for debugging
        const errorMsg = data.details
          ? `${data.error}: ${data.details} (${data.code || 'no code'})`
          : data.error || 'Failed to create checkout';
        throw new Error(errorMsg);
      }

      // Redirect to Stripe checkout
      window.location.href = data.checkout_url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Free Trial is Ready!
          </h1>
          <p className="text-xl text-gray-600">
            30 days free for {machineName}
          </p>
        </div>

        {/* Trial Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Trial Details</h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Equipment</span>
              <span className="font-semibold text-gray-900">{machineName}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Trial Period</span>
              <span className="font-semibold text-green-600">30 Days FREE</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">After Trial</span>
              <span className="font-semibold text-gray-900">£{offerPrice}/month</span>
            </div>
            {companyName && (
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Company</span>
                <span className="font-semibold text-gray-900">{companyName}</span>
              </div>
            )}
          </div>

          {/* What's Included */}
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">What's Included:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Full finishing capability for your machine</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Consumables included during trial</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Free shipping both ways</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Cancel anytime - no obligation</span>
              </li>
            </ul>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-amber-800">
                  <strong>Card required but NOT charged today.</strong> Your first payment of £{offerPrice} will be taken after 30 days. Cancel anytime before then at no cost.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Start My Free Trial →'
            )}
          </button>

          <p className="text-center text-sm text-gray-700 mt-4">
            You'll be redirected to our secure payment page
          </p>
        </div>

        {/* Trust Signals */}
        <div className="text-center text-gray-700 text-sm">
          <p className="mb-2">Secure checkout powered by Stripe</p>
          <p>Questions? Call +44 (0)1455 55 44 91</p>
        </div>
      </div>
    </div>
  );
}
