/**
 * POST /api/admin/custom-portal-products - Add product to customer portal
 * DELETE /api/admin/custom-portal-products - Remove product from customer portal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id, product_code } = await request.json();

    if (!company_id || !product_code) {
      return NextResponse.json(
        { error: 'company_id and product_code required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify product exists and is active
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('product_code, description')
      .eq('product_code', product_code)
      .eq('active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Add to custom portal products (ignore duplicates)
    const { error: insertError } = await supabase
      .from('custom_portal_products')
      .insert({
        company_id,
        product_code,
        added_by_user_id: currentUser.user_id,
      });

    if (insertError) {
      // Check if it's a duplicate key error
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Product already added to portal' },
          { status: 400 }
        );
      }
      console.error('[Custom Portal Products] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to add product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${product.description} added to customer portal`,
    });
  } catch (error: any) {
    console.error('[Custom Portal Products POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const product_code = searchParams.get('product_code');

    if (!company_id || !product_code) {
      return NextResponse.json(
        { error: 'company_id and product_code required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error: deleteError } = await supabase
      .from('custom_portal_products')
      .delete()
      .eq('company_id', company_id)
      .eq('product_code', product_code);

    if (deleteError) {
      console.error('[Custom Portal Products] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product removed from customer portal',
    });
  } catch (error: any) {
    console.error('[Custom Portal Products DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
