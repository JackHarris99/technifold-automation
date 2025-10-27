import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { ProductCategoriesMenu } from '@/components/marketing/ProductCategoriesMenu';
import { HeroSection } from '@/components/marketing/HeroSection';
import { ToolCategoryCards } from '@/components/marketing/ToolCategoryCards';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import MachineFinder from '@/components/marketing/MachineFinder';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <ProductCategoriesMenu />
      <main>
        <HeroSection />

        {/* Machine Finder Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Find fixes for your machine
              </h2>
              <p className="text-lg text-gray-600">
                Select your press to see production-proven solutions
              </p>
            </div>
            <MachineFinder />
          </div>
        </section>

        <Suspense fallback={<div className="py-24 text-center">Loading categories...</div>}>
          <ToolCategoryCards />
        </Suspense>
      </main>
      <MarketingFooter />
    </div>
  );
}

export const metadata = {
  title: 'Technifold - Professional Print Finishing Solutions',
  description: 'Leading manufacturer of Tri-Creaser and Spine-Creaser systems. Professional print finishing tools and consumables for the graphic arts industry.',
};
