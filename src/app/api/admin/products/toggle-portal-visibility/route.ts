/**
 * POST /api/admin/products/toggle-portal-visibility
 * Toggle show_in_distributor_portal for products
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only directors can update product visibility
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { product_codes, visible } = body as {
      product_codes: string[];
      visible: boolean;
    };

    if (!product_codes || !Array.isArray(product_codes) || product_codes.length === 0) {
      return NextResponse.json(
        { error: 'product_codes array required' },
        { status: 400 }
      );
    }

    if (typeof visible !== 'boolean') {
      return NextResponse.json(
        { error: 'visible (boolean) required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error: updateError } = await supabase
      .from('products')
      .update({ show_in_distributor_portal: visible })
      .in('product_code', product_codes);

    if (updateError) {
      console.error('[toggle-portal-visibility] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update products', details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`[toggle-portal-visibility] Set ${product_codes.length} products to visible=${visible}`);

    return NextResponse.json({
      success: true,
      message: `Updated ${product_codes.length} products`,
      updated: product_codes.length,
    });

  } catch (err: any) {
    console.error('[toggle-portal-visibility] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
