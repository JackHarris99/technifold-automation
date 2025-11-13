/**
 * Quote Page Route
 * /q/[token] - Tool purchase/rental quote with Stripe checkout
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import QuotePageClient from '@/components/quote/QuotePageClient';

interface QuotePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { token } = await params;

  // 1. Verify HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-8">
            This quote link is no longer valid. Please contact us for assistance.
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
    .select('company_id, company_name, country')
    .eq('company_id', company_id)
    .single();

  if (!company) {
    notFound();
  }

  // 3. Get contact details
  const { data: contact } = await supabase
    .from('contacts')
    .select('contact_id, full_name, email, first_name, last_name')
    .eq('contact_id', contact_id)
    .single();

  // 4. Get company's interested solutions
  const { data: interests } = await supabase
    .from('company_interests')
    .select('problem_solution_id')
    .eq('company_id', company_id)
    .eq('status', 'interested');

  const interestedProblemSolutionIds = (interests || []).map(i => i.problem_solution_id);

  // 5. Get problem/solution data to identify products
  let solutionCards: any[] = [];
  if (interestedProblemSolutionIds.length > 0) {
    const { data: cards } = await supabase
      .from('v_problem_solution_machine')
      .select('*')
      .in('problem_solution_id', interestedProblemSolutionIds);

    solutionCards = cards || [];
  }

  // 6. Collect all unique product codes from curated_skus
  const allProductCodes = new Set<string>();
  solutionCards.forEach(card => {
    if (card.curated_skus && Array.isArray(card.curated_skus)) {
      card.curated_skus.forEach((sku: string) => allProductCodes.add(sku));
    }
  });

  // 7. Fetch product data with pricing (including rental pricing)
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, image_url, category, price, rental_price_monthly, currency, active')
    .in('product_code', Array.from(allProductCodes))
    .eq('active', true);

  const productData = products || [];

  // 8. Get existing shipping address if any
  const { data: addresses } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('company_id', company_id)
    .order('is_default', { ascending: false })
    .limit(1);

  const existingAddress = addresses?.[0] || null;

  // 9. Track quote page view
  if (contact_id) {
    await supabase
      .from('engagement_events')
      .insert({
        contact_id,
        company_id,
        event_type: 'quote_page_view',
        event_name: 'quote_page_view',
        source: 'vercel',
        url: `/q/${token}`,
        meta: {
          product_count: productData.length,
          solution_count: solutionCards.length
        }
      });
  }

  // 10. Render quote page
  return (
    <QuotePageClient
      company={company}
      contact={contact}
      products={productData}
      solutionCards={solutionCards}
      existingAddress={existingAddress}
      token={token}
    />
  );
}

export async function generateMetadata({ params }: QuotePageProps) {
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
    title: `Quote for ${company?.company_name || 'Your Company'}`,
    description: 'Start your free trial or purchase Technifold solutions',
  };
}
