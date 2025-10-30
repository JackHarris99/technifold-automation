/**
 * GET /api/admin/products/[code]/details
 * Get SKU details + related items (tools/consumables)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    console.log('[admin/products/details] Fetching details for:', code);

    const supabase = getSupabaseClient();

    // Fetch SKU details
    const { data: sku, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_code', code)
      .single();

    console.log('[admin/products/details] SKU query result:', { found: !!sku, error: error?.message });

    if (error || !sku) {
      console.error('[admin/products/details] SKU not found:', code, error);
      return NextResponse.json({ error: 'SKU not found', code }, { status: 404 });
    }

    let relatedItems: any[] = [];

    // If tool: get consumables that fit this tool
    if (sku.type === 'tool') {
      const { data: consumableMap } = await supabase
        .from('tool_consumable_map')
        .select('consumable_code')
        .eq('tool_code', code);

      if (consumableMap && consumableMap.length > 0) {
        const consumableCodes = consumableMap.map(cm => cm.consumable_code);

        const { data: consumables } = await supabase
          .from('products')
          .select('product_code, description, price, category')
          .in('product_code', consumableCodes);

        relatedItems = consumables || [];
      }
    }

    // If consumable: get tools this fits
    else if (sku.type === 'consumable') {
      const { data: toolMap } = await supabase
        .from('tool_consumable_map')
        .select('tool_code')
        .eq('consumable_code', code);

      if (toolMap && toolMap.length > 0) {
        const toolCodes = toolMap.map(tm => tm.tool_code);

        const { data: tools } = await supabase
          .from('products')
          .select('product_code, description, price, category')
          .in('product_code', toolCodes);

        relatedItems = tools || [];
      }
    }

    console.log('[admin/products/details] Success - relatedItems:', relatedItems.length);

    return NextResponse.json({
      sku,
      relatedItems
    });
  } catch (err: any) {
    console.error('[admin/products/details] Unexpected error:', err);
    console.error('[admin/products/details] Stack:', err.stack);
    return NextResponse.json({
      error: 'Internal server error',
      message: err.message,
      code: await context.params.then(p => p.code)
    }, { status: 500 });
  }
}
