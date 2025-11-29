import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import SolutionFinder from '@/components/solutions/SolutionFinder';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <MarketingHeader />

      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Technifold Solution
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Select your machine brand and shaft size to see every compatible Technifold product
            that will transform your finishing capability.
          </p>
        </div>

        <SolutionFinder />
      </main>

      <MarketingFooter />
    </div>
  );
}
