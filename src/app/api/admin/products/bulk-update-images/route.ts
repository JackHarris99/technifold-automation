/**
 * POST /api/admin/products/bulk-update-images
 * Bulk update image_url for multiple products
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_codes, image_url } = body;

    if (!product_codes || !Array.isArray(product_codes) || product_codes.length === 0) {
      return NextResponse.json(
        { error: 'product_codes array is required' },
        { status: 400 }
      );
    }

    if (!image_url) {
      return NextResponse.json(
        { error: 'image_url is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update all products with the provided image URL
    const { data, error } = await supabase
      .from('products')
      .update({ image_url })
      .in('product_code', product_codes)
      .select('product_code');

    if (error) {
      console.error('[bulk-update-images] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated_count: data?.length || 0,
      product_codes: data?.map(p => p.product_code) || []
    });
  } catch (error) {
    console.error('[bulk-update-images] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
