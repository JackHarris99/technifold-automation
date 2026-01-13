/**
 * POST /api/admin/addresses/manage
 * Create, update, or delete shipping addresses
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      action, // 'create', 'update', 'delete'
      company_id,
      address_id,
      address_line_1,
      address_line_2,
      city,
      state_province,
      postal_code,
      country,
      is_default,
      label,
    } = body;

    // Validation
    if (!action || !['create', 'update', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action is required (create, update, delete)' },
        { status: 400 }
      );
    }

    if (!company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Handle DELETE
    if (action === 'delete') {
      if (!address_id) {
        return NextResponse.json(
          { error: 'address_id is required for delete' },
          { status: 400 }
        );
      }

      const { error: deleteError } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('address_id', address_id)
        .eq('company_id', company_id); // Ensure user can only delete their company's addresses

      if (deleteError) {
        console.error('[addresses/manage] Delete error:', deleteError);
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }

      console.log('[addresses/manage] Deleted address:', address_id);

      return NextResponse.json({
        success: true,
        action: 'deleted',
      });
    }

    // Validate required fields for create/update
    if (!address_line_1 || !city || !postal_code || !country) {
      return NextResponse.json(
        { error: 'address_line_1, city, postal_code, and country are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset all other defaults first
    if (is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('company_id', company_id);
    }

    const addressData = {
      company_id,
      address_line_1,
      address_line_2: address_line_2 || null,
      city,
      state_province: state_province || null,
      postal_code,
      country,
      is_default: is_default || false,
      label: label || null,
    };

    // Handle UPDATE
    if (action === 'update') {
      if (!address_id) {
        return NextResponse.json(
          { error: 'address_id is required for update' },
          { status: 400 }
        );
      }

      const { data: address, error: updateError } = await supabase
        .from('shipping_addresses')
        .update(addressData)
        .eq('address_id', address_id)
        .eq('company_id', company_id)
        .select()
        .single();

      if (updateError) {
        console.error('[addresses/manage] Update error:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      console.log('[addresses/manage] Updated address:', address_id);

      return NextResponse.json({
        success: true,
        action: 'updated',
        address,
      });
    }

    // Handle CREATE
    const { data: address, error: createError } = await supabase
      .from('shipping_addresses')
      .insert(addressData)
      .select()
      .single();

    if (createError) {
      console.error('[addresses/manage] Create error:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    console.log('[addresses/manage] Created address:', address.address_id);

    return NextResponse.json({
      success: true,
      action: 'created',
      address,
    });
  } catch (error) {
    console.error('[addresses/manage] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
