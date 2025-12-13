/**
 * GET /api/admin/products/[product_code]
 * Get a single product by product code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { product_code: string } }
) {
  const supabase = getSupabaseClient();
  const productCode = params.product_code;

  const { data, error } = await supabase
    .from('products')
    .select('product_code, description, price, currency, category, type, active')
    .eq('product_code', productCode)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
