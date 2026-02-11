/**
 * POST /api/portal/pricing-preview
 * Preview tiered pricing for cart items in reorder portal
 * Uses HMAC token for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCompanyQueryField } from '@/lib/tokens';
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

    // Separate items by product type for different pricing logic
    const toolItems = items.filter(item => {
      const product = products.find(p => p.product_code === item.product_code);
      return product?.type === 'tool';
    });

    const consumableItems = items.filter(item => {
      const product = products.find(p => p.product_code === item.product_code);
      return product?.type === 'consumable';
    });

    const otherItems = items.filter(item => {
      const product = products.find(p => p.product_code === item.product_code);
      return product?.type !== 'tool' && product?.type !== 'consumable';
    });

    // 2. Fetch company details for tax calculation (with backward compatibility for old TEXT company_id values)
    const companyQuery = getCompanyQueryField(company_id);
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, country, vat_number, billing_country')
      .eq(companyQuery.column, companyQuery.value)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // 3. Fetch shipping address to determine destination (using UUID company_id)
    const { data: shippingAddress } = await supabase
      .from('shipping_addresses')
      .select('country')
      .eq('company_id', company.company_id)
      .eq('is_default', true)
      .single();

    const destinationCountry = shippingAddress?.country || company.country || 'GB';

    // 4. Calculate pricing by product type
    let lineItems: any[] = [];
    let validation_errors: string[] = [];

    // TOOLS: Apply quantity-based discount tiers from database
    const totalToolQuantity = toolItems.reduce((sum, item) => sum + item.quantity, 0);
    let toolDiscountPercent = 0;
    let toolDiscountLabel = '';

    if (totalToolQuantity > 0) {
      // Query tool_pricing_ladder for discount based on total tool quantity
      const { data: toolTier } = await supabase
        .from('tool_pricing_ladder')
        .select('discount_pct, min_qty, max_qty')
        .lte('min_qty', totalToolQuantity)
        .gte('max_qty', totalToolQuantity)
        .eq('active', true)
        .single();

      if (toolTier) {
        toolDiscountPercent = parseFloat(toolTier.discount_pct);
        if (toolTier.max_qty === 999) {
          toolDiscountLabel = `${toolTier.min_qty}+ tools - ${toolDiscountPercent}% off`;
        } else if (toolTier.min_qty === toolTier.max_qty) {
          toolDiscountLabel = `${toolTier.min_qty} tool${toolTier.min_qty > 1 ? 's' : ''} - ${toolDiscountPercent}% off`;
        } else {
          toolDiscountLabel = `${toolTier.min_qty}-${toolTier.max_qty} tools - ${toolDiscountPercent}% off`;
        }
      }
    }

    for (const item of toolItems) {
      const product = products.find(p => p.product_code === item.product_code);
      if (!product) continue;

      const base_price = product.price || 0;
      const unit_price = base_price * (1 - toolDiscountPercent / 100);
      const line_total = unit_price * item.quantity;

      lineItems.push({
        product_code: item.product_code,
        description: product.description || '',
        quantity: item.quantity,
        base_price,
        unit_price,
        line_total,
        discount_applied: toolDiscountPercent > 0 ? toolDiscountLabel : null,
        image_url: product.image_url || null,
        currency: product.currency || 'GBP',
      });
    }

    // CONSUMABLES: Apply tiered pricing via pricing-v2
    if (consumableItems.length > 0) {
      const cartItems: CartItem[] = consumableItems.map(item => {
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
      validation_errors = pricingResult.validation_errors;

      for (const pricedItem of pricingResult.items) {
        const product = products.find(p => p.product_code === pricedItem.product_code);
        lineItems.push({
          product_code: pricedItem.product_code,
          description: product?.description || '',
          quantity: pricedItem.quantity,
          base_price: pricedItem.base_price,
          unit_price: pricedItem.unit_price,
          line_total: pricedItem.line_total,
          discount_applied: pricedItem.discount_applied,
          image_url: product?.image_url || null,
          currency: product?.currency || 'GBP',
        });
      }
    }

    // OTHER PRODUCTS: Fixed price, no discounts
    for (const item of otherItems) {
      const product = products.find(p => p.product_code === item.product_code);
      if (!product) continue;

      const unit_price = product.price || 0;
      const line_total = unit_price * item.quantity;

      lineItems.push({
        product_code: item.product_code,
        description: product.description || '',
        quantity: item.quantity,
        base_price: unit_price,
        unit_price,
        line_total,
        discount_applied: null,
        image_url: product.image_url || null,
        currency: product.currency || 'GBP',
      });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);

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
