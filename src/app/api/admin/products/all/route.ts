/**
 * GET /api/admin/products/all
 * Fetch all products for selection
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: products, error } = await supabase
      .from('products')
      .select('product_code, description, price, rental_price_monthly, currency, type, category, image_url')
      .eq('active', true)
      .order('type')
      .order('product_code');

    if (error) {
      console.error('[products/all] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (err) {
    console.error('[products/all] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
