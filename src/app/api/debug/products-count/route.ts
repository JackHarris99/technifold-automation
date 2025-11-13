/**
 * Debug endpoint to check product counts
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Count total products
    const { count: total } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Count active products
    const { count: active } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Get type breakdown
    const { data: byType } = await supabase
      .from('products')
      .select('type')
      .eq('active', true);

    const typeCounts: Record<string, number> = {};
    (byType || []).forEach((p: any) => {
      const type = p.type || 'null';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Test actual API query
    const { data: apiProducts, error: apiError } = await supabase
      .from('products')
      .select('product_code, description, price, rental_price_monthly, currency, type, category, image_url')
      .eq('active', true)
      .order('type')
      .order('product_code')
      .range(0, 9999);

    return NextResponse.json({
      total_products: total,
      active_products: active,
      products_by_type: typeCounts,
      api_query_returned: apiProducts?.length || 0,
      api_query_error: apiError,
      sample_products: apiProducts?.slice(0, 5).map((p: any) => ({
        code: p.product_code,
        type: p.type,
        description: p.description?.substring(0, 50)
      }))
    });
  } catch (err) {
    console.error('[debug/products-count] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
