/**
 * GET /api/admin/products/[product_code] - Get product details with related items
 * PATCH /api/admin/products/[product_code] - Update product details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ product_code: string }> }
) {
  try {
    const { product_code: encodedProductCode } = await params;
    // Decode -- back to / for product codes with slashes
    // Also handle URL encoding (%2F) from encodeURIComponent
    const productCode = decodeURIComponent(encodedProductCode).replace(/--/g, '/');

    const supabase = getSupabaseClient();

    const { data: sku, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_code', productCode)
      .single();

    if (error || !sku) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch related items based on product type
    let relatedItems: any[] = [];

    if (sku.type === 'tool') {
      // Get consumables linked to this tool
      const { data: toolConsumableMap } = await supabase
        .from('tool_consumable_map')
        .select('consumable_code')
        .eq('tool_code', productCode);

      if (toolConsumableMap && toolConsumableMap.length > 0) {
        const consumableCodes = toolConsumableMap.map((tc: any) => tc.consumable_code);
        const { data: consumables } = await supabase
          .from('products')
          .select('product_code, description, price, category, type')
          .in('product_code', consumableCodes);

        relatedItems = consumables || [];
      }
    } else if (sku.type === 'consumable') {
      // Get tools that use this consumable
      const { data: toolConsumableMap } = await supabase
        .from('tool_consumable_map')
        .select('tool_code')
        .eq('consumable_code', productCode);

      if (toolConsumableMap && toolConsumableMap.length > 0) {
        const toolCodes = toolConsumableMap.map((tc: any) => tc.tool_code);
        const { data: tools } = await supabase
          .from('products')
          .select('product_code, description, price, category, type')
          .in('product_code', toolCodes);

        relatedItems = tools || [];
      }
    }

    return NextResponse.json({ sku, relatedItems });
  } catch (error) {
    console.error('[Product GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ product_code: string }> }
) {
  try {
    const { product_code: encodedProductCode } = await params;
    // Decode -- back to / for product codes with slashes
    const productCode = decodeURIComponent(encodedProductCode).replace(/--/g, '/');
    const updates = await request.json();

    // Remove read-only fields that shouldn't be updated via this endpoint
    const { product_code: _, created_at, updated_at, ...allowedUpdates } = updates;

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .update(allowedUpdates)
      .eq('product_code', productCode)
      .select()
      .single();

    if (error) {
      console.error('[Product Update] Error:', error);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('[Product Update] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
