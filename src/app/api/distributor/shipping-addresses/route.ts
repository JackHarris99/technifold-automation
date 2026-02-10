/**
 * GET /api/distributor/shipping-addresses
 * Fetch all shipping addresses for the distributor's company
 *
 * POST /api/distributor/shipping-addresses
 * Create a new shipping address (distributor JWT auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentDistributor } from '@/lib/distributorAuth';

export async function GET() {
  try {
    const distributor = await getCurrentDistributor();

    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: addresses, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('company_id', distributor.company_id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Distributor Shipping Addresses] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      addresses: addresses || [],
    });
  } catch (error) {
    console.error('[Distributor Shipping Addresses] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentDistributor();

    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      label,
      address_line_1,
      address_line_2,
      city,
      state_province,
      postal_code,
      country,
      is_default,
    } = body;

    // No validation - accept partial data, sales team will complete during review
    const supabase = getSupabaseClient();

    // If this is set as default, unset any existing defaults
    if (is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('company_id', distributor.company_id);
    }

    // Create new shipping address
    const { data: newAddress, error: createError } = await supabase
      .from('shipping_addresses')
      .insert({
        company_id: distributor.company_id,
        label,
        address_line_1,
        address_line_2,
        city,
        state_province,
        postal_code,
        country,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (createError) {
      console.error('[Distributor Create Shipping Address] Error:', createError);
      return NextResponse.json(
        { error: 'Failed to create shipping address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address: newAddress,
      message: 'Shipping address created successfully',
    });
  } catch (error) {
    console.error('[Distributor Create Shipping Address] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
