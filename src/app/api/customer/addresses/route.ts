/**
 * GET /api/customer/addresses
 * List all addresses for logged-in customer's company
 *
 * POST /api/customer/addresses
 * Create a new shipping address
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: addresses, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('company_id', session.company_id)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('[Addresses GET] Error fetching addresses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error('[Addresses GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      address_line_1,
      address_line_2,
      city,
      state_province,
      postal_code,
      country,
      is_default,
    } = body;

    // Validate required fields
    if (!address_line_1 || !city || !postal_code || !country) {
      return NextResponse.json(
        { error: 'Missing required address fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // If setting as default, unset other defaults first
    if (is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('company_id', session.company_id);
    }

    // Generate address ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const address_id = `ADDR-${timestamp}-${random}`;

    // Create address
    const { data: address, error } = await supabase
      .from('shipping_addresses')
      .insert({
        address_id,
        company_id: session.company_id,
        address_line_1,
        address_line_2: address_line_2 || null,
        city,
        state_province: state_province || null,
        postal_code,
        country,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Addresses POST] Error creating address:', error);
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ address });
  } catch (error: any) {
    console.error('[Addresses POST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
