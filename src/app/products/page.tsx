import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { getProductCategories } from '@/lib/supabase';
import Link from 'next/link';

export default async function ProductsPage() {
  const categories = await getProductCategories();
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      
      <main>
        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Professional Print Finishing Solutions
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover our complete range of precision-engineered creasing systems and consumables
            </p>
          </div>
        </section>

        {/* Dynamic Product Categories */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading product categories...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <div key={category} className="group">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 group-hover:border-blue-300 group-hover:shadow-xl transition-all">
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                          index % 3 === 0 ? 'bg-blue-600' : index % 3 === 1 ? 'bg-indigo-600' : 'bg-purple-600'
                        }`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                          <p className="text-gray-600 text-sm">Professional tools</p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-6">
                        Explore our complete range of {category.toLowerCase()} systems and related consumables.
                      </p>

                      <Link
                        href={`/tools/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                        className={`inline-flex items-center text-white px-6 py-3 rounded-lg font-semibold transition-colors ${
                          index % 3 === 0 ? 'bg-blue-600 hover:bg-blue-700' : 
                          index % 3 === 1 ? 'bg-indigo-600 hover:bg-indigo-700' : 
                          'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        Explore {category}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Consumables Section */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Consumables & Parts</h2>
                <p className="text-xl text-gray-600">
                  High-quality replacement parts and consumables for optimal performance
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Creasing Matrices</h3>
                  <p className="text-gray-600 text-sm">Premium matrices for consistent, professional results</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Gripper Bands</h3>
                  <p className="text-gray-600 text-sm">Durable bands for reliable paper handling</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Replacement Parts</h3>
                  <p className="text-gray-600 text-sm">Complete range of service parts and accessories</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-20 bg-gray-900 rounded-2xl p-12 text-center text-white">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Need Help Choosing the Right Solution?
              </h3>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Our technical experts are here to help you find the perfect finishing solution 
                for your specific requirements and equipment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Contact Technical Sales
                </Link>
                <Link
                  href="/tri-creaser"
                  className="border-2 border-gray-600 text-white px-8 py-4 rounded-lg font-semibold hover:border-gray-500 hover:bg-gray-800 transition-colors"
                >
                  View Tri-Creaser Details
                </Link>
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
  title: 'Products - Technifold Print Finishing Solutions',
  description: 'Complete range of Tri-Creaser and Spine-Creaser systems, consumables, and replacement parts for professional print finishing.',
};