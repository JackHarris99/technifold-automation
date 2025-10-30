import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { ProductCategoriesMenu } from '@/components/marketing/ProductCategoriesMenu';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import MachineFinder from '@/components/marketing/MachineFinder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <ProductCategoriesMenu />
      <main>
        {/* Hero: Machine Finder */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 md:py-32">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Fix Your Print Finishing Problems
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-4">
                Tell us which machine you're running
              </p>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                Get instant access to production-proven solutions for your specific press
              </p>
            </div>
            <MachineFinder />
          </div>
        </section>

        {/* Pain Stories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Real Problems. Proven Solutions.
              </h2>
              <p className="text-xl text-gray-600">
                See how we help printers like you run faster, cleaner, and more profitable
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Pain Story 1 */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Cracking on folded stock?
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Heavy stocks crack when folded because you're breaking the paper instead of compressing it.
                  Our Tri-Creaser creates a proper channel that lets the fold happen cleanly.
                </p>
                <div className="text-sm font-semibold text-red-700">
                  → Eliminates cracking on 300gsm+
                </div>
              </div>

              {/* Pain Story 2 */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Slowing down for tool changes?
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Traditional fixed creasing tools mean stopping the press for every job change.
                  Our Fast-Fit system lets you swap tools in under 60 seconds—no press stop needed.
                </p>
                <div className="text-sm font-semibold text-yellow-700">
                  → 90% faster changeovers
                </div>
              </div>

              {/* Pain Story 3 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Inconsistent fold quality?
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Stock thickness varies, operators change, conditions shift.
                  Our precision-machined tools deliver the same perfect crease every time, automatically.
                </p>
                <div className="text-sm font-semibold text-blue-700">
                  → Zero operator adjustment needed
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  );
}

export const metadata = {
  title: 'Technifold - Professional Print Finishing Solutions',
  description: 'Leading manufacturer of Tri-Creaser and Spine-Creaser systems. Professional print finishing tools and consumables for the graphic arts industry.',
};
