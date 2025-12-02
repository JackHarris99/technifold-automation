/**
 * Trial Checkout Route
 * /t/[token] - HMAC-signed token for trial subscription checkout
 *
 * Flow:
 * 1. Verify token
 * 2. Show trial summary
 * 3. Click to proceed to Stripe checkout
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import TrialCheckoutClient from './TrialCheckoutClient';

interface TrialCheckoutProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function TrialCheckoutPage({ params }: TrialCheckoutProps) {
  const { token } = await params;

  // 1. Verify HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Expired</h1>
          <p className="text-gray-600 mb-8">
            This trial link is no longer valid. Please request a new trial.
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

  const { company_id, contact_id, machine_slug, offer_price, email, company_name, contact_name } = payload;
  const supabase = getSupabaseClient();

  // 2. Fetch machine details for display name
  let machine = null;
  if (machine_slug) {
    const { data } = await supabase
      .from('machines')
      .select('*')
      .eq('slug', machine_slug)
      .single();
    machine = data;
  }

  // 3. Track page view (don't await - fire and forget)
  supabase.from('engagement_events').insert({
    company_id: company_id || null,
    contact_id: contact_id || null,
    event_type: 'trial_checkout_view',
    event_name: 'trial_checkout_page_view',
    source: 'email_link',
    url: `/t/${token}`,
    meta: {
      machine_slug,
      offer_price,
    }
  });

  const machineName = machine
    ? `${machine.brand} ${machine.model}`
    : 'Your Equipment';

  // Use names from token payload (set when trial was requested)
  return (
    <TrialCheckoutClient
      token={token}
      machineName={machineName}
      machineSlug={machine_slug || ''}
      offerPrice={offer_price || 99}
      companyName={company_name || ''}
      contactName={contact_name || ''}
      email={email || ''}
    />
  );
}

export async function generateMetadata({ params }: TrialCheckoutProps) {
  const { token } = await params;
  const payload = verifyToken(token);

  if (!payload) {
    return { title: 'Trial Link Expired' };
  }

  return {
    title: 'Start Your Free Trial - Technifold',
    description: '30-day free trial. No charge until trial ends.',
  };
}
