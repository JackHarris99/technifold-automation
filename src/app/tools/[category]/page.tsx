// import { notFound } from 'next/navigation'; // Currently unused
import { getToolsByCategory, getProductCategories, encodeProductCodeForUrl } from '@/lib/supabase';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import Link from 'next/link';

// Force dynamic rendering - requires database access
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  
  // Convert URL slug back to category name - try exact match first
  const categoryName = decodeURIComponent(category).replace(/-/g, ' ');
  
  // Get all categories to find exact match
  const allCategories = await getProductCategories();
  const exactMatch = allCategories.find(cat => 
    cat.toLowerCase().replace(/\s+/g, '-') === category
  );
  
  const searchCategory = exactMatch || categoryName;
  const displayName = exactMatch || categoryName;
  const tools = await getToolsByCategory(searchCategory);

  // For now, show the page even if no tools found (since we know categories exist)
  // if (tools.length === 0) {
  //   notFound();
  // }

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <nav className="mb-4">
                <Link href="/products" className="text-blue-100 hover:text-white">
                  Products
                </Link>
                <span className="mx-2 text-blue-200">/</span>
                <span className="text-white">{displayName}</span>
              </nav>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                {displayName} Systems
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                Professional {displayName.toLowerCase()} tools and solutions for the graphic arts industry
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

        {/* Tools Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Available {displayName} Tools
              </h2>
              <p className="text-xl text-gray-800">
                {tools.length} professional tools in this category
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool, index) => (
                <div key={tool.product_code || tool.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      index % 3 === 0 ? 'bg-blue-100' : index % 3 === 1 ? 'bg-indigo-100' : 'bg-purple-100'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        index % 3 === 0 ? 'text-blue-600' : index % 3 === 1 ? 'text-indigo-600' : 'text-purple-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {tool.product_name || tool.name || tool.description || `${displayName} Tool`}
                    </h3>
                    
                    {tool.product_code && (
                      <p className="text-sm text-gray-700 font-mono mb-3">
                        Code: {tool.product_code}
                      </p>
                    )}
                  </div>

                  {tool.description && (
                    <p className="text-gray-800 mb-4">
                      {tool.description}
                    </p>
                  )}

                  {tool.specifications && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Specifications</h4>
                      <p className="text-sm text-gray-800">{tool.specifications}</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      {tool.price && (
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            £{tool.price}
                          </span>
                          <span className="text-gray-700 text-sm ml-1">ex VAT</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {tool.product_code && (
                          <Link
                            href={`/datasheet/${encodeProductCodeForUrl(tool.product_code)}`}
                            className="inline-flex items-center px-3 py-2 rounded-lg font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Specs
                          </Link>
                        )}
                        
                        <Link
                          href="/contact"
                          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                            index % 3 === 0 ? 'bg-blue-600 hover:bg-blue-700' : 
                            index % 3 === 1 ? 'bg-indigo-600 hover:bg-indigo-700' : 
                            'bg-purple-600 hover:bg-purple-700'
                          } text-white`}
                        >
                          Enquire
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Help Choosing the Right {displayName}?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our technical specialists can help you select the perfect {displayName.toLowerCase()} solution for your specific requirements
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
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

// generateStaticParams removed - using dynamic rendering instead

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category).replace(/-/g, ' ');
  const properCaseName = categoryName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return {
    title: `${properCaseName} Systems - Professional Print Finishing | Technifold`,
    description: `Professional ${properCaseName.toLowerCase()} tools and solutions for the graphic arts industry. View specifications and get expert consultation.`,
  };
}