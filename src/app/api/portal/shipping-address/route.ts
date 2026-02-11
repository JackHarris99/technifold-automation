/**
 * GET /api/portal/shipping-address
 * Fetch company shipping address using token or session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortalAuth } from '@/lib/portalAuth';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') || undefined;

    // Get auth from either token or session
    const auth = await getPortalAuth(token);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch ALL shipping addresses for the company
    const { data: shippingAddresses, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('address_id, address_line_1, address_line_2, city, state_province, postal_code, country, is_default, label')
      .eq('company_id', auth.company_id)
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
