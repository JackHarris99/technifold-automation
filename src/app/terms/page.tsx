/**
 * Terms and Conditions Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Technifold',
  description: 'Terms and conditions for purchasing and renting equipment from Technifold',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: February 2025</p>

          {/* Purchase Terms */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Equipment Purchase</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Orders and Payment</h3>
            <p className="text-gray-700 mb-4">
              All orders are subject to acceptance by Technifold. Payment must be received in full before equipment
              is dispatched unless alternative credit terms have been agreed in writing. Prices are exclusive of VAT
              unless otherwise stated.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 Delivery</h3>
            <p className="text-gray-700 mb-4">
              Delivery timescales are estimates only and are not guaranteed. Technifold will make reasonable efforts
              to deliver equipment within the specified timeframe. Risk passes to the customer upon delivery.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3 Warranty</h3>
            <p className="text-gray-700 mb-4">
              All equipment sold comes with a manufacturer's warranty. Warranty periods vary by product. Full warranty
              details are available upon request. Warranty does not cover misuse, accidental damage, or normal wear and tear.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.4 Returns</h3>
            <p className="text-gray-700 mb-4">
              Equipment may be returned within 14 days of delivery if unused and in original packaging. Return shipping
              costs are the responsibility of the customer unless the item is faulty. A restocking fee may apply.
            </p>
          </section>

          {/* Rental Terms */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Equipment Rental</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Rental Agreement</h3>
            <p className="text-gray-700 mb-4">
              By agreeing to rent equipment, you enter into a binding rental agreement with Technifold. The rental
              period begins upon delivery of the equipment.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 30-Day Free Trial</h3>
            <p className="text-gray-700 mb-4">
              All equipment rentals include a 30-day free trial period. During this period, you may return the equipment
              at no cost. If you choose to keep the equipment beyond 30 days, the standard monthly rental payments will begin.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Minimum Term</h3>
            <p className="text-gray-700 mb-4">
              Unless otherwise specified in your quotation, equipment rentals have a minimum term of 24 months after the
              trial period ends. Early termination may incur fees as outlined in your rental agreement.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.4 Monthly Payments</h3>
            <p className="text-gray-700 mb-4">
              Monthly rental payments are due on the same day each month via direct debit or credit card on file.
              If payment fails, your account may be suspended and late fees may apply. Continued non-payment may result
              in equipment recovery.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.5 Equipment Care</h3>
            <p className="text-gray-700 mb-4">
              You are responsible for maintaining the equipment in good working condition throughout the rental period.
              Normal wear and tear is expected, but damage caused by misuse, negligence, or accidents may result in
              repair charges. You must notify Technifold immediately of any equipment malfunction.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.6 Return of Equipment</h3>
            <p className="text-gray-700 mb-4">
              Upon termination of the rental agreement, you must return the equipment within 7 days in good working
              condition. You are responsible for packaging and shipping costs when returning equipment. Equipment must
              be returned with all original accessories and documentation.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.7 Loss or Theft</h3>
            <p className="text-gray-700 mb-4">
              In the event of loss or theft of rented equipment, you must notify Technifold immediately. You may be
              liable for the full replacement value of the equipment. We recommend ensuring rented equipment is covered
              under your business insurance policy.
            </p>
          </section>

          {/* General Terms */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. General Terms</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Title and Ownership</h3>
            <p className="text-gray-700 mb-4">
              For purchased equipment, title passes to the customer upon receipt of full payment. For rented equipment,
              Technifold retains ownership at all times. Rented equipment may not be sold, transferred, or used as
              security for any loan.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 Limitation of Liability</h3>
            <p className="text-gray-700 mb-4">
              Technifold's liability is limited to the value of the equipment or services provided. We are not liable
              for indirect, consequential, or incidental damages including loss of profits, production downtime, or
              business interruption.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Data Protection</h3>
            <p className="text-gray-700 mb-4">
              We collect and process personal data in accordance with UK GDPR and our Privacy Policy. Your information
              will be used to fulfill your order, process payments, and provide customer support. We do not share your
              data with third parties except as necessary to deliver services.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.4 Governing Law</h3>
            <p className="text-gray-700 mb-4">
              These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive
              jurisdiction of the English courts.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.5 Amendments</h3>
            <p className="text-gray-700 mb-4">
              Technifold reserves the right to amend these terms at any time. Changes will be posted on this page with
              an updated date. Continued use of our services after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contact Information</h2>
            <p className="text-gray-700 mb-2">
              If you have any questions about these terms, please contact us:
            </p>
            <div className="text-gray-700 ml-4">
              <p>Technifold Limited</p>
              <p>Email: info@technifold.com</p>
              <p>Phone: +44 (0) 1707 393700</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Acceptance of Terms</h3>
            <p className="text-blue-800">
              By placing an order or entering into a rental agreement, you confirm that you have read, understood,
              and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms,
              please do not proceed with your order.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
