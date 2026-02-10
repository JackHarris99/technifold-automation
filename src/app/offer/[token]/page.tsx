/**
 * Offer Landing Page
 * Displays personalized offer from Smart Modal request
 * Route: /offer/[token]
 */

import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import OfferPageClient from './OfferPageClient';

export default async function OfferPage({ params }: { params: { token: string } }) {
  const { token } = params;

  // Verify token
  const payload = verifyToken(token);

  if (!payload || !payload.contact_id) {
    redirect('/');
  }

  const supabase = getSupabaseClient();

  // Fetch offer intent
  const { data: offerIntent, error: intentError } = await supabase
    .from('offer_intents')
    .select('*')
    .eq('token', token)
    .single();

  if (intentError || !offerIntent) {
    console.error('[Offer Page] Offer intent not found:', intentError);
    redirect('/');
  }

  // Check if expired
  if (offerIntent.status === 'expired' || new Date(offerIntent.token_expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏰</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer Expired</h1>
          <p className="text-gray-700 mb-6">
            This offer has expired. Please request a new one.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Update status to viewed
  if (offerIntent.status === 'email_sent' || offerIntent.status === 'pending') {
    await supabase
      .from('offer_intents')
      .update({
        status: 'viewed',
        offer_viewed_at: new Date().toISOString(),
      })
      .eq('offer_intent_id', offerIntent.offer_intent_id);
  }

  // Fetch contact details
  const { data: contact } = await supabase
    .from('contacts')
    .select('contact_id, first_name, last_name, email, phone, company_id')
    .eq('contact_id', offerIntent.contact_id)
    .single();

  // Fetch company details
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name, country')
    .eq('company_id', offerIntent.company_id)
    .single();

  // Fetch machine details
  const { data: machines } = await supabase
    .from('machines')
    .select('*')
    .in('machine_id', offerIntent.machine_ids);

  if (!machines || machines.length === 0) {
    redirect('/');
  }

  // Track page view
  try {
    await supabase.from('engagement_events').insert({
      contact_id: offerIntent.contact_id,
      company_id: offerIntent.company_id,
      occurred_at: new Date().toISOString(),
      event_type: 'offer_page_viewed',
      event_name: 'Offer landing page viewed',
      source: 'offer_email',
      meta: {
        offer_intent_id: offerIntent.offer_intent_id,
        machines: machines.map(m => m.display_name),
        problem: offerIntent.problem_slug,
      },
    });
  } catch (e) {
    console.error('[Offer Page] Failed to track view:', e);
  }

  return (
    <OfferPageClient
      offerIntent={offerIntent}
      contact={contact || undefined}
      company={company || undefined}
      machines={machines}
    />
  );
}
