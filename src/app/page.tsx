import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import SolutionFinder from '@/components/solutions/SolutionFinder';
import { getSupabaseClient } from '@/lib/supabase';
import MediaImage from '@/components/shared/MediaImage';

export default async function HomePage() {
  // Fetch one card per solution (using the highest ranked problem for each solution)
  const supabase = getSupabaseClient();

  // Get distinct solutions with their best-ranked problem
  const { data: allProblems } = await supabase
    .from('problem_solution')
    .select('solution_name, card_preview_copy, image_url')
    .eq('active', true)
    .order('solution_name')
    .order('relevance_rank', { ascending: true });

  // Get unique solutions (one card per solution, using first/best ranked)
  const solutionMap = new Map();
  allProblems?.forEach(problem => {
    if (!solutionMap.has(problem.solution_name)) {
      solutionMap.set(problem.solution_name, problem);
    }
  });
  const solutions = Array.from(solutionMap.values());

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
            <SolutionFinder />
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
                <div key={solution.solution_name} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all">
                  {/* Solution Image */}
                  <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                    {solution.image_url ? (
                      <MediaImage
                        src={solution.image_url}
                        alt={solution.solution_name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Solution Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {solution.solution_name}
                    </h3>
                    {solution.card_preview_copy && (
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                        {solution.card_preview_copy.replace(/[#*_`]/g, '').substring(0, 200)}...
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
