/**
 * POST /api/admin/products/bulk-update-attributes
 * Update attributes for multiple products at once
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_codes, attributes } = body;

    // Validate inputs
    if (!product_codes || !Array.isArray(product_codes) || product_codes.length === 0) {
      return NextResponse.json(
        { error: 'product_codes array is required' },
        { status: 400 }
      );
    }

    if (!attributes || typeof attributes !== 'object') {
      return NextResponse.json(
        { error: 'attributes object is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update each product
    const results = [];
    const errors = [];

    for (const productCode of product_codes) {
      try {
        // Get current extra data
        const { data: product } = await supabase
          .from('products')
          .select('extra')
          .eq('product_code', productCode)
          .single();

        if (!product) {
          errors.push({ product_code: productCode, error: 'Product not found' });
          continue;
        }

        // Merge new attributes with existing
        const currentExtra = product.extra || {};
        const updatedExtra = { ...currentExtra, ...attributes };

        // Update product
        const { error: updateError } = await supabase
          .from('products')
          .update({ extra: updatedExtra })
          .eq('product_code', productCode);

        if (updateError) {
          errors.push({ product_code: productCode, error: updateError.message });
        } else {
          results.push(productCode);
        }
      } catch (err: any) {
        errors.push({ product_code: productCode, error: err.message });
      }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.user_id,
      user_email: user.email,
      user_name: user.full_name,
      action_type: 'bulk_attribute_update',
      entity_type: 'product',
      entity_id: product_codes.join(','),
      description: `Bulk updated attributes for ${results.length} products: ${Object.keys(attributes).join(', ')}`,
    });

    console.log(
      `[bulk-update-attributes] Updated ${results.length} products by ${user.full_name}. Errors: ${errors.length}`
    );

    return NextResponse.json({
      success: true,
      updated: results.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[bulk-update-attributes] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
