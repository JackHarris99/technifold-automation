/**
 * Token Resolver Route - Tokenized Offer Pages
 * /x/[token] - Verify HMAC token, track engagement, render offer page
 */

import { notFound, redirect } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

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

  // Extract UTM parameters from search params
  const utmSource = typeof search.utm_source === 'string' ? search.utm_source : undefined;
  const utmMedium = typeof search.utm_medium === 'string' ? search.utm_medium : undefined;
  const utmCampaign = typeof search.utm_campaign === 'string' ? search.utm_campaign : undefined;
  const utmTerm = typeof search.utm_term === 'string' ? search.utm_term : undefined;
  const utmContent = typeof search.utm_content === 'string' ? search.utm_content : undefined;

  await supabase.from('engagement_events').insert({
    company_id,
    contact_id: contact_id || null,
    source: 'vercel',
    event_name: 'offer_view',
    offer_key: offer_key || null,
    campaign_key: campaign_key || null,
    session_id: sessionId,
    url,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent,
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
      if (contact.marketing_status === 'opted_out' || contact.marketing_status === 'unsubscribed') {
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
