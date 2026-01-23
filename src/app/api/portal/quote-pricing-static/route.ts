/**
 * POST /api/portal/quote-pricing-static
 * Static quote pricing - uses stored unit_price from quote_items, only calculates VAT/shipping
 * NO tiered pricing recalculation - prices are locked at quoted amounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCompanyQueryField } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

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

    // Fetch quote details to verify it's a static quote
    const { data: quote } = await supabase
      .from('quotes')
      .select('quote_type, free_shipping')
      .eq('quote_id', quote_id)
      .single();

    if (!quote || quote.quote_type !== 'static') {
      return NextResponse.json(
        { error: 'This endpoint is only for static quotes' },
        { status: 400 }
      );
    }

    // Fetch stored quote items with their LOCKED unit prices
    const productCodes = items.map(item => item.product_code);
    const { data: quoteItems, error: itemsError } = await supabase
      .from('quote_items')
      .select('product_code, description, unit_price, image_url, product_type, category')
      .eq('quote_id', quote_id)
      .in('product_code', productCodes);

    if (itemsError || !quoteItems) {
      return NextResponse.json(
        { error: 'Failed to fetch quote items' },
        { status: 500 }
      );
    }

    // Build line items using STORED unit_price (no recalculation)
    const lineItems = items.map(item => {
      const quoteItem = quoteItems.find(qi => qi.product_code === item.product_code);

      if (!quoteItem) {
        throw new Error(`Product ${item.product_code} not found in quote`);
      }

      const unit_price = quoteItem.unit_price; // LOCKED price from quote
      const line_total = unit_price * item.quantity;

      return {
        product_code: item.product_code,
        description: quoteItem.description,
        quantity: item.quantity,
        unit_price, // STATIC - never changes
        line_total,
        discount_applied: null, // No discounts on static quotes
        image_url: quoteItem.image_url,
        currency: 'GBP',
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);

    // Fetch company shipping address to determine VAT (with backward compatibility for old TEXT company_id values)
    const companyQuery = getCompanyQueryField(company_id);
    const { data: company } = await supabase
      .from('companies')
      .select('company_id, country')
      .eq(companyQuery.column, companyQuery.value)
      .single();

    // Get default shipping address (using UUID company_id)
    const { data: defaultAddress } = await supabase
      .from('shipping_addresses')
      .select('country')
      .eq('company_id', company?.company_id || company_id)
      .eq('is_default', true)
      .single();

    const country = (defaultAddress?.country || company?.country || 'GB').toUpperCase();

    // Calculate shipping first (check free_shipping override)
    let shipping_amount = 0;

    if (quote.free_shipping) {
      // Sales rep has enabled free shipping for this quote
      shipping_amount = 0;
    } else {
      const { data: shippingRate } = await supabase
        .from('shipping_rates')
        .select('rate_gbp, free_shipping_threshold')
        .eq('country_code', country)
        .eq('active', true)
        .single();

      const freeShippingThreshold = shippingRate?.free_shipping_threshold || 500;

      if (subtotal < freeShippingThreshold) {
        shipping_amount = shippingRate?.rate_gbp || 15; // Default £15 if no rate found
      }
    }

    // Calculate VAT on subtotal + shipping (20% for UK, 0% for exports/reverse charge)
    let vat_amount = 0;
    let vat_rate = 0;

    if (country === 'GB' || country === 'UK') {
      vat_rate = 0.20;
      vat_amount = (subtotal + shipping_amount) * vat_rate;
    }
    // For EU/international, VAT is 0 (reverse charge or export)

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
        currency: 'GBP',
      }
    });
  } catch (error) {
    console.error('[quote-pricing-static] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}
