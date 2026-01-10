/**
 * POST /api/admin/tools/add
 * Add a tool to company purchase history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      product_code,
      first_purchased_at,
      last_purchased_at,
      total_quantity,
      total_purchases,
    } = body;

    // Validation
    if (!company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    if (!product_code) {
      return NextResponse.json(
        { error: 'product_code is required' },
        { status: 400 }
      );
    }

    if (!first_purchased_at || !last_purchased_at) {
      return NextResponse.json(
        { error: 'Purchase dates are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify product exists and is a tool
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('product_code, description, rental_price_monthly')
      .eq('product_code', product_code)
      .not('rental_price_monthly', 'is', null)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Tool not found or invalid product code' },
        { status: 404 }
      );
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('company_product_history')
      .select('product_code')
      .eq('company_id', company_id)
      .eq('product_code', product_code)
      .eq('product_type', 'tool')
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This tool is already in the company purchase history' },
        { status: 409 }
      );
    }

    // Insert into company_product_history
    const { data: history, error: insertError } = await supabase
      .from('company_product_history')
      .insert({
        company_id,
        product_code,
        product_type: 'tool',
        first_purchased_at,
        last_purchased_at,
        total_purchases: total_purchases || 1,
        total_quantity: total_quantity || 1,
        source: 'manual',
        added_by: 'admin',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[tools/add] Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Also sync to company_tools table (for send-reorder builder)
    const { error: toolsError } = await supabase
      .from('company_tools')
      .upsert(
        {
          company_id,
          tool_code: product_code,
          first_seen_at: first_purchased_at,
          last_seen_at: last_purchased_at,
          total_units: total_quantity || 1,
        },
        {
          onConflict: 'company_id,tool_code',
          ignoreDuplicates: false,
        }
      );

    if (toolsError) {
      console.error('[tools/add] Failed to sync to company_tools:', toolsError);
      // Don't fail the request - company_product_history is the source of truth
    }

    console.log('[tools/add] Added tool to company:', company_id, product_code);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('[tools/add] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
