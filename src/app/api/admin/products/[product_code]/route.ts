/**
 * GET /api/admin/products/[product_code] - Get product details with related items
 * PATCH /api/admin/products/[product_code] - Update product details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ product_code: string }> }
) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { product_code: encodedProductCode } = await params;
    // Decode -- back to / for product codes with slashes
    const productCode = decodeURIComponent(encodedProductCode).replace(/--/g, '/');
    const updates = await request.json();

    const supabase = getSupabaseClient();

    // Check if product_code is being changed (directors only)
    let allowedUpdates: any = {};
    if (updates.product_code && updates.product_code !== productCode) {
      // Only directors can change product_code
      if (user.role !== 'director') {
        return NextResponse.json({ error: 'Only directors can change product codes' }, { status: 403 });
      }

      // Verify new product_code doesn't already exist
      const { data: existing } = await supabase
        .from('products')
        .select('product_code')
        .eq('product_code', updates.product_code)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Product code already exists' }, { status: 409 });
      }

      allowedUpdates.product_code = updates.product_code;
    }

    // Remove read-only fields and handle remaining updates
    const { product_code: _, created_at, updated_at, ...otherUpdates } = updates;
    allowedUpdates = { ...allowedUpdates, ...otherUpdates };

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

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
