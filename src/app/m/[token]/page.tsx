/**
 * Marketing Page Route
 * /m/[token] - Full personalized solution content with placeholder replacement
 * Shows full_solution_copy for selected problem/solutions
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import ReactMarkdown from 'react-markdown';
import MediaImage from '@/components/shared/MediaImage';

interface MarketingPageProps {
  params: Promise<{
    token: string;
  }>;
}

// Placeholder replacement function
function replacePlaceholders(text: string, machineData?: {
  brand?: string;
  model?: string;
  display_name?: string;
  type?: string;
}, companyName?: string): string {
  if (!text) return '';

  const brand = machineData?.brand || '';
  const model = machineData?.model || '';
  const displayName = machineData?.display_name || '';
  const type = machineData?.type?.replace('_', ' ') || '';

  return text
    // With fallback: {brand|your} → brand or "your"
    .replace(/\{brand\|([^}]+)\}/gi, brand || '$1')
    .replace(/\{model\|([^}]+)\}/gi, model || '$1')
    .replace(/\{display_name\|([^}]+)\}/gi, displayName || '$1')
    .replace(/\{type\|([^}]+)\}/gi, type || '$1')
    .replace(/\{company\|([^}]+)\}/gi, companyName || '$1')
    // Without fallback: {brand} → brand or "your"
    .replace(/\{brand\}/gi, brand || 'your')
    .replace(/\{model\}/gi, model || 'machine')
    .replace(/\{display_name\}/gi, displayName || 'your machine')
    .replace(/\{type\}/gi, type || 'machine')
    .replace(/\{company\}/gi, companyName || 'your company');
}

export default async function MarketingPage({ params }: MarketingPageProps) {
  const { token } = await params;

  // 1. Verify HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-8">
            This link is no longer valid. Please contact us for assistance.
          </p>
          <a href="/contact" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  const { company_id, contact_id } = payload;
  const supabase = getSupabaseClient();

  // 2. Get company details
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('company_id', company_id)
    .single();

  if (!company) {
    notFound();
  }

  // 3. Get company's machine (highest confidence)
  const { data: companyMachines } = await supabase
    .from('company_machine')
    .select(`
      machine_id,
      machines:machine_id (
        brand,
        model,
        display_name
      )
    `)
    .eq('company_id', company_id)
    .order('verified', { ascending: false })
    .limit(1);

  const machine = companyMachines?.[0]?.machines as any;

  // 4. Get company's interests
  const { data: interests } = await supabase
    .from('company_interests')
    .select(`
      problem_solution_id,
      problem_solution:problem_solution_id (
        solution_name,
        title,
        full_solution_copy,
        image_url
      )
    `)
    .eq('company_id', company_id)
    .eq('status', 'interested');

  // 5. Track marketing page view
  if (contact_id) {
    const { error: trackingError } = await supabase
      .from('contact_interactions')
      .insert({
        contact_id,
        company_id,
        interaction_type: 'marketing_page_view',
        url: `/m/${token}`,
        metadata: {
          solution_count: interests?.length || 0,
          has_machine: !!machine
        }
      });

    if (trackingError) {
      console.error('[Marketing] Tracking failed:', trackingError);
    }
  }

  // 6. Render full marketing content
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Solutions for {company.company_name}
          </h1>
          {machine && (
            <p className="text-xl text-gray-600">
              Personalized for your {machine.brand} {machine.model}
            </p>
          )}
        </div>

        {/* Solution Cards */}
        <div className="space-y-12">
          {(interests || []).map((interest: any) => {
            const ps = interest.problem_solution;
            if (!ps) return null;

            // Replace placeholders
            const personalizedCopy = replacePlaceholders(
              ps.full_solution_copy || '',
              machine,
              company.company_name
            );

            return (
              <article key={interest.problem_solution_id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                {/* Image */}
                {ps.image_url && (
                  <div className="relative h-80 w-full bg-gray-100">
                    <MediaImage
                      src={ps.image_url}
                      alt={`${ps.solution_name} - ${ps.title}`}
                      fill
                      sizes="100vw"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-8 md:p-12">
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
                    {ps.solution_name}
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{personalizedCopy}</ReactMarkdown>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Contact us to discuss how these solutions can work for {company.company_name}
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
          >
            Request a Quote
          </a>
        </div>
      </main>

      <MarketingFooter />
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
    title: `Solutions for ${company?.company_name || 'Your Company'}`,
    description: 'Personalized Technifold solutions for your printing equipment',
  };
}
