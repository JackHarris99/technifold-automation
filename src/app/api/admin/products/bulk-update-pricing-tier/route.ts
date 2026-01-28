/**
 * POST /api/admin/products/bulk-update-pricing-tier
 * Update pricing_tier for multiple products at once
 * All admin users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_codes, pricing_tier } = body;

    if (!product_codes || !Array.isArray(product_codes) || product_codes.length === 0) {
      return NextResponse.json(
        { error: 'product_codes array required' },
        { status: 400 }
      );
    }

    // Validate pricing_tier value
    if (pricing_tier !== null && pricing_tier !== 'standard' && pricing_tier !== 'premium') {
      return NextResponse.json(
        { error: 'pricing_tier must be null, "standard", or "premium"' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update all products in one query
    const { data, error } = await supabase
      .from('products')
      .update({ pricing_tier })
      .in('product_code', product_codes)
      .select('product_code');

    if (error) {
      console.error('[bulk-update-pricing-tier] Error:', error);
      return NextResponse.json(
        { error: 'Failed to update products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated_count: data?.length || 0,
      message: `Updated ${data?.length || 0} product(s)`,
    });

  } catch (err: any) {
    console.error('[bulk-update-pricing-tier] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
