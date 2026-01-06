/**
 * GET /api/admin/products/search?q=searchterm&types=tool,consumable
 * Search products by code or description with optional type filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const typesParam = searchParams.get('types');

  if (!query || query.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const supabase = getSupabaseClient();

  // Build query with optional type filter
  let dbQuery = supabase
    .from('products')
    .select('product_code, description, price, currency, type, category, image_url')
    .or(`product_code.ilike.*${query}*,description.ilike.*${query}*`)
    .eq('active', true);

  // Filter by types if provided
  if (typesParam) {
    const types = typesParam.split(',').map(t => t.trim());
    dbQuery = dbQuery.in('type', types);
  }

  const { data, error } = await dbQuery.limit(10);

  if (error) {
    console.error('[API] Product search error:', error);
    return NextResponse.json({ products: [] });
  }

  return NextResponse.json({ products: data || [] });
}
