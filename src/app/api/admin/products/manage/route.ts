/**
 * POST /api/admin/products/manage
 * Create, update, or delete products
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, product_code, product_data } = body;

    if (!action || !['create', 'update', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action is required (create, update, delete)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Handle DELETE
    if (action === 'delete') {
      if (!product_code) {
        return NextResponse.json(
          { error: 'product_code is required for delete' },
          { status: 400 }
        );
      }

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('product_code', product_code);

      if (deleteError) {
        console.error('[products/manage] Delete error:', deleteError);
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }

      console.log('[products/manage] Deleted product:', product_code);

      return NextResponse.json({
        success: true,
        action: 'deleted',
      });
    }

    // Validate product_data for create/update
    if (!product_data) {
      return NextResponse.json(
        { error: 'product_data is required for create/update' },
        { status: 400 }
      );
    }

    // Handle UPDATE
    if (action === 'update') {
      if (!product_code) {
        return NextResponse.json(
          { error: 'product_code is required for update' },
          { status: 400 }
        );
      }

      const { data: product, error: updateError } = await supabase
        .from('products')
        .update(product_data)
        .eq('product_code', product_code)
        .select()
        .single();

      if (updateError) {
        console.error('[products/manage] Update error:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      console.log('[products/manage] Updated product:', product_code);

      return NextResponse.json({
        success: true,
        action: 'updated',
        product,
      });
    }

    // Handle CREATE
    if (!product_data.product_code) {
      return NextResponse.json(
        { error: 'product_code is required in product_data for create' },
        { status: 400 }
      );
    }

    const { data: product, error: createError } = await supabase
      .from('products')
      .insert(product_data)
      .select()
      .single();

    if (createError) {
      console.error('[products/manage] Create error:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    console.log('[products/manage] Created product:', product_data.product_code);

    return NextResponse.json({
      success: true,
      action: 'created',
      product,
    });
  } catch (error) {
    console.error('[products/manage] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
