import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import MachineFinder from '@/components/marketing/MachineFinder';
import { getSupabaseClient } from '@/lib/supabase';
import MediaImage from '@/components/shared/MediaImage';

export default async function HomePage() {
  // Fetch all solutions for solution cards
  const supabase = getSupabaseClient();
  const { data: solutions } = await supabase
    .from('solutions')
    .select('solution_id, name, core_benefit, long_description, default_image_url')
    .eq('active', true)
    .order('name');

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        {/* Hero: Machine Finder - 30% shorter */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-14 md:py-22">
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

        {/* Solution Cards */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Solutions
              </h2>
              <p className="text-xl text-gray-600">
                Professional print finishing systems for every challenge
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {(solutions || []).map((solution) => (
                <div key={solution.solution_id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all">
                  {/* Solution Image */}
                  <div className="relative h-48 w-full bg-gray-100">
                    <MediaImage
                      src={solution.default_image_url}
                      alt={solution.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Solution Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {solution.name}
                    </h3>
                    {solution.core_benefit && (
                      <p className="text-blue-600 font-semibold mb-4">
                        {solution.core_benefit}
                      </p>
                    )}
                    {solution.long_description && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {solution.long_description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
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
