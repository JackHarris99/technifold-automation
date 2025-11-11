/**
 * Quote Success Page
 * Shown after successful Stripe checkout
 */

import Link from 'next/link';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function QuoteSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Thank you for your order. We've received your payment and will begin processing your order shortly.
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-blue-900 mb-3">What happens next?</h2>
            <ul className="space-y-3 text-blue-900">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span><strong>Confirmation email</strong> sent to your inbox with order details</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span><strong>Preparation</strong> - Your order will be prepared for shipment</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span><strong>Shipping</strong> - Tracking information will be emailed within 2-3 business days</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span><strong>Delivery</strong> - Your solution will arrive ready to transform your production</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Need help? Email us at support@technifold.com
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

export const metadata = {
  title: 'Order Confirmed - Technifold',
  description: 'Your order has been successfully placed',
};
