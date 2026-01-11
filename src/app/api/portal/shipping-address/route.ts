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

    // Fetch ALL shipping addresses for the company
    const { data: shippingAddresses, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('address_id, address_line_1, address_line_2, city, state_province, postal_code, country, is_default, label')
      .eq('company_id', company_id)
      .order('is_default', { ascending: false }); // Default address first

    if (addressError) {
      console.error('[portal/shipping-address] Error fetching addresses:', addressError);
      return NextResponse.json(
        { error: 'Failed to fetch shipping addresses' },
        { status: 500 }
      );
    }

    // Return all addresses (empty array if none found)
    return NextResponse.json({
      success: true,
      addresses: shippingAddresses || [],
    });

  } catch (error) {
    console.error('[portal/shipping-address] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
