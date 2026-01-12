/**
 * GET /api/shipping/countries
 * Returns list of active shipping countries from database
 * Used to populate country dropdowns throughout the app
 * PUBLIC endpoint - no auth required
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: countries, error } = await supabase
      .from('shipping_rates')
      .select('country_code, country_name, rate_gbp, free_shipping_threshold')
      .eq('active', true)
      .order('display_order');

    if (error) {
      console.error('[shipping/countries] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      countries: countries || [],
    });
  } catch (error) {
    console.error('[shipping/countries] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
