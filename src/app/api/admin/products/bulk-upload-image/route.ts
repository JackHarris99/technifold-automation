/**
 * POST /api/admin/products/bulk-upload-image
 * Get list of product codes that need images for a category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, category } = body;

    if (!type || !category) {
      return NextResponse.json(
        { error: 'type and category are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get all products in this category without images
    const { data: products, error } = await supabase
      .from('products')
      .select('product_code')
      .eq('type', type)
      .eq('category', category === 'Uncategorized' ? null : category)
      .is('image_url', null);

    if (error) {
      console.error('[bulk-upload-image] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const productCodes = products?.map(p => p.product_code) || [];

    return NextResponse.json({
      success: true,
      product_codes: productCodes,
      count: productCodes.length
    });
  } catch (error) {
    console.error('[bulk-upload-image] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
