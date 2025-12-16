/**
 * GET /api/admin/products/search?q=searchterm
 * Search products by code or description
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const supabase = getSupabaseClient();

  // Search by product_code OR description
  const { data, error } = await supabase
    .from('products')
    .select('product_code, description, price, currency, type')
    .or(`product_code.ilike.*${query}*,description.ilike.*${query}*`)
    .eq('active', true)
    .limit(10);

  if (error) {
    console.error('[API] Product search error:', error);
    return NextResponse.json({ products: [] });
  }

  return NextResponse.json({ products: data || [] });
}
