/**
 * GET /api/admin/products/all
 * Fetch all products for selection
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Fetch ALL products - must fetch in batches or use count + pagination
    // Supabase has a hard 1000 row limit even with .range()
    // Solution: Fetch in multiple batches

    let allProducts: any[] = [];
    let start = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('products')
        .select('product_code, description, price, rental_price_monthly, currency, type, category, image_url')
        .eq('active', true)
        .order('type')
        .order('product_code')
        .range(start, start + batchSize - 1);

      if (error) {
        console.error('[products/all] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
      }

      if (batch && batch.length > 0) {
        allProducts = allProducts.concat(batch);
        start += batchSize;
        hasMore = batch.length === batchSize; // If we got less than batch size, we're done
      } else {
        hasMore = false;
      }
    }

    console.log(`[products/all] Fetched ${allProducts.length} total products`);
    return NextResponse.json({ products: allProducts });
  } catch (err) {
    console.error('[products/all] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
