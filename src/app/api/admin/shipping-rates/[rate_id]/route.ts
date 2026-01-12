/**
 * PATCH /api/admin/shipping-rates/[rate_id] - Update shipping rate
 * DELETE /api/admin/shipping-rates/[rate_id] - Delete shipping rate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * PATCH - Update shipping rate
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ rate_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rate_id } = await params;
    const body = await request.json();
    const {
      country_name,
      rate_gbp,
      zone_name,
      free_shipping_threshold,
      min_order_value,
      display_order,
      active,
      notes,
    } = body;

    const supabase = getSupabaseClient();

    const updates: any = {};
    if (country_name !== undefined) updates.country_name = country_name;
    if (rate_gbp !== undefined) updates.rate_gbp = parseFloat(rate_gbp);
    if (zone_name !== undefined) updates.zone_name = zone_name;
    if (free_shipping_threshold !== undefined) {
      updates.free_shipping_threshold = free_shipping_threshold ? parseFloat(free_shipping_threshold) : null;
    }
    if (min_order_value !== undefined) updates.min_order_value = parseFloat(min_order_value);
    if (display_order !== undefined) updates.display_order = display_order;
    if (active !== undefined) updates.active = active;
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: rate, error } = await supabase
      .from('shipping_rates')
      .update(updates)
      .eq('rate_id', rate_id)
      .select()
      .single();

    if (error) {
      console.error('[shipping-rates] Error updating:', error);
      return NextResponse.json({ error: 'Failed to update shipping rate' }, { status: 500 });
    }

    return NextResponse.json({ success: true, rate });
  } catch (err) {
    console.error('[shipping-rates] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE - Delete shipping rate
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ rate_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rate_id } = await params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('shipping_rates')
      .delete()
      .eq('rate_id', rate_id);

    if (error) {
      console.error('[shipping-rates] Error deleting:', error);
      return NextResponse.json({ error: 'Failed to delete shipping rate' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[shipping-rates] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
