/**
 * Token Resolver Route - Tokenized Offer Pages
 * /x/[token] - Verify HMAC token, track engagement, render offer page
 */

import { notFound, redirect } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import TokenMachineFinder from '@/components/offers/TokenMachineFinder';

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

  // Verify and decode token
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

  // Set session cookie (httpOnly)
  const cookieStore = await cookies();
  cookieStore.set('offer_session', JSON.stringify({
    company_id,
    contact_id,
    offer_key,
    campaign_key,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 3, // 3 days
  });

  // Track engagement event
  const supabase = getSupabaseClient();
  const url = `/x/${token}`;
  const sessionId = crypto.randomUUID();

  // Extract UTM parameters from search params and put in meta.utm
  const utmParams = {
    source: typeof search.utm_source === 'string' ? search.utm_source : undefined,
    medium: typeof search.utm_medium === 'string' ? search.utm_medium : undefined,
    campaign: typeof search.utm_campaign === 'string' ? search.utm_campaign : undefined,
    term: typeof search.utm_term === 'string' ? search.utm_term : undefined,
    content: typeof search.utm_content === 'string' ? search.utm_content : undefined,
  };

  // Remove undefined values
  const utm = Object.fromEntries(
    Object.entries(utmParams).filter(([_, v]) => v !== undefined)
  );

  await supabase.from('engagement_events').insert({
    company_id,
    contact_id: contact_id || null,
    source: 'vercel',
    event_type: 'offer_view',  // For trigger backfill
    event_name: 'offer_view',  // Canonical field
    offer_key: offer_key || null,
    campaign_key: campaign_key || null,
    session_id: sessionId,
    url,
    meta: Object.keys(utm).length > 0 ? { utm } : {},
  }).catch(err => {
    console.error('[token-page] Failed to track engagement event:', err);
  });

  // Fetch company details
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('company_id', company_id)
    .single();

  if (!company) {
    notFound();
  }

  // Check consent if contact_id provided
  let consentGranted = true;
  let contactMarketingStatus = 'unknown';

  if (contact_id) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('marketing_status, gdpr_consent_at')
      .eq('contact_id', contact_id)
      .single();

    if (contact) {
      contactMarketingStatus = contact.marketing_status || 'pending';

      // Check if consent is granted
      if (contact.marketing_status === 'unsubscribed') {
        consentGranted = false;
      }
    }
  }

  // Render offer page (customize based on offer_key)
  // If consent not granted, show limited version
  if (!consentGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
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
              <a
                href="/products"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center"
              >
                Browse Products
              </a>
              <a
                href="/contact"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-center"
              >
                Contact Us
              </a>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Want to receive offers again? <a href="/preferences" className="text-blue-600 hover:underline">Manage your preferences</a></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we already know this company's machine from company_machine
  const { data: companyMachines } = await supabase
    .from('company_machine')
    .select(`
      *,
      machines:machine_id (
        machine_id,
        brand,
        model,
        display_name,
        slug
      )
    `)
    .eq('company_id', company_id)
    .or('confirmed.eq.true,confidence_score.gte.4')  // Show confirmed or high-confidence machines
    .order('confidence_score', { ascending: false })
    .limit(1);

  const knownMachine = companyMachines && companyMachines.length > 0 ? companyMachines[0] : null;

  // Fetch problem cards if we know their machine
  // Each row = ONE CARD = one (machine, solution, problem) combination
  let problemCards = null;
  if (knownMachine && knownMachine.machines) {
    const machineSlug = (knownMachine.machines as any).slug;

    if (machineSlug) {
      const { data } = await supabase
        .from('v_machine_solution_problem_full')
        .select('*')
        .eq('machine_slug', machineSlug)
        .order('machine_solution_rank', { ascending: true })
        .order('global_solution_problem_rank', { ascending: true })
        .limit(10);  // Limit to top 10 for token pages

      problemCards = data || [];
    }
  }

  // Full personalized offer page for consented contacts
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* No global nav - clean offer page */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Exclusive Offer for {company.company_name}
            </h1>
            <p className="text-xl text-gray-600">
              We've prepared a special offer just for you
            </p>
          </div>

          {/* Offer content - customize based on offer_key */}
          <div className="space-y-6 mb-10">
            {offer_key === 'reorder_reminder' && (
              <>
                <p className="text-lg text-gray-700">
                  It's time to restock your consumables! We've noticed it's been a while since your last order.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Special Offer:</h3>
                  <p className="text-blue-800">10% off your reorder when you purchase today</p>
                </div>
              </>
            )}

            {offer_key === 'new_product_launch' && (
              <>
                <p className="text-lg text-gray-700">
                  We're excited to introduce our latest product innovation!
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-2">Launch Special:</h3>
                  <p className="text-green-800">20% off for early adopters</p>
                </div>
              </>
            )}

            {!offer_key && (
              <p className="text-lg text-gray-700">
                Browse our full range of products and consumables tailored to your needs.
              </p>
            )}
          </div>

          {/* Machine Selector Section - if we don't know their machine */}
          {!knownMachine && (
            <div className="mb-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                Which machine do you run?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Help us show you relevant solutions for your equipment
              </p>
              <TokenMachineFinder
                token={token}
                companyId={company_id}
                contactId={contact_id}
                offerKey={offer_key}
                campaignKey={campaign_key}
              />
            </div>
          )}

          {/* Show known machine and problem cards - ONE CARD PER PROBLEM */}
          {knownMachine && knownMachine.machines && (
            <div className="mb-10">
              <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-xl font-bold text-green-900">
                    Problems We Fix on Your {(knownMachine.machines as any).display_name}
                  </h3>
                </div>
                <p className="text-center text-green-700">
                  Here's what we can solve for you right now
                </p>
              </div>

              {/* Problem Cards - ONE PER PROBLEM */}
              {problemCards && problemCards.length > 0 && (
                <div className="space-y-6">
                  {problemCards.map((card: any) => (
                    <div key={`${card.solution_id}-${card.problem_id}`} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all">
                      {/* Problem Headline */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {card.pitch_headline}
                      </h3>

                      {/* Problem Detail */}
                      <p className="text-gray-700 mb-5 leading-relaxed">
                        {card.pitch_detail}
                      </p>

                      {/* Solution Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-gray-900">{card.solution_name}</span>
                        </div>
                        <p className="text-blue-700 text-sm font-semibold ml-7">
                          {card.solution_core_benefit}
                        </p>
                      </div>

                      {/* CTA */}
                      <a
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                      >
                        {card.action_cta || 'Get help with this'}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* If no solutions found for their machine */}
              {problemCards && problemCards.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  <p>We're updating solutions for your machine. Contact us to discuss your specific needs.</p>
                </div>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/portal/${company_id}`}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center"
            >
              View Your Portal
            </a>
            <a
              href="/products"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-center"
            >
              Browse Products
            </a>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Questions? <a href="/contact" className="text-blue-600 hover:underline">Contact us</a></p>
            <p className="mt-2"><a href="/preferences" className="text-gray-500 hover:underline">Manage your preferences</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
