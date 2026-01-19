/**
 * POST /api/admin/product-catalogs/add-product
 * Add a single product to company catalog (and optionally set custom price)
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company_id, product_code, custom_price } = body;

    if (!company_id || !product_code) {
      return NextResponse.json(
        { error: 'company_id and product_code required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Add to catalog
    const { error: catalogError } = await supabase
      .from('company_product_catalog')
      .upsert({
        company_id,
        product_code,
        visible: true,
      }, {
        onConflict: 'company_id,product_code',
      });

    if (catalogError) {
      console.error('[add-product] Catalog error:', catalogError);
      return NextResponse.json(
        { error: 'Failed to add product to catalog' },
        { status: 500 }
      );
    }

    // If custom price provided, save it
    if (custom_price && !isNaN(parseFloat(custom_price))) {
      const { error: priceError } = await supabase
        .from('company_distributor_pricing')
        .upsert({
          company_id,
          product_code,
          custom_price: parseFloat(custom_price),
          active: true,
        }, {
          onConflict: 'company_id,product_code',
        });

      if (priceError) {
        console.error('[add-product] Pricing error:', priceError);
        // Don't fail the request, just log
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product added to catalog',
    });

  } catch (err: any) {
    console.error('[add-product] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
