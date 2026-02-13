/**
 * POST /api/admin/products/get-pricing-tiers
 * Get current pricing_tier for a list of product codes
 * Used to refresh stale tier data when editing quotes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { product_codes } = await request.json();

    if (!product_codes || !Array.isArray(product_codes)) {
      return NextResponse.json(
        { error: 'product_codes array required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('product_code, pricing_tier')
      .in('product_code', product_codes);

    if (error) {
      console.error('[API] Error fetching pricing tiers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pricing tiers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pricing_tiers: data || [],
    });
  } catch (error: any) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
