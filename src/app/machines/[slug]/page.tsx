/**
 * Machine Detail Page
 * /machines/[slug] - Landing page showing solutions and problems for a specific machine
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import MachineOwnershipForm from '@/components/marketing/MachineOwnershipForm';
import SetupGuide from '@/components/marketing/SetupGuide';
import ReactMarkdown from 'react-markdown';
import MediaImage from '@/components/shared/MediaImage';

interface MachinePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MachinePage({ params }: MachinePageProps) {
  const { slug } = await params;
  const supabase = getSupabaseClient();

  // Fetch machine data from v_problem_solution_machine
  // Each row = ONE CARD = one (machine, problem/solution) combination
  const { data: problemCards, error } = await supabase
    .from('v_problem_solution_machine')
    .select('*')
    .eq('slug', slug)
    .order('machine_relevance_rank', { ascending: true })
    .order('global_relevance_rank', { ascending: true })
    .limit(500);

  if (error || !problemCards || problemCards.length === 0) {
    console.error('[machines/slug] Error or no data:', error);
    notFound();
  }

  // Extract machine info from first row
  const machineData = {
    machine_id: problemCards[0].machine_id,
    brand: problemCards[0].brand,
    model: problemCards[0].model,
    display_name: problemCards[0].display_name,
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
            Solutions for {machineData.display_name}
          </h1>
          <p className="text-xl text-blue-100">
            {machineData.brand} {machineData.model} • Production-proven retrofits
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Problem Cards - ONE CARD PER PROBLEM */}
        <div className="grid gap-6 mb-16">
          {problemCards.map((card: any) => {
            // Image URL is already resolved by the view (machine override → base)
            const imageUrl = card.resolved_image_url || '/placeholder-machine.jpg';

            return (
              <div key={card.problem_solution_id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all">
                {/* Image at top */}
                <div className="relative h-64 w-full bg-gray-100">
                  <MediaImage
                    src={imageUrl}
                    alt={`${card.solution_name} - ${card.resolved_title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Content below image */}
                <div className="p-8">
                  {/* Solution Badge */}
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {card.solution_name}
                  </div>

                  {/* Resolved Copy (Markdown) */}
                  <div className="prose prose-lg max-w-none mb-6">
                    <ReactMarkdown>{card.resolved_card_copy}</ReactMarkdown>
                  </div>

                  {/* CTA */}
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
                  >
                    {card.resolved_cta || `See how this works on your ${machineData.brand} ${machineData.model}`}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Setup Guide - Once per page */}
        {problemCards.length > 0 && (
          <div className="mb-16">
            <SetupGuide
              curatedSkus={problemCards[0]?.curated_skus}
              machineId={machineData.machine_id}
              problemSolutionId={problemCards[0]?.problem_solution_id}
              machineName={machineData.machine_display_name}
            />
          </div>
        )}

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
                Let us know and we'll send you tailored recommendations for your {machineData.display_name}
              </p>
            </div>

            <MachineOwnershipForm
              machineId={machineData.machine_id}
              machineSlug={slug}
              machineName={machineData.display_name}
            />
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
