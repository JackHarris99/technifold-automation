/**
 * GET /api/admin/tools/list
 * Get list of rentable tools (products with rental_price_monthly)
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: tools, error } = await supabase
      .from('products')
      .select('product_code, description, rental_price_monthly, price')
      .not('rental_price_monthly', 'is', null)
      .order('description');

    if (error) {
      console.error('[tools/list] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tools: tools || [],
    });
  } catch (error) {
    console.error('[tools/list] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
