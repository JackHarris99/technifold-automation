/**
 * GET /api/setup-guide
 * Returns SKUs for setup guide
 * ?curated_skus=SKU1,SKU2 (use curated list)
 * ?machine_id=X&solution_id=Y (fallback to all compatible)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const curatedSkusParam = searchParams.get('curated_skus');
    const machineId = searchParams.get('machine_id');
    const solutionId = searchParams.get('solution_id');

    const supabase = getSupabaseClient();

    let skuCodes: string[] = [];

    // Option 1: Use curated SKUs if provided
    if (curatedSkusParam) {
      skuCodes = curatedSkusParam.split(',').map(s => s.trim()).filter(Boolean);
    }
    // Option 2: Fallback to all compatible SKUs for this machine/solution
    else if (machineId && solutionId) {
      // Query tool_consumable_map or similar
      // For now, just return empty - you can wire this up to your mapping table
      console.log('[setup-guide] Fallback query needed for machine/solution:', machineId, solutionId);
      skuCodes = [];
    }

    if (skuCodes.length === 0) {
      return NextResponse.json({ skus: [] });
    }

    // Fetch product details
    const { data: products, error } = await supabase
      .from('products')
      .select('product_code, description, price, image_url')
      .in('product_code', skuCodes);

    if (error) {
      console.error('[setup-guide] Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Format response
    const skus = (products || []).map(p => ({
      code: p.product_code,
      name: p.description,
      description: p.description,
      price: p.price,
      image_url: p.image_url
    }));

    // Sort by original curated_skus order
    if (curatedSkusParam) {
      skus.sort((a, b) => {
        const aIndex = skuCodes.indexOf(a.code);
        const bIndex = skuCodes.indexOf(b.code);
        return aIndex - bIndex;
      });
    }

    return NextResponse.json({ skus });
  } catch (err) {
    console.error('[setup-guide] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
