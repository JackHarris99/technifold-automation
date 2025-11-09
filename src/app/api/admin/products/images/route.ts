/**
 * POST /api/admin/products/images
 * Fetch product images for given product codes
 * Returns image URLs from products table or Supabase storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { product_codes } = await request.json();

    if (!product_codes || !Array.isArray(product_codes) || product_codes.length === 0) {
      return NextResponse.json({ error: 'product_codes array required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch products with image_url column (same as reorder portal)
    const { data: products, error } = await supabase
      .from('products')
      .select('product_code, image_url')
      .in('product_code', product_codes);

    if (error) {
      console.error('[admin/products/images] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Return products with image_url directly
    const productsWithImages = (products || []).map(p => ({
      product_code: p.product_code,
      image_url: p.image_url || null
    }));

    return NextResponse.json({ products: productsWithImages });
  } catch (err) {
    console.error('[admin/products/images] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
