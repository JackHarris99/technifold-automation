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
    const { token, items } = body as { token: string; items: CartItemInput[] };

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

    // 2. Build cart items for pricing calculation
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

    // 3. Calculate tiered pricing
    const { items: pricedItems, validation_errors } = await calculateCartPricing(cartItems);

    // 4. Build enriched line items with product details
    const lineItems = pricedItems.map(item => {
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

    const subtotal = pricedItems.reduce((sum, item) => sum + item.line_total, 0);

    // 5. Calculate savings
    const totalSavings = lineItems.reduce((sum, item) => {
      return sum + ((item.base_price - item.unit_price) * item.quantity);
    }, 0);

    return NextResponse.json({
      success: true,
      preview: {
        line_items: lineItems,
        subtotal,
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
