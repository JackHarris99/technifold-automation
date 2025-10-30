/**
 * GET /api/admin/products?limit=N
 * Get products list
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('product_code, product_name, description, price')
      .order('product_code')
      .limit(limit);

    if (error) {
      console.error('[admin/products] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (err) {
    console.error('[admin/products] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
