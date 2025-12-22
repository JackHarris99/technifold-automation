/**
 * POST /api/portal/create-shipping-address
 * Create or update shipping address using HMAC token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      address_line_1,
      address_line_2,
      city,
      state_province,
      postal_code,
      country,
    } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify HMAC token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    const company_id = payload.company_id;

    // First, set all existing addresses to non-default
    await supabase
      .from('shipping_addresses')
      .update({ is_default: false })
      .eq('company_id', company_id);

    // Create new default shipping address
    const { error: insertError } = await supabase
      .from('shipping_addresses')
      .insert({
        company_id,
        address_line_1,
        address_line_2,
        city,
        state_province,
        postal_code,
        country,
        is_default: true,
      });

    if (insertError) {
      console.error('[portal/create-shipping-address] Error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create shipping address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shipping address created successfully',
    });

  } catch (error) {
    console.error('[portal/create-shipping-address] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
