/**
 * Marketing Follow-Up Route
 * /m/[token] - HMAC-signed token for lead nurture and follow-up
 * Shows personalized solutions based on customer's machines and interests
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface MarketingPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function MarketingFollowUpPage({ params }: MarketingPageProps) {
  const { token } = await params;

  // 1. Verify HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-800 mb-8">
            This link is no longer valid. Please contact us for more information.
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

  const { company_id, contact_id, offer_key } = payload;
  const supabase = getSupabaseClient();

  // 2. Fetch company
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('company_id', company_id)
    .single();

  if (!company) {
    notFound();
  }

  // 3. Fetch contact
  let contact = null;
  if (contact_id) {
    const { data } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email, first_name')
      .eq('contact_id', contact_id)
      .single();
    contact = data;
  }

  // 4. Track engagement
  if (contact) {
    supabase
      .from('engagement_events')
      .insert({
        contact_id: contact.contact_id,
        company_id: company.company_id,
        event_type: 'marketing_view',
        event_name: 'marketing_page_view',
        source: 'vercel',
        url: `/m/${token}`,
        meta: {
          contact_name: contact.full_name,
          company_name: company.company_name,
          offer_key: offer_key || 'general'
        }
      })
      .then(() => console.log(`[Marketing] Tracked view by ${contact.full_name}`))
      .catch(err => console.error('[Marketing] Tracking failed:', err));
  }

  const firstName = contact?.first_name || contact?.full_name?.split(' ')[0] || 'there';

  // Featured solutions
  const solutions = [
    {
      title: 'Tri-Creaser',
      description: 'Eliminate fiber cracking completely on folded stocks',
      href: '/tools/tri-creaser',
      icon: '📐'
    },
    {
      title: 'Quad-Creaser',
      description: 'Perfect bound book finishing made easy',
      href: '/tools/quad-creaser',
      icon: '📚'
    },
    {
      title: 'Spine-Creaser',
      description: 'Transform your saddle stitcher production',
      href: '/tools/spine-creaser',
      icon: '📖'
    },
    {
      title: 'Multi-Tool',
      description: '6-in-1 modular finishing system',
      href: '/tools/multi-tool',
      icon: '🔧'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <div className="bg-slate-900 border-b-4 border-orange-500">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hi {firstName} 👋
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Personalized solutions for {company.company_name}
          </p>
          <p className="text-slate-700">
            Discover how Technifold can transform your print finishing
          </p>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Solutions We Think You'll Love
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {solutions.map((solution) => (
            <Link
              key={solution.href}
              href={solution.href}
              className="bg-white rounded-lg p-6 hover:shadow-xl transition group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{solution.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {solution.title}
                  </h3>
                  <p className="text-gray-800 mb-4">{solution.description}</p>
                  <div className="text-blue-600 font-semibold flex items-center gap-2">
                    Learn More
                    <span className="group-hover:translate-x-1 transition">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Transform Your Finishing?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Over 40,000 installations worldwide. Join the world's leading printers who trust Technifold.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Request a Demo
            </a>
            <a
              href="/tools/tri-creaser"
              className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition border border-blue-500"
            >
              Explore All Solutions
            </a>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <p className="text-slate-700 mb-4">Trusted by industry leaders worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-700 text-sm">
            <span>40,000+ Installations</span>
            <span>•</span>
            <span>27 Years Experience</span>
            <span>•</span>
            <span>World-Leading Technology</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-700 text-sm">
          <p>Technifold Ltd • Professional Print Finishing Solutions</p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: MarketingPageProps) {
  const { token } = await params;
  const payload = verifyToken(token);

  if (!payload) {
    return { title: 'Invalid Link' };
  }

  const supabase = getSupabaseClient();
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('company_id', payload.company_id)
    .single();

  return {
    title: `Solutions for ${company?.company_name || 'Your Company'} - Technifold`,
    description: 'Personalized print finishing solutions from Technifold',
  };
}
