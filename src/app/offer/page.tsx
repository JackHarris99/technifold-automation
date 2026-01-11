/**
 * /offer?token=...
 *
 * Personalized trial offer page:
 * 1. Validates token from trial_intents
 * 2. Fetches machine, company, contact details
 * 3. Renders machine-specific narrative copy
 * 4. Shows pricing options with Stripe checkout buttons
 */

import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { OfferPageClient } from './OfferPageClient';

interface OfferPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function OfferPage({ searchParams }: OfferPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <InvalidTokenPage message="No token provided" />;
  }

  const supabase = createServerClient();

  // Look up trial_intent by token
  const { data: trialIntent, error: intentError } = await supabase
    .from('trial_intents')
    .select('id, token, company_id, contact_id, machine_id, created_at')
    .eq('token', token)
    .single();

  if (intentError || !trialIntent) {
    console.error('[offer] Trial intent lookup error:', intentError);
    return <InvalidTokenPage message="Invalid or expired link" />;
  }

  // Check if token is expired (7 days)
  const createdAt = new Date(trialIntent.created_at);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceCreation > 7) {
    return <InvalidTokenPage message="This offer link has expired. Please request a new trial." />;
  }

  // Fetch machine details
  const { data: machine, error: machineError } = await supabase
    .from('machines')
    .select('machine_id, brand, model, type, display_name, slug')
    .eq('machine_id', trialIntent.machine_id)
    .single();

  if (machineError || !machine) {
    console.error('[offer] Machine lookup error:', machineError);
    return <InvalidTokenPage message="Machine not found" />;
  }

  // Fetch company details
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('company_id', trialIntent.company_id)
    .single();

  // Fetch contact details
  const { data: contact } = await supabase
    .from('contacts')
    .select('contact_id, full_name, email')
    .eq('contact_id', trialIntent.contact_id)
    .single();

  // Determine pricing based on machine type
  const pricing = getPricingForMachineType(machine.type);

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <OfferPageClient
        token={token}
        trialIntentId={trialIntent.id}
        machine={machine}
        company={company}
        contact={contact}
        pricing={pricing}
      />
      <MarketingFooter />
    </div>
  );
}

function InvalidTokenPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Invalid Link</h1>
        <p className="text-slate-800 mb-8">{message}</p>
        <a
          href="/machines"
          className="inline-block bg-slate-900 text-white px-6 py-3 font-medium hover:bg-slate-800 transition-colors"
        >
          Find Your Machine
        </a>
        <p className="text-sm text-slate-700 mt-6">
          Need help? Call <strong>+44 (0)1455 381 538</strong>
        </p>
      </div>
      <MarketingFooter />
    </div>
  );
}

function getPricingForMachineType(type: string): {
  tiers: 'single' | 'dual';
  basePrice: number;
  premiumPrice?: number;
  baseLabel: string;
  premiumLabel?: string;
  baseDescription: string;
  premiumDescription?: string;
} {
  // Normalize type
  const normalizedType = type.toLowerCase().replace(/_/g, '-');

  // Folding machines: Two tiers (single vs double capability)
  const folderPricing = {
    tiers: 'dual' as const,
    basePrice: 99,
    premiumPrice: 159,
    baseLabel: 'Single Capability',
    premiumLabel: 'Double Capability',
    baseDescription: 'Core finishing capability for your folder',
    premiumDescription: 'Extended capability setup with additional tooling',
  };

  // Perfect binders: Single tier at £99
  const perfectBinderPricing = {
    tiers: 'single' as const,
    basePrice: 99,
    baseLabel: 'Quad Creaser',
    baseDescription: 'Complete cover creasing solution for your perfect binder',
  };

  // Spine creasers (stitchers, booklet makers, cover feeders): Single tier at £79
  const spineCreaserPricing = {
    tiers: 'single' as const,
    basePrice: 79,
    baseLabel: 'Spine Creaser',
    baseDescription: 'Professional spine creasing for your finishing line',
  };

  // Map machine types to pricing
  if (['folder', 'folding-machine', 'folding-machines', 'folding_machine'].includes(normalizedType)) {
    return folderPricing;
  }

  if (['perfect-binder', 'perfect-binders', 'perfect_binder'].includes(normalizedType)) {
    return perfectBinderPricing;
  }

  if ([
    'saddle-stitcher', 'saddle-stitchers', 'saddle_stitcher',
    'booklet-maker', 'booklet-makers', 'booklet_maker',
    'cover-feeder', 'cover-feeders', 'cover_feeder',
  ].includes(normalizedType)) {
    return spineCreaserPricing;
  }

  // Default to folder pricing
  return folderPricing;
}
