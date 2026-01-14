/**
 * POST /api/admin/products/create
 * Create a new product in the catalog
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
    const {
      product_code,
      description,
      type = 'part',
      category,
      active = true,
      is_marketable = false,
      is_reminder_eligible = false,
      price,
      currency = 'GBP',
      site_visibility = ['technifold'],
      image_url,
      image_alt,
      video_url,
      weight_kg,
      dimensions_cm,
      hs_code,
      country_of_origin = 'GB',
      rental_price_monthly,
      customs_value_gbp,
      width_cm,
      height_cm,
      depth_cm,
      cost_price,
      pricing_tier = 'standard',
      extra = {},
    } = body;

    // Validate required fields
    if (!product_code) {
      return NextResponse.json(
        { error: 'product_code is required' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'description is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if product_code already exists
    const { data: existing } = await supabase
      .from('products')
      .select('product_code')
      .eq('product_code', product_code)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Product code already exists' },
        { status: 400 }
      );
    }

    // Create product
    const { data: newProduct, error: createError } = await supabase
      .from('products')
      .insert({
        product_code,
        description,
        type,
        category,
        active,
        is_marketable,
        is_reminder_eligible,
        price,
        currency,
        site_visibility,
        image_url,
        image_alt,
        video_url,
        weight_kg,
        dimensions_cm,
        hs_code,
        country_of_origin,
        rental_price_monthly,
        customs_value_gbp,
        width_cm,
        height_cm,
        depth_cm,
        cost_price,
        pricing_tier,
        extra,
      })
      .select()
      .single();

    if (createError) {
      console.error('[products/create] Error creating product:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.user_id,
      user_email: user.email,
      user_name: user.full_name,
      action_type: 'product_created',
      entity_type: 'product',
      entity_id: product_code,
      description: `Created product: ${product_code} - ${description}`,
    });

    console.log(`[products/create] Product created: ${product_code} by ${user.full_name}`);

    return NextResponse.json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    console.error('[products/create] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
