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
import MachinePageClient from '@/components/marketing/MachinePageClient';

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
    .eq('machine_slug', slug)
    .order('machine_relevance_rank', { ascending: true })
    .order('generic_relevance_rank', { ascending: true })
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

  // Fetch brand media (logo + hero image) for the brand
  const brandSlug = machineData.brand?.toLowerCase().replace(/\s+/g, '-');
  const { data: brandMedia } = await supabase
    .from('brand_media')
    .select('logo_url, hero_url')
    .eq('brand_slug', brandSlug)
    .single();

  // Collect all unique product codes from curated_skus across all cards
  const allProductCodes = new Set<string>();
  problemCards.forEach(card => {
    if (card.curated_skus && Array.isArray(card.curated_skus)) {
      card.curated_skus.forEach((sku: string) => allProductCodes.add(sku));
    }
  });

  // Fetch product data for all curated SKUs
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, image_url, category')
    .in('product_code', Array.from(allProductCodes))
    .eq('active', true);

  // Convert to plain object for serialization (can't pass Map to Client Component)
  const productData = products || [];

  // Each row is already a card - no grouping needed!

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section with Brand Logo and Background */}
      <div
        className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20"
        style={brandMedia?.hero_url ? {
          backgroundImage: `linear-gradient(to bottom right, rgba(37, 99, 235, 0.9), rgba(79, 70, 229, 0.9)), url(${brandMedia.hero_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <a href="/" className="text-blue-200 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <span className="text-blue-200 text-sm">Back to machine finder</span>
          </div>

          <div className="flex items-center gap-8 mb-6">
            {brandMedia?.logo_url && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <img
                  src={brandMedia.logo_url}
                  alt={machineData.brand}
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {machineData.display_name}
              </h1>
              <p className="text-xl text-blue-100">
                Production-proven solutions for your press
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Problem Cards with 2-Column Layout */}
        <MachinePageClient
          machineData={machineData}
          problemCards={problemCards}
          products={productData}
        />

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
