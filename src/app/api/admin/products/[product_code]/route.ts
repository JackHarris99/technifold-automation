/**
 * GET /api/admin/products/[product_code]
 * Get a single product by product code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ product_code: string }> }
) {
  const { product_code: productCode } = await context.params;
  console.log('[API] Looking up product:', productCode);

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('product_code, description, price, currency, category, type, active')
    .eq('product_code', productCode)
    .single();

  if (error || !data) {
    console.log('[API] Product not found:', productCode, error);
    return NextResponse.json(
      { error: 'Product not found', details: error?.message },
      { status: 404 }
    );
  }

  console.log('[API] Product found:', data);
  return NextResponse.json(data);
}
