/**
 * Marketing Page Route
 * /m/[token] - Full personalized solution content with placeholder replacement
 * Shows full_solution_copy for selected problem/solutions
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { replacePlaceholders } from '@/lib/textUtils';
import SmartCopyRenderer from '@/components/marketing/SmartCopyRenderer';
import MediaImage from '@/components/shared/MediaImage';

interface MarketingPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function MarketingPage({ params }: MarketingPageProps) {
  const { token } = await params;

  // 1. Verify HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-8">
            This link is no longer valid. Please contact us for assistance.
          </p>
          <a href="/contact" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  const { company_id, contact_id } = payload;
  const supabase = getSupabaseClient();

  // 2. Get company details
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('company_id', company_id)
    .single();

  if (!company) {
    notFound();
  }

  // 3. Get company's machine (highest confidence)
  const { data: companyMachines } = await supabase
    .from('company_machine')
    .select(`
      machine_id,
      machines:machine_id (
        brand,
        model,
        display_name
      )
    `)
    .eq('company_id', company_id)
    .order('verified', { ascending: false })
    .limit(1);

  const machine = companyMachines?.[0]?.machines as any;
  const machineId = companyMachines?.[0]?.machine_id;

  // 4. Get company's interested problem_solution_ids
  const { data: interests } = await supabase
    .from('company_interests')
    .select('problem_solution_id')
    .eq('company_id', company_id)
    .eq('status', 'interested');

  const interestedProblemSolutionIds = (interests || []).map(i => i.problem_solution_id);

  // 5. Get machine-specific problem/solution data with curated_skus
  let solutionCards: any[] = [];
  if (interestedProblemSolutionIds.length > 0 && machineId) {
    const { data: cards } = await supabase
      .from('v_problem_solution_machine')
      .select('*')
      .eq('machine_id', machineId)
      .in('problem_solution_id', interestedProblemSolutionIds);

    solutionCards = cards || [];
  }

  // 6. Fetch brand media (logo + hero) if machine exists
  let brandMedia = null;
  if (machine?.brand) {
    const brandSlug = machine.brand.toLowerCase().replace(/\s+/g, '-');
    const { data } = await supabase
      .from('brand_media')
      .select('logo_url, hero_url')
      .eq('brand_slug', brandSlug)
      .single();
    brandMedia = data;
  }

  // 7. Collect all unique product codes from curated_skus
  const allProductCodes = new Set<string>();
  solutionCards.forEach(card => {
    if (card.curated_skus && Array.isArray(card.curated_skus)) {
      card.curated_skus.forEach((sku: string) => allProductCodes.add(sku));
    }
  });

  // 8. Fetch product data for all curated SKUs
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, image_url, category')
    .in('product_code', Array.from(allProductCodes))
    .eq('active', true);

  const productData = products || [];

  // Create product map for quick lookups
  const productMap = new Map(
    productData.map(p => [p.product_code, p])
  );

  // 9. Track marketing page view
  if (contact_id) {
    const { error: trackingError } = await supabase
      .from('contact_interactions')
      .insert({
        contact_id,
        company_id,
        interaction_type: 'marketing_page_view',
        url: `/m/${token}`,
        metadata: {
          solution_count: solutionCards.length,
          has_machine: !!machine
        }
      });

    if (trackingError) {
      console.error('[Marketing] Tracking failed:', trackingError);
    }
  }

  // 10. Render full marketing content
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Hero Section with Brand Media */}
      <div
        className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 md:py-24"
        style={brandMedia?.hero_url ? {
          backgroundImage: `linear-gradient(to bottom right, rgba(37, 99, 235, 0.95), rgba(29, 78, 216, 0.95)), url(${brandMedia.hero_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          {brandMedia?.logo_url && (
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
              <img
                src={brandMedia.logo_url}
                alt={machine?.brand || 'Brand'}
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Solutions for {company.company_name}
          </h1>
          {machine && (
            <p className="text-xl md:text-2xl text-blue-100">
              Personalized for your {machine.brand} {machine.model}
            </p>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Solution Cards - Grouped by solution_name */}
        <div className="space-y-12">
          {(() => {
            // Group solution cards by solution_name
            const solutionGroups = solutionCards.reduce((acc: Record<string, any[]>, card: any) => {
              const key = card.solution_name;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(card);
              return acc;
            }, {});

            return Object.entries(solutionGroups).map(([solutionName, cards]) => {
              // Use the primary problem's data, or the first one
              const primaryCard = cards.find((c: any) => c.is_primary_pitch) || cards[0];
              const imageUrl = primaryCard.resolved_image_url || '/placeholder-machine.jpg';

              // Merge curated products from all problems in this solution
              const allSkus = new Set<string>();
              cards.forEach((card: any) => {
                (card.curated_skus || []).forEach(sku => allSkus.add(sku));
              });
              const curatedProducts = Array.from(allSkus)
                .map((sku: string) => productMap.get(sku))
                .filter((p: any): p is any => p !== undefined);

              return (
                <article key={solutionName} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {/* Single Column Vertical Flow */}
                  <div className="max-w-4xl mx-auto p-8 lg:p-12">
                    {/* Solution Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-8">
                      {solutionName}
                    </div>

                    {/* Problems this solution solves */}
                    {cards.length > 1 && (
                      <div className="mb-8 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
                        <h4 className="font-bold text-green-900 mb-3">
                          Solves {cards.length} Problems:
                        </h4>
                        <ul className="space-y-2">
                          {cards.map((card: any) => (
                            <li key={card.problem_solution_id} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-green-900">{card.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hero/Main Image (if available) */}
                    {imageUrl && imageUrl !== '/placeholder-machine.jpg' && (
                      <div className="w-full bg-gray-100 rounded-xl overflow-hidden mb-8 p-4">
                        <MediaImage
                          src={imageUrl}
                          alt={`${solutionName} solution`}
                          width={1200}
                          height={800}
                          sizes="(max-width: 1024px) 100vw, 896px"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    )}

                    {/* Marketing Copy - ALL problems shown in styled boxes */}
                    <div className="space-y-8">
                      {cards.map((card: any, index: number) => {
                        const cardCopy = replacePlaceholders(
                          card.resolved_full_copy || card.resolved_card_copy || '',
                          machine,
                          company.company_name
                        );

                        return (
                          <div
                            key={card.problem_solution_id}
                            className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border-2 border-gray-200 shadow-sm"
                          >
                            {cards.length > 1 && (
                              <div className="flex items-center gap-3 mb-6">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                                  {index + 1}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{card.title}</h2>
                              </div>
                            )}
                            <SmartCopyRenderer
                              content={cardCopy}
                              problemTitle={card.title}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Before/After Comparison - Side by Side */}
                    {(primaryCard.resolved_before_image_url || primaryCard.resolved_after_image_url) && (
                      <div className="mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">See The Difference</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          {primaryCard.resolved_before_image_url && (
                            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                              <div className="bg-red-50 px-4 py-3 border-b-2 border-red-200">
                                <h4 className="font-bold text-red-800">Before</h4>
                              </div>
                              <div className="w-full bg-gray-50 p-4">
                                <MediaImage
                                  src={primaryCard.resolved_before_image_url}
                                  alt="Before using solution"
                                  width={800}
                                  height={600}
                                  sizes="(max-width: 768px) 100vw, 448px"
                                  className="w-full h-auto object-contain"
                                />
                              </div>
                            </div>
                          )}

                          {primaryCard.resolved_after_image_url && (
                            <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
                              <div className="bg-green-50 px-4 py-3 border-b-2 border-green-200">
                                <h4 className="font-bold text-green-800">After</h4>
                              </div>
                              <div className="w-full bg-gray-50 p-4">
                                <MediaImage
                                  src={primaryCard.resolved_after_image_url}
                                  alt="After using solution"
                                  width={800}
                                  height={600}
                                  sizes="(max-width: 768px) 100vw, 448px"
                                  className="w-full h-auto object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Product Showcase */}
                    {primaryCard.resolved_product_image_url && (
                      <div className="mb-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Solution</h3>
                        <div className="w-full bg-white rounded-lg p-8">
                          <MediaImage
                            src={primaryCard.resolved_product_image_url}
                            alt={`${solutionName} product`}
                            width={1000}
                            height={1000}
                            sizes="(max-width: 1024px) 100vw, 832px"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                {/* Curated Products Section */}
                {curatedProducts.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Recommended Consumables
                      </h3>
                      <p className="text-gray-600 mb-8">
                        {machine ? `Precision-engineered for your ${machine.brand} ${machine.model}` : 'Professional solutions for your equipment'}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {curatedProducts.map((product: any) => (
                          <div key={product.product_code} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                            {/* Product Image */}
                            <div className="w-full bg-gray-50 rounded-lg overflow-hidden mb-3 p-2">
                              <MediaImage
                                src={product.image_url || '/placeholder.svg'}
                                alt={product.description}
                                width={300}
                                height={300}
                                sizes="200px"
                                className="w-full h-auto object-contain"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="text-center">
                              <p className="text-xs font-semibold text-blue-600 mb-1">
                                {product.product_code}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          });
        })()}
        </div>

        {/* CTA Section */}
        <div className="mt-20 mb-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                Ready to Transform Your Production?
              </h2>
            </div>
            <div className="p-8 md:p-12 text-center">
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Let's discuss how these solutions can improve quality and efficiency for {company.company_name}
              </p>
              <a
                href="/contact"
                className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                Get Your Custom Quote
              </a>
              <p className="text-sm text-gray-500 mt-4">
                Response within 2 hours • 100% Money-Back Guarantee
              </p>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

export async function generateMetadata({ params }: MarketingPageProps) {
  const { token } = await params;
  const payload = verifyToken(token);

  if (!payload) {
    return { title: 'Invalid Link' };
  }

  const supabase = getSupabaseClient();
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('company_id', payload.company_id)
    .single();

  return {
    title: `Solutions for ${company?.company_name || 'Your Company'}`,
    description: 'Personalized Technifold solutions for your printing equipment',
  };
}
