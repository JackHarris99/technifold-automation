/**
 * POST /api/admin/product-catalogs/update-price
 * Update custom price for a product in company's catalog
 * Directors and sales reps
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['director', 'sales_rep'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company_id, product_code, custom_price } = body;

    if (!company_id || !product_code || custom_price === undefined) {
      return NextResponse.json(
        { error: 'company_id, product_code, and custom_price required' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(custom_price)) || parseFloat(custom_price) < 0) {
      return NextResponse.json(
        { error: 'custom_price must be a valid positive number' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Upsert custom price
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
      console.error('[update-price] Error:', priceError);
      return NextResponse.json(
        { error: 'Failed to update custom price' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Custom price updated',
    });

  } catch (err: any) {
    console.error('[update-price] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
