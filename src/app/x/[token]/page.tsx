/**
 * Token Resolver Route - Tokenized Marketing Pages
 * /x/[token] - Verify HMAC token, track engagement, show personalized offer
 *
 * Uses the same narrative components as /machines/[slug] for consistency
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { CoverWorkNarrative } from '@/components/machines/CoverWorkNarrative';
import { PerfectBinderNarrative } from '@/components/machines/PerfectBinderNarrative';
import { SpineCreaserNarrative } from '@/components/machines/SpineCreaserNarrative';

interface TokenPageProps {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function TokenPage({ params, searchParams }: TokenPageProps) {
  const { token } = await params;
  const search = await searchParams;

  // 1. VERIFY TOKEN
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-8">
            This offer link is no longer valid. Please contact us for assistance.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  const { company_id, contact_id, offer_key, campaign_key } = payload;

  // 2. TRACK ENGAGEMENT EVENT
  const supabase = getSupabaseClient();
  const url = `/x/${token}`;
  const sessionId = crypto.randomUUID();

  // Extract UTM parameters
  const utmParams = {
    source: typeof search.utm_source === 'string' ? search.utm_source : undefined,
    medium: typeof search.utm_medium === 'string' ? search.utm_medium : undefined,
    campaign: typeof search.utm_campaign === 'string' ? search.utm_campaign : undefined,
    term: typeof search.utm_term === 'string' ? search.utm_term : undefined,
    content: typeof search.utm_content === 'string' ? search.utm_content : undefined,
  };

  const utm = Object.fromEntries(
    Object.entries(utmParams).filter(([_, v]) => v !== undefined)
  );

  try {
    await supabase.from('engagement_events').insert({
      company_id,
      contact_id: contact_id || null,
      source: 'vercel',
      event_type: 'offer_view',
      event_name: 'offer_view',
      offer_key: offer_key || null,
      campaign_key: campaign_key || null,
      session_id: sessionId,
      url,
      meta: Object.keys(utm).length > 0 ? { utm } : {},
    });
  } catch (err) {
    console.error('[token-page] Failed to track engagement event:', err);
  }

  // 3. FETCH COMPANY DETAILS
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('company_id', company_id)
    .single();

  if (!company) {
    notFound();
  }

  // 4. FETCH COMPANY MACHINES WITH FULL DETAILS
  const { data: companyMachines } = await supabase
    .from('company_machine')
    .select('machine_id, machines(machine_id, brand, model, display_name, type, slug)')
    .eq('company_id', company_id);

  // Get primary machine for narrative selection
  const primaryMachine = companyMachines?.[0]?.machines as any;

  // 5. CHECK CONSENT
  let consentGranted = true;

  if (contact_id) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('marketing_status')
      .eq('contact_id', contact_id)
      .single();

    if (contact?.marketing_status === 'unsubscribed') {
      consentGranted = false;
    }
  }

  if (!consentGranted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MarketingHeader />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Technifold Products
              </h1>
              <p className="text-xl text-gray-600">
                Browse our full product catalog
              </p>
            </div>

            <p className="text-gray-700 mb-8 text-center">
              You're currently unsubscribed from marketing communications.
              You can still browse our products and place orders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/products" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center">
                Browse Products
              </a>
              <a href="/contact" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-center">
                Contact Us
              </a>
            </div>
          </div>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  // 6. DETERMINE WHICH NARRATIVE TO SHOW
  const machineType = primaryMachine?.type?.toLowerCase() || '';

  const isFoldingMachine =
    machineType.includes('folder') ||
    machineType.includes('folding');

  const isPerfectBinder =
    machineType.includes('binder') ||
    machineType.includes('perfect');

  const isSpineCreaserMachine =
    machineType.includes('stitcher') ||
    machineType.includes('saddle') ||
    machineType.includes('booklet') ||
    machineType.includes('cover_feeder') ||
    machineType.includes('cover-feeder');

  // 7. RENDER PAGE WITH APPROPRIATE NARRATIVE
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Personalization Banner */}
      <section className="bg-blue-600 text-white py-3">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-blue-100">Exclusive offer for</span>{' '}
          <span className="font-bold">{company.company_name}</span>
        </div>
      </section>

      {/* Render the appropriate narrative based on machine type */}
      {primaryMachine && isFoldingMachine && (
        <CoverWorkNarrative machine={primaryMachine} />
      )}

      {primaryMachine && isPerfectBinder && (
        <PerfectBinderNarrative machine={primaryMachine} />
      )}

      {primaryMachine && isSpineCreaserMachine && (
        <SpineCreaserNarrative machine={primaryMachine} />
      )}

      {/* Fallback if no machine or unknown type */}
      {(!primaryMachine || (!isFoldingMachine && !isPerfectBinder && !isSpineCreaserMachine)) && (
        <>
          {/* Generic Hero */}
          <section className="bg-slate-900 text-white py-16 border-b-4 border-orange-500">
            <div className="max-w-4xl mx-auto px-6">
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                Transform Your Print Finishing
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-3xl">
                Eliminate fiber cracking, reduce waste, and increase productivity with Technifold's
                precision finishing tools. Over 40,000 installations worldwide.
              </p>
              <a
                href="/contact"
                className="inline-block bg-orange-500 text-white px-8 py-3 text-base font-bold hover:bg-orange-600 transition-colors"
              >
                Request Free Trial →
              </a>
            </div>
          </section>

          {/* Generic Solutions Grid */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Solutions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <a href="/tools/tri-creaser" className="bg-slate-50 border-2 border-gray-200 p-6 hover:border-orange-500 transition-colors group">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600">Tri-Creaser</h3>
                  <p className="text-gray-600 mb-4">Eliminate fiber cracking completely. 40,000+ installations worldwide.</p>
                  <span className="text-orange-600 font-semibold">Learn more →</span>
                </a>
                <a href="/tools/quad-creaser" className="bg-slate-50 border-2 border-gray-200 p-6 hover:border-orange-500 transition-colors group">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600">Quad-Creaser</h3>
                  <p className="text-gray-600 mb-4">Perfect bound book finishing. Four creases inline. Zero flaking.</p>
                  <span className="text-orange-600 font-semibold">Learn more →</span>
                </a>
                <a href="/tools/spine-creaser" className="bg-slate-50 border-2 border-gray-200 p-6 hover:border-orange-500 transition-colors group">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600">Spine-Creaser</h3>
                  <p className="text-gray-600 mb-4">Saddle stitcher transformation. Deep crease at 20,000 BPH.</p>
                  <span className="text-orange-600 font-semibold">Learn more →</span>
                </a>
                <a href="/tools/multi-tool" className="bg-slate-50 border-2 border-gray-200 p-6 hover:border-orange-500 transition-colors group">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600">Multi-Tool</h3>
                  <p className="text-gray-600 mb-4">6-in-1 modular system. Crease, perf, cut, matrix removal inline.</p>
                  <span className="text-orange-600 font-semibold">Learn more →</span>
                </a>
              </div>
            </div>
          </section>

          {/* Generic CTA */}
          <section className="py-12 bg-orange-500 text-white border-t-4 border-orange-600">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Finishing?</h2>
              <p className="text-lg text-orange-100 mb-6">
                Request a free 30-day trial. Zero risk, zero commitment.
              </p>
              <a
                href="/contact"
                className="inline-block bg-slate-900 text-white px-8 py-3 text-base font-bold hover:bg-slate-800 transition-colors"
              >
                Request Free Trial →
              </a>
            </div>
          </section>
        </>
      )}

      <MarketingFooter />
    </div>
  );
}
