/**
 * POST /api/portal/pricing-preview
 * Preview tiered pricing for cart items in reorder portal
 * Uses HMAC token for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { calculateCartPricing, CartItem } from '@/lib/pricing-v2';

interface CartItemInput {
  product_code: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, items, skip_tiered_pricing } = body as { token: string; items: CartItemInput[]; skip_tiered_pricing?: boolean };

    // Verify HMAC token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        preview: {
          line_items: [],
          subtotal: 0,
          total_savings: 0,
        }
      });
    }

    const supabase = getSupabaseClient();
    const company_id = payload.company_id;

    // 1. Fetch product details (including pricing_tier)
    const productCodes = items.map(item => item.product_code);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, description, price, category, type, pricing_tier, image_url, currency')
      .in('product_code', productCodes);

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Check if all products are tools (type='tool') - if so, skip tiered pricing
    const allTools = products.every(p => p.type === 'tool');
    const shouldSkipTieredPricing = skip_tiered_pricing || allTools;

    // 2. Fetch company details for tax calculation
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, country, vat_number, billing_country')
      .eq('company_id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // 3. Fetch shipping address to determine destination
    const { data: shippingAddress } = await supabase
      .from('shipping_addresses')
      .select('country')
      .eq('company_id', company_id)
      .eq('is_default', true)
      .single();

    const destinationCountry = shippingAddress?.country || company.country || 'GB';

    // 4. Calculate pricing - SKIP tiered pricing for tools
    let lineItems;
    let subtotal;
    let validation_errors: string[] = [];

    if (shouldSkipTieredPricing) {
      // For TOOLS: Use base price directly, no tiered pricing
      lineItems = items.map(item => {
        const product = products.find(p => p.product_code === item.product_code);
        if (!product) {
          throw new Error(`Product not found: ${item.product_code}`);
        }

        const base_price = product.price || 0;
        const unit_price = base_price; // No discount for tools
        const line_total = unit_price * item.quantity;

        return {
          product_code: item.product_code,
          description: product.description || '',
          quantity: item.quantity,
          base_price,
          unit_price,
          line_total,
          discount_applied: null,
          image_url: product.image_url || null,
          currency: product.currency || 'GBP',
        };
      });

      subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
    } else {
      // For CONSUMABLES: Apply tiered pricing
      const cartItems: CartItem[] = items.map(item => {
        const product = products.find(p => p.product_code === item.product_code);
        if (!product) {
          throw new Error(`Product not found: ${item.product_code}`);
        }

        return {
          product_code: item.product_code,
          quantity: item.quantity,
          category: product.category || '',
          base_price: product.price || 0,
          type: product.type,
          pricing_tier: product.pricing_tier,
        };
      });

      const pricingResult = await calculateCartPricing(cartItems);
      const pricedItems = pricingResult.items;
      validation_errors = pricingResult.validation_errors;

      lineItems = pricedItems.map(item => {
        const product = products.find(p => p.product_code === item.product_code);
        return {
          product_code: item.product_code,
          description: product?.description || '',
          quantity: item.quantity,
          base_price: item.base_price,
          unit_price: item.unit_price,
          line_total: item.line_total,
          discount_applied: item.discount_applied,
          image_url: product?.image_url || null,
          currency: product?.currency || 'GBP',
        };
      });

      subtotal = pricedItems.reduce((sum, item) => sum + item.line_total, 0);
    }

    // 7. Calculate shipping cost
    const { data: shippingCost } = await supabase.rpc('calculate_shipping_cost', {
      p_country_code: destinationCountry,
      p_order_subtotal: subtotal,
    });
    const shipping = shippingCost || 0;

    // 8. Calculate VAT (same logic as admin invoice preview)
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
        if (company.vat_number && company.vat_number.trim().length > 0) {
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

    // 9. Calculate savings
    const totalSavings = lineItems.reduce((sum, item) => {
      return sum + ((item.base_price - item.unit_price) * item.quantity);
    }, 0);

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
        total_savings: totalSavings,
        currency: 'GBP',
        validation_errors,
      },
    });

  } catch (error) {
    console.error('[portal/pricing-preview] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
