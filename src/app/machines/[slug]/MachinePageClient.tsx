'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MachinePageClientProps {
  machine: any;
  renderedCopy: any;
  basePricing: any;
  personalization: any;
}

export default function MachinePageClient({
  machine,
  renderedCopy,
  basePricing,
  personalization,
}: MachinePageClientProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              {renderedCopy.hero_headline}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {renderedCopy.hero_subheading}
            </p>
            <div className="flex gap-4">
              <Link
                href={`/trial?machine=${machine.slug}&offer=${basePricing.amount}`}
                className="inline-block px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-blue-50 transition-colors"
              >
                {renderedCopy.cta_primary}
              </Link>
              <a
                href="#how-it-works"
                className="inline-block px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-lg hover:bg-white/10 transition-colors"
              >
                {renderedCopy.cta_secondary}
              </a>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              30-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {renderedCopy.problem_section_title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {renderedCopy.problems.map((problem: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-4xl mb-4">{problem.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-gray-600">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {renderedCopy.solution_section_title}
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            {renderedCopy.solution_subheading}
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What You Get:</h3>
              <ul className="space-y-4">
                {renderedCopy.solution_features.map((feature: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900">{feature.title}</div>
                      <div className="text-gray-600 text-sm">{feature.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What This Means For You:</h3>
              <div className="space-y-4">
                {renderedCopy.value_props.map((prop: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="text-3xl">{prop.icon}</div>
                    <div>
                      <div className="font-bold text-gray-900">{prop.title}</div>
                      <div className="text-sm text-gray-600">{prop.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {renderedCopy.pricing_title}
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            {renderedCopy.pricing_subheading}
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-sm uppercase font-semibold text-blue-600 mb-2">
              {personalization.machine_type}s
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {basePricing.display}<span className="text-2xl text-gray-500">/month</span>
            </div>
            <div className="text-sm text-gray-500 mb-8">
              Typically {basePricing.typicalRange} based on capability
            </div>

            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Full inline capability</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Installation guide for your machine</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Consumables included</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Upgrade capability anytime</span>
              </li>
            </ul>

            <Link
              href={`/trial?machine=${machine.slug}&offer=${basePricing.amount}`}
              className="block w-full px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors"
            >
              {renderedCopy.cta_primary}
            </Link>
            <p className="text-xs text-gray-500 mt-4">
              30-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Trusted By 2,800+ Printers Worldwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Game changer for our digital finishing. ROI in under 3 months.",
                author: "Print Manager, UK",
              },
              {
                quote: "Eliminated fiber cracking completely. Customers love the quality.",
                author: "Production Director, Germany",
              },
              {
                quote: "We run 40% faster now. Best investment we've made this year.",
                author: "Operations Manager, USA",
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg">
                <div className="text-yellow-500 text-2xl mb-3">★★★★★</div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="text-sm text-gray-600">
                  <div className="font-semibold">{testimonial.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready To Transform Your {personalization.brand} {personalization.model}?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free 30-day trial today.
          </p>
          <Link
            href={`/trial?machine=${machine.slug}&offer=${basePricing.amount}`}
            className="inline-block px-12 py-5 bg-white text-blue-600 font-bold text-xl rounded-lg hover:bg-blue-50 transition-colors"
          >
            {renderedCopy.cta_primary}
          </Link>
          <p className="text-sm text-blue-200 mt-6">
            Questions? Call us: +44 (0)1455 55 44 91 or email: sales@technifold.co.uk
          </p>
        </div>
      </section>
    </div>
  );
}
