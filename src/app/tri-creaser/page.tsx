import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import Link from 'next/link';

export default function TriCreaserPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">Tri-Creaser Systems</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                Revolutionary creasing technology that eliminates cracking and delivers perfect fold lines every time
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Get Quote
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Fast Fit Technology
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Our patented Fast Fit system allows for rapid changeovers and consistent 
                  performance across all paper types. No more downtime for adjustments.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Quick Setup</h3>
                      <p className="text-gray-600">Set up in seconds, not minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Universal Compatibility</h3>
                      <p className="text-gray-600">Works with MBO, Heidelberg, Stahl, and more</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Consistent Results</h3>
                      <p className="text-gray-600">Perfect creases on coated and uncoated papers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Placeholder for product image */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-12 text-center">
                <div className="w-32 h-32 bg-blue-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tri-Creaser System</h3>
                <p className="text-gray-600">Professional creasing solution</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Upgrade Your Creasing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Contact our technical team to discuss your requirements and get a custom quote
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Get Technical Consultation
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

export const metadata = {
  title: 'Tri-Creaser Systems - Professional Print Finishing | Technifold',
  description: 'Revolutionary Tri-Creaser technology eliminates cracking and provides superior print finishing. Fast Fit systems compatible with all major folder manufacturers.',
};