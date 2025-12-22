/**
 * GET /api/portal/shipping-address
 * Fetch company shipping address using HMAC token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

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

    // Fetch default shipping address
    const { data: shippingAddress, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('address_line_1, address_line_2, city, state_province, postal_code, country')
      .eq('company_id', company_id)
      .eq('is_default', true)
      .single();

    if (addressError && addressError.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay, just means no address
      console.error('[portal/shipping-address] Error fetching address:', addressError);
      return NextResponse.json(
        { error: 'Failed to fetch shipping address' },
        { status: 500 }
      );
    }

    // Return null if no address found, otherwise return the address
    return NextResponse.json({
      success: true,
      address: shippingAddress || null,
    });

  } catch (error) {
    console.error('[portal/shipping-address] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
