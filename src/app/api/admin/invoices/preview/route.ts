/**
 * POST /api/admin/invoices/preview
 * Preview invoice with tiered pricing, tax, and shipping calculations
 * Does NOT create invoice - just returns what it would look like
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { getSupabaseClient } from '@/lib/supabase';
import { calculateCartPricing, CartItem } from '@/lib/pricing-v2';

interface InvoiceItem {
  product_code: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authError = verifyAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { company_id, items } = body as { company_id: string; items: InvoiceItem[] };

    if (!company_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'company_id and items are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Fetch product details (including pricing_tier and image_url)
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

    // 2. Fetch company details (for tax and shipping calculation)
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

    // 4. Build cart items for pricing calculation
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

    // 5. Calculate tiered pricing
    const { items: pricedItems, validation_errors } = await calculateCartPricing(cartItems);

    // 6. Build enriched line items with product details
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

    // 7. Calculate shipping cost
    const { data: shippingCost } = await supabase.rpc('calculate_shipping_cost', {
      p_country_code: destinationCountry,
      p_order_subtotal: subtotal,
    });
    const shipping = shippingCost || 0;

    // 8. Calculate VAT (using same logic as stripe-invoices.ts)
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
        company: {
          company_id: company.company_id,
          company_name: company.company_name,
          country: company.country,
          vat_number: company.vat_number,
          destination_country: destinationCountry,
        },
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
    console.error('[admin/invoices/preview] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
