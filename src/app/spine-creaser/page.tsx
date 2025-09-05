import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import Link from 'next/link';

export default function SpineCreaserPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">Spine-Creaser Systems</h1>
              <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
                Specialized spine conditioning technology for perfect book binding and professional booklet production
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Request Demo
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
              {/* Placeholder for product image */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-12 text-center">
                <div className="w-32 h-32 bg-indigo-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Spine-Creaser System</h3>
                <p className="text-gray-600">Professional spine conditioning</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Precision Spine Conditioning
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Essential for high-quality booklet production and perfect binding applications. 
                  Our Spine-Creaser systems ensure consistent spine preparation.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-600 mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Perfect Binding Prep</h3>
                      <p className="text-gray-600">Optimal spine conditioning for all binding types</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-600 mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Wide Compatibility</h3>
                      <p className="text-gray-600">Fits Heidelberg, KBA, Komori, and other major presses</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-600 mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Durable Construction</h3>
                      <p className="text-gray-600">Built for high-volume production environments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Improve Your Binding Quality Today
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Contact our binding specialists to find the right Spine-Creaser solution for your operation
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors"
            >
              Contact Specialists
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

export const metadata = {
  title: 'Spine-Creaser Systems - Professional Binding Solutions | Technifold',
  description: 'Specialized spine conditioning technology for perfect book binding. Compatible with major press manufacturers for professional booklet production.',
};