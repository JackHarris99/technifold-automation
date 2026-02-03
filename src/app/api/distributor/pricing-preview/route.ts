/**
 * POST /api/distributor/pricing-preview
 * Preview distributor wholesale pricing for cart items
 * Uses JWT authentication (distributor cookies)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDistributor } from '@/lib/distributorAuth';
import { getSupabaseClient } from '@/lib/supabase';

interface CartItemInput {
  product_code: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentDistributor();

    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shipping_address_id } = body as { items: CartItemInput[]; shipping_address_id?: string };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        preview: {
          line_items: [],
          subtotal: 0,
          shipping: 0,
          vat_amount: 0,
          vat_rate: 0,
          vat_exempt_reason: null,
          total: 0,
        }
      });
    }

    const supabase = getSupabaseClient();

    // 1. Get distributor's pricing tier
    const { data: company } = await supabase
      .from('companies')
      .select('pricing_tier')
      .eq('company_id', distributor.company_id)
      .single();

    const distributorTier = company?.pricing_tier || 'tier_1';
    const discountMultiplier =
      distributorTier === 'tier_1' ? 0.60 : // 40% off = 60% of base
      distributorTier === 'tier_2' ? 0.70 : // 30% off = 70% of base
      0.80; // 20% off = 80% of base

    // 2. Fetch custom pricing overrides (if any)
    const productCodes = items.map(item => item.product_code);
    const { data: customPricing, error: customPricingError } = await supabase
      .from('company_distributor_pricing')
      .select('product_code, custom_price, currency')
      .in('product_code', productCodes)
      .eq('company_id', distributor.company_id)
      .eq('active', true);

    if (customPricingError) {
      return NextResponse.json(
        { error: 'Failed to fetch custom pricing' },
        { status: 500 }
      );
    }

    // 3. Fetch product details with base prices
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, description, image_url, price')
      .in('product_code', productCodes);

    if (productsError) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Create custom pricing map
    const customPricingMap = new Map(
      (customPricing || []).map(cp => [cp.product_code, cp])
    );

    // 4. Build line items with dynamic tier-based pricing
    const lineItems = items.map(item => {
      const product = products?.find(p => p.product_code === item.product_code);
      const customPrice = customPricingMap.get(item.product_code);

      // Priority: 1. Custom price override, 2. Dynamic tier-based price (base * multiplier)
      let unit_price = 0;
      if (customPrice?.custom_price !== undefined) {
        unit_price = customPrice.custom_price;
      } else if (product?.price !== null && product?.price !== undefined) {
        unit_price = product.price * discountMultiplier;
      }

      const line_total = unit_price * item.quantity;

      return {
        product_code: item.product_code,
        description: product?.description || '',
        quantity: item.quantity,
        unit_price,
        line_total,
        image_url: product?.image_url || null,
        currency: customPrice?.currency || 'GBP',
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);

    // 5. Fetch company details for VAT calculation
    const { data: companyDetails, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, vat_number, billing_country')
      .eq('company_id', distributor.company_id)
      .single();

    if (companyError || !companyDetails) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // 6. Determine shipping destination
    let destinationCountry = companyDetails.billing_country || 'GB';

    if (shipping_address_id) {
      const { data: shippingAddress } = await supabase
        .from('shipping_addresses')
        .select('country')
        .eq('address_id', shipping_address_id)
        .eq('company_id', distributor.company_id)
        .single();

      if (shippingAddress?.country) {
        destinationCountry = shippingAddress.country;
      }
    } else {
      // Fall back to default shipping address
      const { data: defaultAddress } = await supabase
        .from('shipping_addresses')
        .select('country')
        .eq('company_id', distributor.company_id)
        .eq('is_default', true)
        .single();

      if (defaultAddress?.country) {
        destinationCountry = defaultAddress.country;
      }
    }

    // 7. Calculate shipping cost
    const { data: shippingCost } = await supabase.rpc('calculate_shipping_cost', {
      p_country_code: destinationCountry,
      p_order_subtotal: subtotal,
    });
    const shipping = shippingCost || 0;

    // 8. Calculate VAT
    const taxableAmount = subtotal + shipping;
    let vat_amount = 0;
    let vat_rate = 0;
    let vat_exempt_reason: string | null = null;

    const countryUpper = destinationCountry.toUpperCase();

    // UK customers: 20% VAT
    if (countryUpper === 'GB' || countryUpper === 'UK') {
      vat_amount = taxableAmount * 0.20;
      vat_rate = 0.20;
    }
    // EU customers with valid VAT number: 0% (reverse charge)
    else {
      const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

      if (euCountries.includes(countryUpper)) {
        if (companyDetails.vat_number && companyDetails.vat_number.trim().length > 0) {
          vat_amount = 0;
          vat_rate = 0;
          vat_exempt_reason = 'EU Reverse Charge';
        } else {
          // EU customer without VAT number - charge UK VAT
          vat_amount = taxableAmount * 0.20;
          vat_rate = 0.20;
        }
      } else {
        // Rest of world: 0% VAT (export)
        vat_amount = 0;
        vat_rate = 0;
        vat_exempt_reason = 'Export';
      }
    }

    const total = subtotal + shipping + vat_amount;

    return NextResponse.json({
      success: true,
      preview: {
        line_items: lineItems,
        subtotal,
        shipping,
        vat_amount,
        vat_rate,
        vat_exempt_reason,
        total,
        currency: 'GBP',
      },
    });

  } catch (error) {
    console.error('[distributor/pricing-preview] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
