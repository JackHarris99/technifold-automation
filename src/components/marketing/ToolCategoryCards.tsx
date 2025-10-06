import Link from 'next/link';
import { getToolCategories } from '@/lib/supabase';
import { CategoryCard } from './CategoryCard';

// Define category-specific colors and icons
const categoryStyles: Record<string, { gradient: string; iconBg: string; accentColor: string }> = {
  'Folding': {
    gradient: 'from-blue-50 to-blue-100',
    iconBg: 'bg-blue-600',
    accentColor: 'text-blue-600'
  },
  'Creasing': {
    gradient: 'from-indigo-50 to-purple-100',
    iconBg: 'bg-indigo-600',
    accentColor: 'text-indigo-600'
  },
  'Perforating': {
    gradient: 'from-green-50 to-emerald-100',
    iconBg: 'bg-green-600',
    accentColor: 'text-green-600'
  },
  'Cutting': {
    gradient: 'from-red-50 to-pink-100',
    iconBg: 'bg-red-600',
    accentColor: 'text-red-600'
  },
  'Scoring': {
    gradient: 'from-amber-50 to-orange-100',
    iconBg: 'bg-amber-600',
    accentColor: 'text-amber-600'
  },
  'Binding': {
    gradient: 'from-purple-50 to-pink-100',
    iconBg: 'bg-purple-600',
    accentColor: 'text-purple-600'
  },
  'Matrix': {
    gradient: 'from-teal-50 to-cyan-100',
    iconBg: 'bg-teal-600',
    accentColor: 'text-teal-600'
  },
  'default': {
    gradient: 'from-gray-50 to-gray-100',
    iconBg: 'bg-gray-600',
    accentColor: 'text-gray-600'
  }
};

export async function ToolCategoryCards() {
  const categories = await getToolCategories();

  if (!categories || categories.length === 0) {
    return null;
  }

  // Get style for category or use default
  const getStyle = (categoryName: string) => {
    return categoryStyles[categoryName] || categoryStyles['default'];
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Print Finishing Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Industry-leading tools and consumables for every finishing application.
            Trusted by print professionals worldwide.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              style={getStyle(category.name)}
            />
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-12 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Our team of experts is here to help you find the perfect solution for your print finishing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Contact Our Experts
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center bg-gray-200 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-300 transition-colors"
            >
              Browse Full Catalog
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}