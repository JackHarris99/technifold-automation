/**
 * Offer Page Client Component
 * Displays personalized offer with pricing, benefits, social proof
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Machine {
  machine_id: string;
  slug: string;
  display_name: string;
  brand: string;
  model: string;
  type: string;
  description?: string;
}

interface Props {
  offerIntent: any;
  contact?: any;
  company?: any;
  machines: Machine[];
}

export default function OfferPageClient({ offerIntent, contact, company, machines }: Props) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<'base' | 'premium'>('base');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryMachine = machines[0];
  const multipleMachines = machines.length > 1;

  // Get pricing based on machine type
  const getPricing = () => {
    const machineType = primaryMachine.type;

    // Pricing by machine type
    const pricing: Record<string, { base: number; premium?: number; description: string }> = {
      folder: {
        base: 99,
        premium: 159,
        description: 'Single or dual shaft creasing system',
      },
      perfect_binder: {
        base: 89,
        description: 'Quad creaser for perfect binding',
      },
      saddle_stitcher: {
        base: 69,
        description: 'Spine creasing system',
      },
      booklet_maker: {
        base: 69,
        description: 'Inline finishing solution',
      },
      cover_feeder: {
        base: 79,
        description: 'Cover creasing system',
      },
    };

    return pricing[machineType] || pricing.folder;
  };

  const pricing = getPricing();
  const hasPremiumTier = !!pricing.premium;
  const monthlyPrice = selectedTier === 'premium' ? pricing.premium! : pricing.base;

  const handleStartTrial = async () => {
    setIsSubmitting(true);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contact.contact_id,
          company_id: company.company_id,
          machine_slug: primaryMachine.slug,
          monthly_price: monthlyPrice,
          currency: 'GBP',
          trial_days: 30,
          metadata: {
            offer_intent_id: offerIntent.offer_intent_id,
            machine_ids: machines.map(m => m.machine_id),
            problem_slug: offerIntent.problem_slug,
          },
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Mark offer as converted
        await fetch(`/api/offers/${offerIntent.offer_intent_id}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversion_type: 'trial' }),
        });

        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again or contact us directly.');
      setIsSubmitting(false);
    }
  };

  const handleRequestQuote = async () => {
    // TODO: Implement quote request flow
    alert('Quote request coming soon! For now, please call us at +44 (0)1455 554491');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                alt="Technifold"
                className="h-10"
              />
              <div className="border-l border-gray-300 pl-4">
                <div className="text-sm text-gray-600">Your Personalized Offer</div>
                <div className="font-semibold text-gray-900">{company?.company_name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Custom Solution for {multipleMachines ? 'Your Machines' : primaryMachine.display_name}
          </h1>
          <p className="text-xl text-gray-700">
            Risk-free trial • Money-back guarantee • Proven results
          </p>
        </div>

        {/* Machines Grid */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Machine{multipleMachines ? 's' : ''}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machines.map((machine) => (
              <div
                key={machine.machine_id}
                className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50"
              >
                <div className="font-bold text-lg text-gray-900">{machine.display_name}</div>
                <div className="text-sm text-gray-600 mt-1">{machine.brand} • {machine.model}</div>
                {machine.description && (
                  <div className="text-sm text-gray-700 mt-2">{machine.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        {hasPremiumTier && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Tier */}
              <button
                onClick={() => setSelectedTier('base')}
                className={`border-2 rounded-xl p-6 text-left transition-all ${
                  selectedTier === 'base'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-sm font-semibold text-blue-600 mb-2">SINGLE SHAFT</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">£{pricing.base}/month</div>
                <div className="text-sm text-gray-600">Single shaft creasing system</div>
              </button>

              {/* Premium Tier */}
              <button
                onClick={() => setSelectedTier('premium')}
                className={`border-2 rounded-xl p-6 text-left transition-all ${
                  selectedTier === 'premium'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-sm font-semibold text-blue-600 mb-2">DUAL SHAFT</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">£{pricing.premium}/month</div>
                <div className="text-sm text-gray-600">Dual shaft creasing system</div>
              </button>
            </div>
          </div>
        )}

        {!hasPremiumTier && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">£{pricing.base}</div>
            <div className="text-xl text-gray-600 mb-4">per month</div>
            <div className="text-gray-700">{pricing.description}</div>
          </div>
        )}

        {/* What's Included */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">30-Day Free Trial</div>
                <div className="text-sm text-gray-600">Test on your machine with no commitment</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Money-Back Guarantee</div>
                <div className="text-sm text-gray-600">100% refund if it doesn't work</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Expert Installation Support</div>
                <div className="text-sm text-gray-600">Direct access to our technical team</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Proven Results</div>
                <div className="text-sm text-gray-600">Used by print shops worldwide</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-2xl p-8 text-center text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 text-lg">Try risk-free for 30 days</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartTrial}
              disabled={isSubmitting}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  Processing...
                </span>
              ) : (
                `Start 30-Day Free Trial →`
              )}
            </button>

            <button
              onClick={handleRequestQuote}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 font-semibold text-lg transition-all"
            >
              Request Quote Instead
            </button>
          </div>

          <p className="text-sm text-blue-100 mt-6">
            No credit card required for trial • Cancel anytime
          </p>
        </div>

        {/* Contact Info */}
        <div className="text-center text-gray-600">
          <p className="mb-2">Questions? We're here to help!</p>
          <p className="font-semibold">
            <a href="mailto:info@technifold.co.uk" className="text-blue-600 hover:text-blue-800">
              info@technifold.co.uk
            </a>
            {' • '}
            <a href="tel:+441455554491" className="text-blue-600 hover:text-blue-800">
              +44 (0)1455 554491
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
