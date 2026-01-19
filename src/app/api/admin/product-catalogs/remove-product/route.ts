/**
 * POST /api/admin/product-catalogs/remove-product
 * Remove a product from company catalog (and delete custom pricing)
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company_id, product_code } = body;

    if (!company_id || !product_code) {
      return NextResponse.json(
        { error: 'company_id and product_code required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Remove from catalog
    const { error: catalogError } = await supabase
      .from('company_product_catalog')
      .delete()
      .eq('company_id', company_id)
      .eq('product_code', product_code);

    if (catalogError) {
      console.error('[remove-product] Catalog error:', catalogError);
      return NextResponse.json(
        { error: 'Failed to remove product from catalog' },
        { status: 500 }
      );
    }

    // Also remove custom pricing if it exists
    await supabase
      .from('company_distributor_pricing')
      .delete()
      .eq('company_id', company_id)
      .eq('product_code', product_code);

    return NextResponse.json({
      success: true,
      message: 'Product removed from catalog',
    });

  } catch (err: any) {
    console.error('[remove-product] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
