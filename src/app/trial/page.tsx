/**
 * Trial Request Page
 *
 * Flow: Collect details → Send tokenized email → Customer clicks → Stripe checkout
 * NOT: Direct Stripe signup
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

function TrialPageContent() {
  const searchParams = useSearchParams();
  const machineSlug = searchParams.get('machine');
  const offerPrice = searchParams.get('offer') || '99';

  const [machine, setMachine] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (machineSlug) {
      loadMachine();
    }
  }, [machineSlug]);

  async function loadMachine() {
    const supabase = createClient();
    const { data } = await supabase
      .from('machines')
      .select('*')
      .eq('slug', machineSlug)
      .single();

    setMachine(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API to create lead and send tokenized email
      const response = await fetch('/api/trial/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_slug: machineSlug,
          offer_price: parseInt(offerPrice),
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Trial request error:', error);
      alert('Something went wrong. Please try again or contact us at sales@technifold.co.uk');
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Request Received! 📧
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              We've sent you an email with your personalized trial link.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-bold text-gray-900 mb-4">Next Steps:</h2>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <div className="font-semibold">Check Your Email</div>
                    <div className="text-sm text-gray-600">Look for an email from sales@technifold.co.uk in the next few minutes</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <div className="font-semibold">Click Your Trial Link</div>
                    <div className="text-sm text-gray-600">The email contains a personalized link to start your trial</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <div className="font-semibold">Enter Payment Details</div>
                    <div className="text-sm text-gray-600">Card required but not charged until after 30-day trial</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <div className="font-semibold">We Ship Your Trial Kit</div>
                    <div className="text-sm text-gray-600">Arrives in 2-3 days, test for 30 days free</div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="text-sm text-gray-500">
              <p className="mb-2">Didn't receive the email? Check your spam folder.</p>
              <p>Need help? Call us: <strong>01707 275 114</strong></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Request Your Free Trial
          </h1>
          {machine && (
            <p className="text-xl text-gray-600">
              {machine.brand} {machine.model} • £{offerPrice}/month after trial
            </p>
          )}
          <p className="text-gray-500 mt-2">
            30-day free trial • Cancel anytime
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">What Happens Next:</h2>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <div className="font-semibold">Fill In Your Details</div>
                <div className="text-sm text-gray-600">Takes 1 minute</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <div className="font-semibold">We Email You A Trial Link</div>
                <div className="text-sm text-gray-600">Personalized link sent to your email</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <div className="font-semibold">Click Link & Enter Card</div>
                <div className="text-sm text-gray-600">Card required, charged after 30-day trial</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <div className="font-semibold">Trial Kit Ships In 2-3 Days</div>
                <div className="text-sm text-gray-600">Test for 30 days, keep or cancel</div>
              </div>
            </li>
          </ol>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ABC Printing Ltd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@abcprinting.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+44 1234 567890"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Sending...' : 'Request Trial →'}
            </button>

            <p className="text-xs text-center text-gray-500">
              By submitting, you agree to receive our trial email. You can unsubscribe anytime.
            </p>
          </form>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Trusted by 2,800+ printers worldwide</p>
          <div className="flex justify-center items-center gap-8 text-gray-400">
            <div>🏆 Award Winning</div>
            <div>•</div>
            <div>🌍 Global Shipping</div>
            <div>•</div>
            <div>📞 UK Support Team</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrialPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TrialPageContent />
    </Suspense>
  );
}
