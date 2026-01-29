export default function QuoteSubmittedApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">📋</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Quote Submitted for Approval
        </h1>

        <p className="text-gray-700 mb-6 leading-relaxed">
          Thank you for your interest in our TechniCrease system. Your quote has been submitted
          and is now being reviewed by our sales team.
        </p>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-800 font-semibold mb-2">What happens next?</p>
          <ul className="text-sm text-gray-700 text-left space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">1.</span>
              <span>Our team will review your configuration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">2.</span>
              <span>We'll contact you within 1-2 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">3.</span>
              <span>Once approved, you'll receive your invoice</span>
            </li>
          </ul>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          If you have any questions, please don't hesitate to contact us.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Return to Homepage
          </a>

          <a
            href="/contact"
            className="inline-block bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
