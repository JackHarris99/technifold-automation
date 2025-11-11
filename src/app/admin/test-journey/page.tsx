/**
 * Customer Journey Testing Guide
 * Step-by-step instructions for testing the complete flow
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestJourneyPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (step: number) => {
    if (completedSteps.includes(step)) {
      setCompletedSteps(completedSteps.filter(s => s !== step));
    } else {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const steps = [
    {
      title: 'Generate Test Links',
      description: 'Create tokenized links for a test customer',
      instructions: [
        'Go to /admin/test-tokens',
        'Select a company from the dropdown (or search by name)',
        'Select a contact for that company',
        'Click "Generate Test Links"',
        'You should see 3 tokenized links: Marketing (/m/), Quote (/q/), Reorder (/r/)',
      ],
      verification: 'You can copy and open each link in a new tab',
      link: '/admin/test-tokens',
    },
    {
      title: 'Test Marketing Page (/m/[token])',
      description: 'View the customer marketing experience',
      instructions: [
        'Open the Marketing link from step 1',
        'You should see the company name and contact name at the top',
        'Browse the solution cards with images, descriptions, and benefits',
        'Click through any "Learn More" sections',
        'Scroll to see before/after images and product recommendations',
        'Click "Get a Quote" button at the bottom',
      ],
      verification: 'Clicking "Get a Quote" should take you to /q/[token]',
    },
    {
      title: 'Test Quote Page (/q/[token])',
      description: 'Test the pricing and checkout flow',
      instructions: [
        'You should see two pricing options: Rental (£50/month) and Purchase (£1,500)',
        'Rental should be highlighted as "Recommended"',
        'Fill in the shipping address form',
        'Check the "I agree to terms" checkbox',
        'Click "Proceed to Checkout"',
      ],
      verification: 'You should be redirected to Stripe Checkout (test mode)',
    },
    {
      title: 'Test Stripe Checkout',
      description: 'Complete a test payment',
      instructions: [
        'On Stripe Checkout, use test card: 4242 4242 4242 4242',
        'Expiry: Any future date (e.g., 12/25)',
        'CVC: Any 3 digits (e.g., 123)',
        'Fill in name and email',
        'Click "Subscribe" or "Pay" button',
      ],
      verification: 'You should be redirected to /quote/success page',
    },
    {
      title: 'Verify Database Records',
      description: 'Check that data was saved correctly',
      instructions: [
        'Go to Supabase → Tables',
        'Check "orders" table - should have new order with stripe_payment_intent_id',
        'Check "shipping_addresses" table - should have your test address',
        'If rental: Check "rental_agreements" table - should have new rental with serial number (TF-YYYY-NNNNNN)',
        'Check "engagement_events" table - should have "checkout_started" and "order_completed" events',
      ],
      verification: 'All tables should have corresponding records',
    },
    {
      title: 'Test Email Sending (Marketing Tab)',
      description: 'Send a marketing email from Company Console',
      instructions: [
        'Add your email as a contact in the database (or use existing)',
        'Go to /admin',
        'Click on a company card',
        'Go to "Marketing" tab',
        'Select: Brand → Model → Solution',
        'Select your contact (with your email)',
        'Click "Send to 1 Contact(s)"',
        'Check your email inbox',
      ],
      verification: 'You should receive an email from onboarding@resend.dev with a tokenized /m/ link',
    },
    {
      title: 'Test Email Link Click',
      description: 'Verify tracking when customer clicks email link',
      instructions: [
        'Open the email from step 6',
        'Click the "View Your Solutions" button',
        'You should land on /m/[token] page',
        'Go to Supabase → engagement_events table',
        'Look for event_type = "email_opened" or "link_clicked"',
      ],
      verification: 'Engagement events should be tracked',
    },
    {
      title: 'Test Stripe Webhook',
      description: 'Verify webhook processing',
      instructions: [
        'Go to Stripe Dashboard → Developers → Webhooks',
        'Find your webhook endpoint (should be yourdomain.com/api/stripe/webhook)',
        'Click "Send test webhook"',
        'Select event: checkout.session.completed',
        'Check your application logs',
      ],
      verification: 'Webhook should process successfully (200 OK)',
    },
    {
      title: 'Test Rental Subscription Updates',
      description: 'Verify subscription lifecycle (if using rental)',
      instructions: [
        'Go to Stripe Dashboard → Subscriptions',
        'Find the test subscription you created',
        'Try: Cancel subscription',
        'Check Supabase rental_agreements table',
        'The status should update to "cancelled"',
      ],
      verification: 'Subscription status syncs to database via webhook',
    },
    {
      title: 'Test Cancellation Flow',
      description: 'What happens if customer cancels checkout',
      instructions: [
        'Go through steps 1-3 again',
        'On Stripe Checkout page, click "Back" or close the tab',
        'You should land on /quote/cancelled page',
        'Verify "Return to Quote" button works',
      ],
      verification: 'Customer can return to quote and try again',
    },
  ];

  const completionPercentage = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Customer Journey Testing Guide</h1>
          <p className="text-lg text-gray-600 mb-6">
            Complete step-by-step walkthrough to test the entire customer flow from email to checkout.
          </p>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-blue-600">
                {completedSteps.length} / {steps.length} steps completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Testing Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);

            return (
              <div
                key={stepNumber}
                className={`bg-white rounded-xl border-2 transition-all ${
                  isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <button
                      onClick={() => toggleStep(stepNumber)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isCompleted ? '✓' : stepNumber}
                    </button>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>

                    {step.link && (
                      <Link
                        href={step.link}
                        target="_blank"
                        className="flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        Open →
                      </Link>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="ml-12">
                    <h4 className="font-semibold text-gray-900 mb-2">Instructions:</h4>
                    <ol className="space-y-2 mb-4">
                      {step.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <span className="text-blue-600 font-bold">{i + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        <strong>✓ Verification:</strong> {step.verification}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {completionPercentage === 100 && (
          <div className="mt-8 bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-900 mb-3">Testing Complete!</h2>
            <p className="text-lg text-green-800 mb-6">
              You've verified the entire customer journey. The system is ready for your team to use.
            </p>
            <div className="space-y-2">
              <p className="text-green-900">
                <strong>Next steps:</strong>
              </p>
              <p className="text-green-800">
                • Train your team on the Company Console → Marketing Tab workflow
              </p>
              <p className="text-green-800">• Set up domain verification in Resend for production emails</p>
              <p className="text-green-800">• Configure Stripe to live mode when ready</p>
            </div>
          </div>
        )}

        {/* Quick Reference */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">🔗 Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/test-tokens"
              className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-gray-900">Test Token Generator</div>
              <div className="text-xs text-gray-600">/admin/test-tokens</div>
            </Link>
            <Link
              href="/admin"
              className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-gray-900">Company Console</div>
              <div className="text-xs text-gray-600">/admin</div>
            </Link>
            <a
              href="https://dashboard.stripe.com/test/dashboard"
              target="_blank"
              className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-gray-900">Stripe Dashboard</div>
              <div className="text-xs text-gray-600">dashboard.stripe.com</div>
            </a>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-gray-900">Supabase Dashboard</div>
              <div className="text-xs text-gray-600">supabase.com</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
