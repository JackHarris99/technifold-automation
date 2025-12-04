'use client';

import { useState } from 'react';
import { CoverWorkNarrative } from '@/components/machines/CoverWorkNarrative';
import { PerfectBinderNarrative } from '@/components/machines/PerfectBinderNarrative';
import { SpineCreaserNarrative } from '@/components/machines/SpineCreaserNarrative';

interface OfferPageClientProps {
  token: string;
  trialIntentId: string;
  machine: {
    machine_id: string;
    brand: string;
    model: string;
    type: string;
    display_name: string;
    slug: string;
  };
  company: {
    company_id: string;
    company_name: string;
  } | null;
  contact: {
    contact_id: string;
    full_name: string;
    email: string;
  } | null;
  pricing: {
    tiers: 'single' | 'dual';
    basePrice: number;
    premiumPrice?: number;
    baseLabel: string;
    premiumLabel?: string;
    baseDescription: string;
    premiumDescription?: string;
  };
}

export function OfferPageClient({
  token,
  trialIntentId,
  machine,
  company,
  contact,
  pricing,
}: OfferPageClientProps) {
  const [loading, setLoading] = useState<'base' | 'premium' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine which narrative to show based on machine type
  const isFoldingMachine = ['folder', 'folding_machine', 'folding-machines'].includes(machine.type?.toLowerCase());
  const isPerfectBinder = ['perfect_binder', 'perfect-binder', 'perfect-binders'].includes(machine.type?.toLowerCase());
  const isSpineCreaserMachine = [
    'saddle_stitcher', 'saddle-stitcher', 'saddle-stitchers',
    'booklet_maker', 'booklet-maker', 'booklet-makers',
    'cover_feeder', 'cover-feeder', 'cover-feeders',
  ].includes(machine.type?.toLowerCase());

  async function handleSelectPrice(selectedPrice: number, tier: 'base' | 'premium') {
    setLoading(tier);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          trial_intent_id: trialIntentId,
          selected_price: selectedPrice,
          company_id: company?.company_id,
          contact_id: contact?.contact_id,
          machine_id: machine.machine_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  }

  return (
    <>
      {/* Personalized Header */}
      <section className="bg-slate-900 text-white py-8 border-b-4 border-cyan-500">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-cyan-400 text-sm font-medium tracking-wide uppercase mb-2">
            Your Personalized Trial Offer
          </p>
          <h1 className="text-2xl md:text-3xl font-light">
            {contact?.full_name ? `Hi ${contact.full_name.split(' ')[0]}, ` : ''}
            Here's your offer for the{' '}
            <span className="font-medium">{machine.brand} {machine.model}</span>
          </h1>
          {company?.company_name && (
            <p className="text-slate-400 mt-2">{company.company_name}</p>
          )}
        </div>
      </section>

      {/* Machine-specific narrative */}
      <div className="border-b border-slate-200">
        {isFoldingMachine && <CoverWorkNarrativeReadOnly machine={machine} />}
        {isPerfectBinder && <PerfectBinderNarrativeReadOnly machine={machine} />}
        {isSpineCreaserMachine && <SpineCreaserNarrativeReadOnly machine={machine} />}
        {!isFoldingMachine && !isPerfectBinder && !isSpineCreaserMachine && (
          <GenericNarrative machine={machine} />
        )}
      </div>

      {/* Pricing Section */}
      <section className="py-16 bg-slate-50" id="pricing">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-slate-600">
              30-day free trial on all plans. Cancel anytime.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8 text-center">
              {error}
            </div>
          )}

          {/* Single Tier Pricing (Perfect Binders, Spine Creasers) */}
          {pricing.tiers === 'single' && (
            <div className="max-w-md mx-auto">
              <div className="bg-white border-2 border-cyan-500 rounded-lg p-8 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Recommended
                  </span>
                </div>

                <div className="text-center mb-6">
                  <p className="text-sm font-medium text-cyan-600 uppercase tracking-wide mb-2">
                    {pricing.baseLabel}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">£{pricing.basePrice}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">after 30-day free trial</p>
                  <p className="text-sm text-slate-600 mt-3">{pricing.baseDescription}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    30-day free trial
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete tooling package
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Installation support
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cancel anytime
                  </li>
                </ul>

                <button
                  onClick={() => handleSelectPrice(pricing.basePrice, 'base')}
                  disabled={loading !== null}
                  className="w-full bg-cyan-600 text-white py-3 font-medium hover:bg-cyan-700 transition-colors disabled:bg-slate-400"
                >
                  {loading === 'base' ? 'Redirecting to checkout...' : 'Start Free Trial'}
                </button>
              </div>
            </div>
          )}

          {/* Dual Tier Pricing (Folding Machines) */}
          {pricing.tiers === 'dual' && (
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Base Plan */}
              <div className="bg-white border border-slate-200 rounded-lg p-8">
                <div className="text-center mb-6">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
                    {pricing.baseLabel}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">£{pricing.basePrice}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">after 30-day free trial</p>
                  <p className="text-sm text-slate-600 mt-3">{pricing.baseDescription}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    30-day free trial
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Standard tooling package
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Installation support
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cancel anytime
                  </li>
                </ul>

                <button
                  onClick={() => handleSelectPrice(pricing.basePrice, 'base')}
                  disabled={loading !== null}
                  className="w-full bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-400"
                >
                  {loading === 'base' ? 'Redirecting to checkout...' : 'Start Free Trial'}
                </button>
              </div>

              {/* Premium Plan */}
              <div className="bg-white border-2 border-cyan-500 rounded-lg p-8 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Most Popular
                  </span>
                </div>

                <div className="text-center mb-6">
                  <p className="text-sm font-medium text-cyan-600 uppercase tracking-wide mb-2">
                    {pricing.premiumLabel}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">£{pricing.premiumPrice}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">after 30-day free trial</p>
                  <p className="text-sm text-slate-600 mt-3">{pricing.premiumDescription}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    30-day free trial
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <strong>Enhanced</strong> tooling package
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority installation
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Extended consumables
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cancel anytime
                  </li>
                </ul>

                <button
                  onClick={() => handleSelectPrice(pricing.premiumPrice!, 'premium')}
                  disabled={loading !== null}
                  className="w-full bg-cyan-600 text-white py-3 font-medium hover:bg-cyan-700 transition-colors disabled:bg-slate-400"
                >
                  {loading === 'premium' ? 'Redirecting to checkout...' : 'Start Free Trial'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-8">
            Card required to start trial. You won't be charged until the trial ends.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <h3 className="font-medium text-slate-900 mb-2">How does the 30-day trial work?</h3>
              <p className="text-slate-600">
                You'll receive the full tooling package for your {machine.brand} {machine.model}.
                Use it in production for 30 days. If you're not satisfied with the results,
                return it at no cost. Otherwise, billing begins automatically.
              </p>
            </div>

            <div className="border-b border-slate-200 pb-6">
              <h3 className="font-medium text-slate-900 mb-2">What if I need to cancel?</h3>
              <p className="text-slate-600">
                Cancel anytime with no penalties. Return the tooling and your subscription ends.
                We'll even arrange collection at no extra charge.
              </p>
            </div>

            <div className="border-b border-slate-200 pb-6">
              <h3 className="font-medium text-slate-900 mb-2">Is installation included?</h3>
              <p className="text-slate-600">
                Yes. All plans include remote installation support. For Enhanced plans,
                we offer priority scheduling and extended support hours.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="font-medium text-slate-900 mb-2">Can I upgrade later?</h3>
              <p className="text-slate-600">
                Absolutely. You can upgrade your plan at any time. The price difference
                will be prorated on your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Read-only versions of narratives (without the trial form at the bottom)
function CoverWorkNarrativeReadOnly({ machine }: { machine: any }) {
  return (
    <article className="bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <section className="mb-12">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Your folding machine already handles speed, registration and folding accuracy brilliantly — but it has one unavoidable limitation.
          </p>

          <p className="text-lg text-slate-800 font-medium leading-relaxed mb-6">
            It was never engineered to crease, perforate, or cut single sheets to a high standard.
          </p>

          <div className="text-slate-600 leading-relaxed space-y-4 mb-8">
            <p>OEM scoring wheels tear fibres. Standard perf wheels rip rather than perforate. Integrated slitting knives rough-trim a stack, not a single sheet.</p>
          </div>

          <p className="text-slate-900 font-medium text-lg border-l-2 border-cyan-500 pl-4">
            It's the tooling. And that's exactly where Technifold comes in.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="border border-slate-200 p-5">
            <p className="text-cyan-600 text-xs font-medium uppercase tracking-wide mb-2">Capability 01</p>
            <p className="text-slate-900 font-medium">Tri-Creaser</p>
            <p className="text-slate-500 text-sm mt-1">Fibre-crack elimination</p>
          </div>
          <div className="border border-slate-200 p-5">
            <p className="text-cyan-600 text-xs font-medium uppercase tracking-wide mb-2">Capability 02</p>
            <p className="text-slate-900 font-medium">Micro-Perforator</p>
            <p className="text-slate-500 text-sm mt-1">Precision perforation</p>
          </div>
          <div className="border border-slate-200 p-5">
            <p className="text-cyan-600 text-xs font-medium uppercase tracking-wide mb-2">Capability 03</p>
            <p className="text-slate-900 font-medium">Multi-Tool</p>
            <p className="text-slate-500 text-sm mt-1">Inline trimming &amp; slitting</p>
          </div>
        </div>

        <div className="text-center">
          <a href="#pricing" className="inline-block bg-cyan-600 text-white px-8 py-3 font-medium hover:bg-cyan-700 transition-colors">
            See Pricing Options
          </a>
        </div>
      </div>
    </article>
  );
}

function PerfectBinderNarrativeReadOnly({ machine }: { machine: any }) {
  return (
    <article className="bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <section className="mb-12">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Your perfect binder is an incredible machine. It handles feeding, gluing, nipping and trimming with astonishing reliability — but it has one fatal weak link:
          </p>

          <p className="text-lg text-slate-800 font-medium leading-relaxed mb-6">
            The cover-feeder's rotary metal scoring system.
          </p>

          <div className="text-slate-600 leading-relaxed space-y-4 mb-8">
            <p>It wasn't engineered for modern coated stocks. It wasn't engineered for premium finishes. And it certainly wasn't engineered for digital, laminated or short-grain work.</p>
          </div>

          <p className="text-slate-900 font-medium text-lg border-l-2 border-cyan-500 pl-4">
            It's the scoring system. And it's holding the machine back.
          </p>
        </section>

        <div className="bg-slate-50 border border-slate-200 p-6 mb-8">
          <h3 className="font-medium text-slate-900 mb-4">The Quad Creaser Solution</h3>
          <p className="text-slate-600">
            The Technifold Quad Creaser replaces the metal scoring wheel with a true fibre-friendly creasing mechanism.
            Zero cracking. Zero tearing. Zero laminate lifting. At any production speed.
          </p>
        </div>

        <div className="text-center">
          <a href="#pricing" className="inline-block bg-cyan-600 text-white px-8 py-3 font-medium hover:bg-cyan-700 transition-colors">
            See Pricing Options
          </a>
        </div>
      </div>
    </article>
  );
}

function SpineCreaserNarrativeReadOnly({ machine }: { machine: any }) {
  return (
    <article className="bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <section className="mb-12">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Your machine is exceptional. It feeds, aligns, collates, stitches and trims with impressive consistency — but it suffers from one unavoidable weakness:
          </p>

          <p className="text-lg text-slate-800 font-medium leading-relaxed mb-6">
            The single cover crease.
          </p>

          <div className="text-slate-600 leading-relaxed space-y-4 mb-8">
            <p>OEM scoring wheels were never engineered to crease premium cover stocks cleanly and consistently. They cut. They slice. They drag fibres apart.</p>
          </div>

          <p className="text-slate-900 font-medium text-lg border-l-2 border-cyan-500 pl-4">
            It's the tooling.
          </p>
        </section>

        <div className="bg-slate-50 border border-slate-200 p-6 mb-8">
          <h3 className="font-medium text-slate-900 mb-4">The Spine-Creaser Solution</h3>
          <p className="text-slate-600">
            The Technifold Spine-Creaser replaces the metal scoring wheel with a precision-engineered rotary creasing mechanism
            that gently manipulates fibres instead of tearing them.
          </p>
        </div>

        <div className="text-center">
          <a href="#pricing" className="inline-block bg-cyan-600 text-white px-8 py-3 font-medium hover:bg-cyan-700 transition-colors">
            See Pricing Options
          </a>
        </div>
      </div>
    </article>
  );
}

function GenericNarrative({ machine }: { machine: any }) {
  return (
    <article className="bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <section className="mb-12">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Your {machine.brand} {machine.model} is a capable machine — but like all finishing equipment,
            it can benefit from precision tooling upgrades.
          </p>

          <p className="text-slate-900 font-medium text-lg border-l-2 border-cyan-500 pl-4">
            Technifold tooling transforms finishing quality and eliminates common production issues.
          </p>
        </section>

        <div className="text-center">
          <a href="#pricing" className="inline-block bg-cyan-600 text-white px-8 py-3 font-medium hover:bg-cyan-700 transition-colors">
            See Pricing Options
          </a>
        </div>
      </div>
    </article>
  );
}
