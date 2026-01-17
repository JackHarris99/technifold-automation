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
    .select('pricing_tier')
    .eq('company_id', distributor.company_id)
    .single();

  const distributorTier = company?.pricing_tier || 'standard';

  // Check if company has custom product catalog
  const { data: customCatalog } = await supabase
    .from('company_product_catalog')
    .select('product_code')
    .eq('company_id', distributor.company_id)
    .eq('visible', true);

  const hasCustomCatalog = customCatalog && customCatalog.length > 0;

  // Fetch products based on catalog type
  let allProducts: any[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('products')
      .select('product_code, description, price, category, type, currency, image_url')
      .eq('active', true)
      .not('price', 'is', null);

    // If company has custom catalog, filter to only those products
    if (hasCustomCatalog) {
      const customProductCodes = customCatalog.map(c => c.product_code);
      query = query.in('product_code', customProductCodes);
    } else {
      // Otherwise, show products marked for distributor portal
      query = query.eq('show_in_distributor_portal', true);
    }

    query = query
      .order('type', { ascending: true })
      .order('category', { ascending: true })
      .order('description', { ascending: true })
      .range(offset, offset + batchSize - 1);

    const { data: batch } = await query;

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

  // Fetch ALL distributor pricing (with pagination to avoid 1000 row limit)
  let allPricing: any[] = [];
  let pricingOffset = 0;
  const pricingBatchSize = 1000;
  let hasMorePricing = true;

  while (hasMorePricing) {
    const { data: pricingBatch, error: pricingError } = await supabase
      .from('distributor_pricing')
      .select('product_code, standard_price, currency')
      .eq('active', true)
      .range(pricingOffset, pricingOffset + pricingBatchSize - 1);

    if (pricingError) {
      console.error('[Distributor Portal] Error fetching distributor pricing:', pricingError);
      break;
    }

    if (!pricingBatch || pricingBatch.length === 0) {
      hasMorePricing = false;
    } else {
      allPricing = [...allPricing, ...pricingBatch];
      if (pricingBatch.length < pricingBatchSize) {
        hasMorePricing = false;
      }
      pricingOffset += pricingBatchSize;
    }
  }

  console.log('[Distributor Portal] Fetched pricing entries:', allPricing.length);
  console.log('[Distributor Portal] Total products to price:', allProducts.length);

  // Create pricing map for quick lookup
  const pricingMap = new Map(
    allPricing.map(dp => [dp.product_code, dp])
  );

  // Test specific products
  console.log('[Distributor Portal] Test CP-AP-BF/22-FP pricing:', pricingMap.get('CP-AP-BF/22-FP'));
  console.log('[Distributor Portal] Test EF-PC/30-Y pricing:', pricingMap.get('EF-PC/30-Y'));
  console.log('[Distributor Portal] Test PD-NY/SL-25 pricing:', pricingMap.get('PD-NY/SL-25'));

  // Apply distributor pricing (use standard_price for all distributors)
  let debugCount = 0;
  const productsWithPricing = allProducts.map(product => {
    const pricingData = pricingMap.get(product.product_code);

    // Use distributor standard_price if available, otherwise fallback to product's base price
    const distributorPrice = pricingData?.standard_price ?? null;

    // Debug: Log specific problem products
    if (product.product_code === 'CP-AP-BF/22-FP' || product.product_code === 'EF-PC/30-Y' || debugCount < 3) {
      console.log('[Distributor Portal] Product:', product.product_code,
        'Base:', product.price,
        'Distributor:', distributorPrice,
        'Final:', distributorPrice ?? product.price,
        'Has pricing data:', !!pricingData);
      debugCount++;
    }

    return {
      ...product,
      price: distributorPrice ?? product.price,
      currency: pricingData?.currency ?? product.currency,
      has_distributor_pricing: !!distributorPrice,
    };
  });

  console.log('[Distributor Portal] Final product count:', productsWithPricing.length);

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
