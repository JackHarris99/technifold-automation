import Link from 'next/link';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

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
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 border-b-4 border-orange-500">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-orange-400 text-sm mb-4">
            <Link href="/machines" className="hover:text-orange-300">All Machines</Link>
            {' / '}
            <span className="text-gray-400">{machine.brand} {machine.model}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {renderedCopy.hero_headline}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl">
            {renderedCopy.hero_subheading}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact?trial=true"
              className="inline-block bg-orange-500 text-white px-8 py-3 font-bold hover:bg-orange-600 transition-colors"
            >
              {renderedCopy.cta_primary}
            </Link>
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
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Common challenges when finishing on the {machine.brand} {machine.model}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {renderedCopy.problems.map((problem, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-4">{problem.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-gray-600">{problem.description}</p>
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
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
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
                <p className="text-gray-600">{feature.description}</p>
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
                  <p className="text-gray-300">{prop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {renderedCopy.pricing_title}
          </h2>
          <p className="text-gray-600 mb-8">
            {renderedCopy.pricing_subheading}
          </p>
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-md mx-auto">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {basePricing.display}
              <span className="text-lg text-gray-500 font-normal">/month</span>
            </div>
            <p className="text-gray-600 mb-6">
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
            <Link
              href="/contact?trial=true"
              className="block w-full bg-orange-500 text-white py-3 font-bold hover:bg-orange-600 transition-colors text-center"
            >
              Start Free Trial
            </Link>
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
            <div className="text-gray-600">
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
          <Link
            href="/contact?trial=true"
            className="inline-block bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors"
          >
            Request Free Trial
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
