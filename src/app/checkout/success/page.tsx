/**
 * Checkout Success Page
 * Shows order confirmation after successful Stripe payment
 */

import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-800 mb-6">
          Thank you for your order. We've received your payment and will begin processing your order shortly.
        </p>

        {/* Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>What happens next?</strong>
          </p>
          <ul className="text-sm text-gray-800 text-left space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You'll receive an email confirmation within minutes</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Your order will be dispatched within 1-2 business days</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Tracking information will be sent when your order ships</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Return to Home
        </Link>

        {/* Footer Note */}
        <p className="text-xs text-gray-700 mt-6">
          Need help? <a href="/contact" className="text-blue-600 hover:text-blue-700">Contact us</a>
        </p>
      </div>
    </div>
  );
}
