/**
 * Checkout Cancel Page
 * Shows when user cancels Stripe checkout
 */

import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Checkout Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your checkout was cancelled. No charges were made to your account.
        </p>

        {/* Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            Your cart items are still saved. You can return to complete your order anytime.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Return to Home
          </Link>
          <Link
            href="/contact"
            className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Contact Support
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-700 mt-6">
          Changed your mind? We're here to help with any questions.
        </p>
      </div>
    </div>
  );
}
