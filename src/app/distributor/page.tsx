/**
 * Distributor Dashboard
 * Place orders and view invoice history
 */

import { getCurrentDistributor } from '@/lib/distributorAuth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import DistributorDashboard from '@/components/distributor/DistributorDashboard';

export default async function DistributorDashboardPage() {
  const distributor = await getCurrentDistributor();

  if (!distributor) {
    redirect('/distributor/login');
  }

  const supabase = getSupabaseClient();

  // Fetch distributor's own invoices
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('invoice_id, invoice_number, invoice_date, total_amount, status')
    .eq('company_id', distributor.company_id)
    .order('invoice_date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Distributor Dashboard] Error fetching invoices:', error);
  }

  // Get distributor's pricing tier
  const { data: company } = await supabase
    .from('companies')
    .select('distributor_tier')
    .eq('company_id', distributor.company_id)
    .single();

  const distributorTier = company?.distributor_tier || 'standard';

  // Fetch ALL products (no limit)
  let allProducts: any[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch } = await supabase
      .from('products')
      .select('product_code, description, price, category, type, currency, image_url')
      .eq('active', true)
      .not('price', 'is', null)
      .order('type', { ascending: true })
      .order('category', { ascending: true })
      .order('description', { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (!batch || batch.length === 0) {
      hasMore = false;
    } else {
      allProducts = [...allProducts, ...batch];
      if (batch.length < batchSize) {
        hasMore = false;
      }
      offset += batchSize;
    }
  }

  // Fetch distributor pricing for this tier
  const { data: distributorPricing } = await supabase
    .from('distributor_pricing')
    .select('product_code, price, currency')
    .eq('tier', distributorTier)
    .eq('active', true);

  // Create pricing map for quick lookup
  const pricingMap = new Map(
    (distributorPricing || []).map(dp => [dp.product_code, { price: dp.price, currency: dp.currency }])
  );

  // Apply distributor pricing (fallback to standard price if no tier pricing)
  const productsWithPricing = allProducts.map(product => {
    const tierPricing = pricingMap.get(product.product_code);
    return {
      ...product,
      price: tierPricing?.price ?? product.price,
      currency: tierPricing?.currency ?? product.currency,
      has_tier_pricing: !!tierPricing,
    };
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                {distributor.company_name}
              </h1>
              <p className="text-[15px] text-[#475569] font-[500] mt-2">
                Distributor Portal
              </p>
            </div>
            <form action="/api/distributor/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-[13px] font-[600] text-[#475569] hover:text-[#1e40af] transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <DistributorDashboard
          distributor={distributor}
          invoices={invoices || []}
          products={productsWithPricing}
          tier={distributorTier}
        />
      </div>
    </div>
  );
}
