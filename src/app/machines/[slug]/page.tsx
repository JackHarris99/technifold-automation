/**
 * Machine Detail Page
 * /machines/[slug] - Landing page showing solutions and problems for a specific machine
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import MachineOwnershipForm from '@/components/marketing/MachineOwnershipForm';

interface MachinePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MachinePage({ params }: MachinePageProps) {
  const { slug } = await params;
  const supabase = getSupabaseClient();

  // Fetch machine data from v_machine_solution_problem_full
  const { data, error } = await supabase
    .from('v_machine_solution_problem_full')
    .select('*')
    .eq('machine_slug', slug)
    .order('machine_solution_rank', { ascending: true })
    .order('machine_solution_problem_rank', { ascending: true });

  if (error || !data || data.length === 0) {
    console.error('[machines/slug] Error or no data:', error);
    notFound();
  }

  // Group data by solution
  const machineData = {
    machine_id: data[0].machine_id,
    machine_brand: data[0].machine_brand,
    machine_model: data[0].machine_model,
    machine_display_name: data[0].machine_display_name,
    solutions: [] as any[]
  };

  const solutionsMap = new Map();

  data.forEach((row) => {
    if (!solutionsMap.has(row.solution_id)) {
      solutionsMap.set(row.solution_id, {
        solution_id: row.solution_id,
        solution_name: row.solution_name,
        solution_core_benefit: row.solution_core_benefit,
        solution_long_description: row.solution_long_description,
        solution_media_urls: row.solution_media_urls || [],
        problems: []
      });
    }

    const solution = solutionsMap.get(row.solution_id);
    solution.problems.push({
      problem_id: row.problem_id,
      problem_title: row.problem_title,
      problem_description: row.problem_description,
      pitch_headline: row.pitch_headline,
      pitch_detail: row.pitch_detail,
      action_cta: row.action_cta
    });
  });

  machineData.solutions = Array.from(solutionsMap.values());

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <a href="/" className="text-blue-200 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <span className="text-blue-200 text-sm">Back to machine finder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Solutions for {machineData.machine_display_name}
          </h1>
          <p className="text-xl text-blue-100">
            {machineData.machine_brand} {machineData.machine_model} • Production-proven retrofits
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Problems & Solutions */}
        <div className="space-y-12 mb-16">
          {machineData.solutions.map((solution) => (
            <div key={solution.solution_id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-colors">
              {/* Solution Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{solution.solution_name}</h2>
                <p className="text-xl text-blue-700 font-semibold mb-4">{solution.solution_core_benefit}</p>
                {solution.solution_long_description && (
                  <p className="text-gray-700 leading-relaxed">{solution.solution_long_description}</p>
                )}
              </div>

              {/* Problems this fixes */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Problems this solves:
                </h3>

                <div className="space-y-6">
                  {solution.problems.map((problem: any) => (
                    <div key={problem.problem_id} className="border-l-4 border-blue-600 pl-6 py-4 hover:bg-blue-50 transition-colors rounded-r-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {problem.pitch_headline}
                      </h4>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {problem.pitch_detail}
                      </p>
                      <a
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        {problem.action_cta || 'Get help with this'}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Machine Ownership Capture */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Do you run this machine?
              </h2>
              <p className="text-lg text-gray-700">
                Let us know and we'll send you tailored recommendations for your {machineData.machine_display_name}
              </p>
            </div>

            <MachineOwnershipForm
              machineId={machineData.machine_id}
              machineSlug={slug}
              machineName={machineData.machine_display_name}
            />
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
