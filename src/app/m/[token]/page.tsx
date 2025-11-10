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
import ReactMarkdown from 'react-markdown';
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
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section with Brand Media */}
      <div
        className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20"
        style={brandMedia?.hero_url ? {
          backgroundImage: `linear-gradient(to bottom right, rgba(37, 99, 235, 0.9), rgba(79, 70, 229, 0.9)), url(${brandMedia.hero_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-8 mb-6">
            {brandMedia?.logo_url && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <img
                  src={brandMedia.logo_url}
                  alt={machine?.brand || 'Brand'}
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Solutions for {company.company_name}
              </h1>
              {machine && (
                <p className="text-xl text-blue-100">
                  Personalized for your {machine.brand} {machine.model}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Solution Cards - 2-Column Layout */}
        <div className="space-y-12">
          {solutionCards.map((card: any) => {
            const imageUrl = card.resolved_image_url || '/placeholder-machine.jpg';

            // Replace placeholders in marketing copy
            const personalizedCopy = replacePlaceholders(
              card.resolved_full_copy || card.resolved_card_copy || '',
              machine,
              company.company_name
            );

            // Get curated products for this solution
            const curatedProducts = (card.curated_skus || [])
              .map((sku: string) => productMap.get(sku))
              .filter((p: any): p is any => p !== undefined);

            return (
              <article key={card.problem_solution_id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all">
                {/* 2-Column Grid */}
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* LEFT COLUMN: Solution Marketing Content */}
                  <div className="p-8 lg:p-12 flex flex-col">
                    {/* Solution Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6 self-start">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {card.solution_name}
                    </div>

                    {/* Solution Image (if available) */}
                    {imageUrl && imageUrl !== '/placeholder-machine.jpg' && (
                      <div className="relative h-48 w-full bg-gray-100 rounded-xl overflow-hidden mb-6">
                        <MediaImage
                          src={imageUrl}
                          alt={`${card.solution_name} - ${card.title}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}

                    {/* Marketing Copy */}
                    <div className="prose prose-lg max-w-none mb-8 flex-1">
                      <ReactMarkdown>{personalizedCopy}</ReactMarkdown>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Product Showcase */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12 border-l-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Recommended Tools
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      {machine ? `Precision-engineered for your ${machine.brand}` : 'Professional solutions for your equipment'}
                    </p>

                    {curatedProducts.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {curatedProducts.map((product: any) => (
                          <div key={product.product_code} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-400 hover:shadow-lg transition-all">
                            {/* Product Image */}
                            <div className="relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                              <MediaImage
                                src={product.image_url || '/placeholder.svg'}
                                alt={product.description}
                                fill
                                sizes="200px"
                                className="object-contain p-2"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="text-center">
                              <p className="text-xs font-bold text-blue-600 mb-1">
                                {product.product_code}
                              </p>
                              <p className="text-xs text-gray-700 line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-sm">
                          Contact us for product recommendations
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Contact us to discuss how these solutions can work for {company.company_name}
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
          >
            Request a Quote
          </a>
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
