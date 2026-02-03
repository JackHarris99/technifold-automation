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

  // Fetch distributor orders (pending, partially fulfilled, etc.)
  const { data: orders, error: ordersError } = await supabase
    .from('distributor_orders')
    .select('order_id, status, total_amount, created_at, reviewed_at')
    .eq('company_id', distributor.company_id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (ordersError) {
    console.error('[Distributor Dashboard] Error fetching orders:', ordersError);
  }

  // Fetch back-order items for this distributor
  const { data: backOrderItems, error: backOrderError } = await supabase
    .from('distributor_order_items')
    .select(`
      item_id,
      product_code,
      description,
      quantity,
      predicted_delivery_date,
      back_order_notes,
      distributor_orders!inner (
        order_id,
        company_id
      )
    `)
    .eq('status', 'back_order')
    .eq('distributor_orders.company_id', distributor.company_id);

  if (backOrderError) {
    console.error('[Distributor Dashboard] Error fetching back-order items:', backOrderError);
  }

  // Get distributor's pricing tier
  const { data: company } = await supabase
    .from('companies')
    .select('pricing_tier')
    .eq('company_id', distributor.company_id)
    .single();

  const distributorTier = company?.pricing_tier || 'tier_1';

  // Determine discount multiplier based on pricing tier
  const discountMultiplier =
    distributorTier === 'tier_1' ? 0.60 : // 40% off = 60% of base
    distributorTier === 'tier_2' ? 0.70 : // 30% off = 70% of base
    0.80; // 20% off = 80% of base

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

  // Note: Distributor pricing is now calculated dynamically from base product price * tier multiplier
  // No need to fetch from distributor_pricing table (which has stale data)

  // Fetch company-specific custom pricing (with pagination)
  const pricingBatchSize = 1000;
  let allCustomPricing: any[] = [];
  let customPricingOffset = 0;
  let hasMoreCustomPricing = true;

  while (hasMoreCustomPricing) {
    const { data: customPricingBatch, error: customPricingError } = await supabase
      .from('company_distributor_pricing')
      .select('product_code, custom_price, currency')
      .eq('company_id', distributor.company_id)
      .eq('active', true)
      .range(customPricingOffset, customPricingOffset + pricingBatchSize - 1);

    if (customPricingError) {
      console.error('[Distributor Portal] Error fetching custom pricing:', customPricingError);
      break;
    }

    if (!customPricingBatch || customPricingBatch.length === 0) {
      hasMoreCustomPricing = false;
    } else {
      allCustomPricing = [...allCustomPricing, ...customPricingBatch];
      if (customPricingBatch.length < pricingBatchSize) {
        hasMoreCustomPricing = false;
      }
      customPricingOffset += pricingBatchSize;
    }
  }

  // Create pricing map for custom prices
  const customPricingMap = new Map(
    allCustomPricing.map(cp => [cp.product_code, cp])
  );

  // Apply pricing with priority: Custom price → Dynamic tier-based price → Base price
  const productsWithPricing = allProducts.map(product => {
    const customPricingData = customPricingMap.get(product.product_code);
    const basePrice = product.price; // Store original base price for RRP display

    // Priority: 1. Custom price, 2. Dynamic tier-based price (base * multiplier), 3. Base product price
    let finalPrice = product.price;
    let currency = product.currency;
    let hasCustomPricing = false;
    let hasDistributorPricing = false;

    if (customPricingData?.custom_price !== undefined) {
      // Custom price override
      finalPrice = customPricingData.custom_price;
      currency = customPricingData.currency;
      hasCustomPricing = true;
    } else if (product.price !== null && product.price !== undefined) {
      // Dynamic tier-based pricing
      finalPrice = product.price * discountMultiplier;
      hasDistributorPricing = true;
    }

    return {
      ...product,
      price: finalPrice, // Distributor's discounted price
      base_price: basePrice, // Original full price (RRP)
      currency,
      has_custom_pricing: hasCustomPricing,
      has_distributor_pricing: hasDistributorPricing,
    };
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Admin Preview Mode Banner */}
      {(distributor as any).preview_mode && (
        <div className="bg-red-600 text-white py-3 px-8">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👁</span>
              <div>
                <div className="font-bold text-sm">ADMIN PREVIEW MODE</div>
                <div className="text-xs opacity-90">
                  Viewing as: {distributor.full_name} ({distributor.company_name})
                </div>
              </div>
            </div>
            <form action="/api/admin/distributor-users/exit-preview" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
              >
                Exit Preview
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-[700] text-[#1e40af] tracking-[-0.02em]">
                Distributor Portal
              </h1>
              <p className="text-[13px] text-[#64748b] font-[500] mt-1">
                {distributor.full_name} • {distributor.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <DistributorDashboard
          distributor={distributor}
          invoices={invoices || []}
          orders={orders || []}
          backOrderItems={backOrderItems || []}
          products={productsWithPricing}
          tier={distributorTier}
        />
      </div>
    </div>
  );
}
