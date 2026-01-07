/**
 * POST /api/portal/quote-pricing-interactive
 * Interactive quote pricing - recalculates prices based on product type:
 * - TOOLS: Quantity-based discounts (1=0%, 2=10%, 3=20%, 4=30%, 5+=40%)
 * - CONSUMABLES: Tiered pricing via pricing-v2
 * - OTHER: Fixed price from products table
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
    const { token, items } = body as { token: string; items: CartItemInput[] };

    // Verify HMAC token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const quote_id = payload.quote_id;
    const company_id = payload.company_id;

    if (!quote_id) {
      return NextResponse.json(
        { error: 'Invalid token: missing quote_id' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        preview: {
          line_items: [],
          subtotal: 0,
          vat_amount: 0,
          shipping_amount: 0,
          total: 0,
        }
      });
    }

    const supabase = getSupabaseClient();

    // Fetch quote details to verify it's an interactive quote
    const { data: quote } = await supabase
      .from('quotes')
      .select('quote_type, pricing_mode')
      .eq('quote_id', quote_id)
      .single();

    if (!quote || quote.quote_type !== 'interactive') {
      return NextResponse.json(
        { error: 'This endpoint is only for interactive quotes' },
        { status: 400 }
      );
    }

    // Fetch product details from quote items (for description, images, etc)
    const productCodes = items.map(item => item.product_code);
    const { data: quoteItems } = await supabase
      .from('quote_items')
      .select('product_code, description, image_url, product_type, category')
      .eq('quote_id', quote_id)
      .in('product_code', productCodes);

    // Fetch current product pricing from products table (for base_price and pricing_tier)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, price, pricing_tier, category, type')
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

    const lineItems = [];

    // TOOLS: Apply quantity-based discount tiers
    // 1 tool = 0%, 2 = 10%, 3 = 20%, 4 = 30%, 5+ = 40% off
    const totalToolQuantity = toolItems.reduce((sum, item) => sum + item.quantity, 0);
    let toolDiscountPercent = 0;
    let toolDiscountLabel = '';

    if (totalToolQuantity >= 5) {
      toolDiscountPercent = 40;
      toolDiscountLabel = '5+ tools - 40% off';
    } else if (totalToolQuantity === 4) {
      toolDiscountPercent = 30;
      toolDiscountLabel = '4 tools - 30% off';
    } else if (totalToolQuantity === 3) {
      toolDiscountPercent = 20;
      toolDiscountLabel = '3 tools - 20% off';
    } else if (totalToolQuantity === 2) {
      toolDiscountPercent = 10;
      toolDiscountLabel = '2 tools - 10% off';
    }

    for (const item of toolItems) {
      const product = products.find(p => p.product_code === item.product_code);
      const quoteItem = quoteItems?.find(qi => qi.product_code === item.product_code);

      if (!product) continue;

      const base_price = product.price || 0;
      const unit_price = base_price * (1 - toolDiscountPercent / 100);
      const line_total = unit_price * item.quantity;

      lineItems.push({
        product_code: item.product_code,
        description: quoteItem?.description || product.product_code,
        quantity: item.quantity,
        base_price,
        unit_price,
        line_total,
        discount_applied: toolDiscountPercent > 0 ? toolDiscountLabel : null,
        image_url: quoteItem?.image_url || null,
        currency: 'GBP',
      });
    }

    // CONSUMABLES: Apply tiered pricing via pricing-v2
    if (consumableItems.length > 0) {
      const cartItems: CartItem[] = consumableItems.map(item => {
        const product = products.find(p => p.product_code === item.product_code);
        return {
          product_code: item.product_code,
          quantity: item.quantity,
          category: product?.category || '',
          base_price: product?.price || 0,
          type: product?.type || 'consumable',
          pricing_tier: product?.pricing_tier,
        };
      });

      const pricingResult = await calculateCartPricing(cartItems);

      for (const pricedItem of pricingResult.items) {
        const quoteItem = quoteItems?.find(qi => qi.product_code === pricedItem.product_code);
        lineItems.push({
          product_code: pricedItem.product_code,
          description: quoteItem?.description || pricedItem.product_code,
          quantity: pricedItem.quantity,
          base_price: pricedItem.base_price,
          unit_price: pricedItem.unit_price,
          line_total: pricedItem.line_total,
          discount_applied: pricedItem.discount_applied,
          image_url: quoteItem?.image_url || null,
          currency: 'GBP',
        });
      }
    }

    // OTHER PRODUCTS: Fixed price, no discounts
    for (const item of otherItems) {
      const product = products.find(p => p.product_code === item.product_code);
      const quoteItem = quoteItems?.find(qi => qi.product_code === item.product_code);

      if (!product) continue;

      const unit_price = product.price || 0;
      const line_total = unit_price * item.quantity;

      lineItems.push({
        product_code: item.product_code,
        description: quoteItem?.description || product.product_code,
        quantity: item.quantity,
        base_price: unit_price,
        unit_price,
        line_total,
        discount_applied: null,
        image_url: quoteItem?.image_url || null,
        currency: 'GBP',
      });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);

    // Fetch company shipping address to determine VAT
    const { data: company } = await supabase
      .from('companies')
      .select('company_id, country')
      .eq('company_id', company_id)
      .single();

    // Get default shipping address
    const { data: defaultAddress } = await supabase
      .from('shipping_addresses')
      .select('country')
      .eq('company_id', company_id)
      .eq('is_default', true)
      .single();

    const country = (defaultAddress?.country || company?.country || 'GB').toUpperCase();

    // Calculate VAT (20% for UK, 0% for exports/reverse charge)
    let vat_amount = 0;
    let vat_rate = 0;

    if (country === 'GB' || country === 'UK') {
      vat_rate = 0.20;
      vat_amount = subtotal * vat_rate;
    }

    // Calculate shipping
    const { data: shippingRate } = await supabase
      .from('shipping_rates')
      .select('rate_gbp, free_shipping_threshold')
      .eq('country_code', country)
      .eq('active', true)
      .single();

    let shipping_amount = 0;
    const freeShippingThreshold = shippingRate?.free_shipping_threshold || 500;

    if (subtotal < freeShippingThreshold) {
      shipping_amount = shippingRate?.rate_gbp || 15;
    }

    const total = subtotal + vat_amount + shipping_amount;

    return NextResponse.json({
      success: true,
      preview: {
        line_items: lineItems,
        subtotal,
        vat_amount,
        vat_rate,
        shipping_amount,
        total,
        total_savings: lineItems.reduce((sum, item) => {
          const savings = (item.base_price - item.unit_price) * item.quantity;
          return sum + Math.max(0, savings);
        }, 0),
        currency: 'GBP',
      }
    });
  } catch (error) {
    console.error('[quote-pricing-interactive] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}
