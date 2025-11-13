/**
 * GET /api/admin/products/search
 * Search products by code or description
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    const supabase = getSupabaseClient();

    // Search by product_code or description
    const { data: products, error } = await supabase
      .from('products')
      .select('product_code, description, price, rental_price_monthly, currency, type, category, image_url')
      .or(`product_code.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('active', true)
      .limit(50);

    if (error) {
      console.error('[products/search] Error:', error);
      return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (err) {
    console.error('[products/search] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
