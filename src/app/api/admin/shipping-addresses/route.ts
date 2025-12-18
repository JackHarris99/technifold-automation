/**
 * POST /api/admin/shipping-addresses
 * Create or update shipping address for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      address_line_1,
      address_line_2,
      city,
      state_province,
      postal_code,
      country,
      is_default,
    } = body;

    if (!company_id || !address_line_1 || !city || !postal_code || !country) {
      return NextResponse.json(
        { error: 'company_id, address_line_1, city, postal_code, and country are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // If setting as default, un-default all other addresses for this company
    if (is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('company_id', company_id);
    }

    // Create new shipping address
    const { data, error } = await supabase
      .from('shipping_addresses')
      .insert({
        company_id,
        address_line_1,
        address_line_2: address_line_2 || null,
        city,
        state_province: state_province || null,
        postal_code,
        country,
        is_default: is_default || false,
      })
      .select();

    // Extract first result (should only be one anyway)
    const address = Array.isArray(data) && data.length > 0 ? data[0] : data;

    if (error) {
      console.error('[shipping-addresses] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address: address,
    });
  } catch (error) {
    console.error('[shipping-addresses] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
