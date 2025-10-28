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
  // Each row = ONE CARD = one (machine, solution, problem) combination
  const { data: problemCards, error } = await supabase
    .from('v_machine_solution_problem_full')
    .select('*')
    .eq('machine_slug', slug)
    .order('machine_solution_rank', { ascending: true })
    .order('global_solution_problem_rank', { ascending: true });

  if (error || !problemCards || problemCards.length === 0) {
    console.error('[machines/slug] Error or no data:', error);
    notFound();
  }

  // Extract machine info from first row
  const machineData = {
    machine_id: problemCards[0].machine_id,
    machine_brand: problemCards[0].machine_brand,
    machine_model: problemCards[0].machine_model,
    machine_display_name: problemCards[0].machine_display_name,
  };

  // Each row is already a card - no grouping needed!

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
        {/* Problem Cards - ONE CARD PER PROBLEM */}
        <div className="grid gap-6 mb-16">
          {problemCards.map((card: any) => (
            <div key={`${card.solution_id}-${card.problem_id}`} className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-xl transition-all">
              {/* Problem Headline */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {card.pitch_headline}
              </h2>

              {/* Problem Detail */}
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {card.pitch_detail}
              </p>

              {/* Solution Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {card.solution_name}
                    </h3>
                    <p className="text-blue-700 font-semibold">
                      {card.solution_core_benefit}
                    </p>
                  </div>
                </div>
                {card.solution_long_description && (
                  <p className="text-gray-700 text-sm ml-9">
                    {card.solution_long_description}
                  </p>
                )}
              </div>

              {/* CTA */}
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                {card.action_cta || 'Get help with this'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
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
