import Link from 'next/link';
import { getProductCategories } from '@/lib/supabase';

export async function ProductCategoriesMenu() {
  const categories = await getProductCategories();
  
  // Filter out empty categories and create URL-friendly slugs
  const validCategories = categories
    .filter(category => category && category.trim().length > 0)
    .map(category => ({
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, '-')
    }));

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <h2 className="text-sm font-medium text-gray-600 mb-3">Browse All Product Categories</h2>
          
          {/* Horizontal scrolling container */}
          <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-2">
            {validCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/tools/${encodeURIComponent(category.slug)}`}
                className="flex-shrink-0 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm whitespace-nowrap group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      View Tools
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Scroll hint for mobile */}
          <div className="flex justify-center mt-2">
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Scroll to see all categories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}