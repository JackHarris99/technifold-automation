'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CoverWorkNarrative } from '@/components/machines/CoverWorkNarrative';
import { PerfectBinderNarrative } from '@/components/machines/PerfectBinderNarrative';
import { SpineCreaserNarrative } from '@/components/machines/SpineCreaserNarrative';

interface MachinePageClientProps {
  machine: {
    machine_id: string;
    brand: string;
    model: string;
    display_name: string;
    type: string;
    slug: string;
  };
  renderedCopy: {
    hero_headline: string;
    hero_subheading: string;
    problem_section_title: string;
    problems: Array<{ icon: string; title: string; description: string }>;
    solution_section_title: string;
    solution_subheading: string;
    solution_features: Array<{ title: string; description: string }>;
    value_props: Array<{ icon: string; title: string; description: string }>;
    cta_primary: string;
    cta_secondary: string;
    pricing_title: string;
    pricing_subheading: string;
  };
  basePricing: {
    amount: number;
    display: string;
    typicalRange: string;
  };
  personalization: {
    brand: string;
    model: string;
    machine_type: string;
    monthly_price: string;
    typical_range: string;
  };
}

export default function MachinePageClient({
  machine,
  renderedCopy,
  basePricing,
  personalization,
}: MachinePageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/trial/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_slug: machine.slug,
          machine_name: `${machine.brand} ${machine.model}`,
          offer_price: basePricing.amount,
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
      alert('Something went wrong. Please try again or contact us at info@technifold.co.uk');
      setLoading(false);
    }
  }

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('trial-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Check if this is a folding machine type
  const isFoldingMachine = machine.type === 'folder' || machine.type === 'folding_machine' || machine.type === 'folding-machines';

  // Check if this is a perfect binder type
  const isPerfectBinder = machine.type === 'perfect_binder' || machine.type === 'perfect-binder' || machine.type === 'perfect-binders';

  // Check if this is a spine-creaser capable machine (saddle stitchers, booklet makers, cover feeders)
  const isSpineCreaserMachine =
    machine.type === 'saddle_stitcher' || machine.type === 'saddle-stitcher' || machine.type === 'saddle-stitchers' ||
    machine.type === 'booklet_maker' || machine.type === 'booklet-maker' || machine.type === 'booklet-makers' ||
    machine.type === 'cover_feeder' || machine.type === 'cover-feeder' || machine.type === 'cover-feeders';

  // For folding machines, render the Cover Work narrative
  if (isFoldingMachine) {
    return (
      <>
        {/* Breadcrumb Header */}
        <section className="bg-slate-900 text-white py-6 border-b-4 border-orange-500">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-orange-400 text-sm">
              <Link href="/machines" className="hover:text-orange-300">All Machines</Link>
              {' / '}
              <span className="text-gray-800">{machine.brand} {machine.model}</span>
            </div>
          </div>
        </section>

        {/* Cover Work Narrative */}
        <CoverWorkNarrative machine={machine} />
      </>
    );
  }

  // For perfect binders, render the Perfect Binder narrative
  if (isPerfectBinder) {
    return (
      <>
        {/* Breadcrumb Header */}
        <section className="bg-slate-900 text-white py-6 border-b-4 border-orange-500">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-orange-400 text-sm">
              <Link href="/machines" className="hover:text-orange-300">All Machines</Link>
              {' / '}
              <span className="text-gray-800">{machine.brand} {machine.model}</span>
            </div>
          </div>
        </section>

        {/* Perfect Binder Narrative */}
        <PerfectBinderNarrative machine={machine} />
      </>
    );
  }

  // For spine-creaser capable machines (saddle stitchers, booklet makers, cover feeders)
  if (isSpineCreaserMachine) {
    return (
      <>
        {/* Breadcrumb Header */}
        <section className="bg-slate-900 text-white py-6 border-b-4 border-orange-500">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-orange-400 text-sm">
              <Link href="/machines" className="hover:text-orange-300">All Machines</Link>
              {' / '}
              <span className="text-gray-800">{machine.brand} {machine.model}</span>
            </div>
          </div>
        </section>

        {/* Spine Creaser Narrative */}
        <SpineCreaserNarrative machine={machine} />
      </>
    );
  }

  // For other machine types, render the original content
  return (
    <>

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 border-b-4 border-orange-500">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-orange-400 text-sm mb-4">
            <Link href="/machines" className="hover:text-orange-300">All Machines</Link>
            {' / '}
            <span className="text-gray-800">{machine.brand} {machine.model}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {renderedCopy.hero_headline}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl">
            {renderedCopy.hero_subheading}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={scrollToForm}
              className="inline-block bg-orange-500 text-white px-8 py-3 font-bold hover:bg-orange-600 transition-colors"
            >
              {renderedCopy.cta_primary}
            </button>
            <Link
              href="#solution"
              className="inline-block bg-white/10 border border-white/20 text-white px-8 py-3 font-medium hover:bg-white/20 transition-colors"
            >
              {renderedCopy.cta_secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {renderedCopy.problem_section_title}
          </h2>
          <p className="text-gray-800 text-center mb-12 max-w-2xl mx-auto">
            Common challenges when finishing on the {machine.brand} {machine.model}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {renderedCopy.problems.map((problem, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-4">{problem.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-gray-800">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            {renderedCopy.solution_section_title}
          </h2>
          <p className="text-gray-800 text-center mb-12 max-w-2xl mx-auto">
            {renderedCopy.solution_subheading}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {renderedCopy.solution_features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-800">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {renderedCopy.value_props.map((prop, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="text-3xl">{prop.icon}</div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{prop.title}</h3>
                  <p className="text-gray-600">{prop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Inline Form */}
      <section id="trial-form" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {renderedCopy.pricing_title}
          </h2>
          <p className="text-gray-800 mb-8">
            {renderedCopy.pricing_subheading}
          </p>

          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-lg mx-auto">
            {/* Machine Context */}
            <div className="bg-slate-900 text-white -mx-8 -mt-8 px-8 py-4 rounded-t-lg mb-6">
              <div className="text-sm text-gray-800">Free trial for your</div>
              <div className="text-xl font-bold">{machine.brand} {machine.model}</div>
            </div>

            {submitted ? (
              /* Success State */
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Received!</h3>
                <p className="text-gray-800 mb-4">
                  Check your email for your personalized trial link.
                </p>
                <div className="text-sm text-gray-700">
                  Didn't get it? Check spam or call <strong>01707 275 114</strong>
                </div>
              </div>
            ) : !showForm ? (
              /* Initial State - Pricing + Button */
              <>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {basePricing.display}
                  <span className="text-lg text-gray-700 font-normal">/month</span>
                </div>
                <p className="text-gray-800 mb-6">
                  Typical systems: {basePricing.typicalRange}/month
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">30-day free trial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Full installation support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Training included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Cancel anytime</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowForm(true)}
                  className="block w-full bg-orange-500 text-white py-3 font-bold hover:bg-orange-600 transition-colors text-center"
                >
                  Start Free Trial
                </button>
              </>
            ) : (
              /* Form State */
              <>
                <div className="text-left mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">{basePricing.display}/month</span>
                    <span className="text-sm text-green-600 font-medium">30 days free</span>
                  </div>
                  <p className="text-sm text-gray-700">Card required after trial. Cancel anytime.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="ABC Printing Ltd"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="john@abcprinting.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="+44 1234 567890"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 text-white font-bold py-3 rounded hover:bg-orange-600 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Sending...' : 'Request Trial'}
                  </button>

                  <p className="text-xs text-center text-gray-700">
                    We'll email you a secure link to complete your trial signup.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-8 text-center">
            <blockquote className="text-xl text-gray-700 italic mb-4">
              "The quality improvement was immediate. We went from rejecting 15% of our heavy cover jobs to zero rejects. Paid for itself in the first month."
            </blockquote>
            <div className="text-gray-800">
              — Production Manager, Commercial Printer
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Transform Your {machine.brand} {machine.model}?
          </h2>
          <p className="text-orange-100 mb-6">
            See the difference professional finishing makes. 30-day free trial, no commitment.
          </p>
          <button
            onClick={scrollToForm}
            className="inline-block bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors"
          >
            Request Free Trial
          </button>
        </div>
      </section>

    </>
  );
}
