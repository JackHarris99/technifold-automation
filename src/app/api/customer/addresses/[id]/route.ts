/**
 * PUT /api/customer/addresses/[id]
 * Update an existing shipping address
 *
 * DELETE /api/customer/addresses/[id]
 * Delete a shipping address
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const supabase = getSupabaseClient();

    // Verify address belongs to this company
    const { data: existing, error: fetchError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('address_id', params.id)
      .eq('company_id', session.company_id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Address not found or access denied' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults first
    if (is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('company_id', session.company_id)
        .neq('address_id', params.id);
    }

    // Update address
    const { data: address, error } = await supabase
      .from('shipping_addresses')
      .update({
        address_line_1,
        address_line_2: address_line_2 || null,
        city,
        state_province: state_province || null,
        postal_code,
        country,
        is_default: is_default || false,
      })
      .eq('address_id', params.id)
      .select()
      .single();

    if (error) {
      console.error('[Addresses PUT] Error updating address:', error);
      return NextResponse.json(
        { error: 'Failed to update address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ address });
  } catch (error: any) {
    console.error('[Addresses PUT] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify address belongs to this company
    const { data: existing, error: fetchError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('address_id', params.id)
      .eq('company_id', session.company_id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Address not found or access denied' },
        { status: 404 }
      );
    }

    // Check if this is the only address
    const { data: allAddresses } = await supabase
      .from('shipping_addresses')
      .select('address_id')
      .eq('company_id', session.company_id);

    if (allAddresses && allAddresses.length === 1) {
      return NextResponse.json(
        { error: 'Cannot delete the only address' },
        { status: 400 }
      );
    }

    // Delete address
    const { error } = await supabase
      .from('shipping_addresses')
      .delete()
      .eq('address_id', params.id);

    if (error) {
      console.error('[Addresses DELETE] Error deleting address:', error);
      return NextResponse.json(
        { error: 'Failed to delete address' },
        { status: 500 }
      );
    }

    // If deleted address was default, set another as default
    if (existing.is_default && allAddresses && allAddresses.length > 1) {
      const otherAddressId = allAddresses.find(a => a.address_id !== params.id)?.address_id;
      if (otherAddressId) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: true })
          .eq('address_id', otherAddressId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Addresses DELETE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
