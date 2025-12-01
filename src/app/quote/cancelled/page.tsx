/**
 * Quote Cancelled Page
 * Shown when user cancels Stripe checkout
 */

'use client';

import Link from 'next/link';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function QuoteCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          {/* Info Icon */}
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Checkout Cancelled
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            No payment was processed. Your quote is still available if you'd like to complete your order.
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <p className="text-blue-900 text-left">
              <strong>Have questions?</strong> We're here to help! Our team can answer any questions about our products, pricing, or shipping.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Quote
            </button>
            <Link
              href="/contact"
              className="inline-block border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Email: support@technifold.com | Phone: +44 1234 567890
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
