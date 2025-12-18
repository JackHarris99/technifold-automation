/**
 * PATCH /api/admin/companies/[company_id]/update-billing
 * Update company billing information (VAT number and billing address)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { company_id: string } }
) {
  try {
    const companyId = params.company_id;

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      vat_number,
      billing_address_line_1,
      billing_address_line_2,
      billing_city,
      billing_state_province,
      billing_postal_code,
      billing_country,
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (vat_number !== undefined) {
      updateData.vat_number = vat_number || null;
    }
    if (billing_address_line_1 !== undefined) {
      updateData.billing_address_line_1 = billing_address_line_1 || null;
    }
    if (billing_address_line_2 !== undefined) {
      updateData.billing_address_line_2 = billing_address_line_2 || null;
    }
    if (billing_city !== undefined) {
      updateData.billing_city = billing_city || null;
    }
    if (billing_state_province !== undefined) {
      updateData.billing_state_province = billing_state_province || null;
    }
    if (billing_postal_code !== undefined) {
      updateData.billing_postal_code = billing_postal_code || null;
    }
    if (billing_country !== undefined) {
      updateData.billing_country = billing_country || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      console.error('[update-billing] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company: data,
    });
  } catch (error) {
    console.error('[update-billing] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
