/**
 * POST /api/admin/product-catalogs/update
 * Save custom product catalog for a company
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only directors can update catalogs
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company_id, product_codes } = body as {
      company_id: string;
      product_codes: string[];
    };

    if (!company_id || !product_codes || !Array.isArray(product_codes)) {
      return NextResponse.json(
        { error: 'company_id and product_codes array required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Delete existing catalog for this company
    await supabase
      .from('company_product_catalog')
      .delete()
      .eq('company_id', company_id);

    // Insert new catalog entries
    if (product_codes.length > 0) {
      const catalogEntries = product_codes.map((product_code, index) => ({
        company_id,
        product_code,
        visible: true,
        display_order: index + 1,
      }));

      const { error: insertError } = await supabase
        .from('company_product_catalog')
        .insert(catalogEntries);

      if (insertError) {
        console.error('[product-catalogs-update] Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to save catalog', details: insertError.message },
          { status: 500 }
        );
      }
    }

    console.log(`[product-catalogs-update] Saved custom catalog for company ${company_id}: ${product_codes.length} products`);

    return NextResponse.json({
      success: true,
      message: `Custom catalog saved with ${product_codes.length} products`,
      added: product_codes.length,
    });

  } catch (err: any) {
    console.error('[product-catalogs-update] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
