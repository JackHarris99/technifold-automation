import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import SolutionFinder from '@/components/solutions/SolutionFinder';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero - Catalog Style */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-3">Solutions Finder</h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Find every compatible Technifold product for your machine. Select your brand and shaft size to see complete compatibility information.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <SolutionFinder />

        {/* Info Section */}
        <div className="mt-10 bg-gray-50 border-2 border-gray-300 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <div className="bg-orange-500 text-white w-8 h-8 flex items-center justify-center font-bold mb-2">1</div>
              <p><strong>Select Your Brand</strong><br />Choose your folder, stitcher, or press manufacturer from the list.</p>
            </div>
            <div>
              <div className="bg-orange-500 text-white w-8 h-8 flex items-center justify-center font-bold mb-2">2</div>
              <p><strong>Choose Shaft Size</strong><br />Select the shaft diameter configuration for your specific model.</p>
            </div>
            <div>
              <div className="bg-orange-500 text-white w-8 h-8 flex items-center justify-center font-bold mb-2">3</div>
              <p><strong>View Solutions</strong><br />See all compatible Technifold products with technical specifications.</p>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
