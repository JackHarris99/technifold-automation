/**
 * GET /api/admin/shipping-rates - Get all shipping rates
 * POST /api/admin/shipping-rates - Create new shipping rate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * GET - Fetch all shipping rates
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('current_user');

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: rates, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[shipping-rates] Error fetching:', error);
      return NextResponse.json({ error: 'Failed to fetch shipping rates' }, { status: 500 });
    }

    return NextResponse.json({ success: true, rates });
  } catch (err) {
    console.error('[shipping-rates] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Create new shipping rate
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('current_user');

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      country_code,
      country_name,
      rate_gbp,
      zone_name,
      free_shipping_threshold,
      min_order_value,
      display_order,
      active,
      notes,
    } = body;

    if (!country_code || !country_name || rate_gbp === undefined) {
      return NextResponse.json(
        { error: 'country_code, country_name, and rate_gbp are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if country_code already exists
    const { data: existing } = await supabase
      .from('shipping_rates')
      .select('country_code')
      .eq('country_code', country_code.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A shipping rate for this country already exists' },
        { status: 400 }
      );
    }

    const { data: rate, error } = await supabase
      .from('shipping_rates')
      .insert({
        country_code: country_code.toUpperCase(),
        country_name,
        rate_gbp: parseFloat(rate_gbp),
        zone_name: zone_name || null,
        free_shipping_threshold: free_shipping_threshold ? parseFloat(free_shipping_threshold) : null,
        min_order_value: min_order_value ? parseFloat(min_order_value) : 0,
        display_order: display_order || 999,
        active: active !== undefined ? active : true,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[shipping-rates] Error creating:', error);
      return NextResponse.json({ error: 'Failed to create shipping rate' }, { status: 500 });
    }

    return NextResponse.json({ success: true, rate });
  } catch (err) {
    console.error('[shipping-rates] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
