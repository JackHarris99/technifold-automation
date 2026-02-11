/**
 * PUT /api/customer/account/company
 * Update company information for logged-in customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
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
      company_name,
      billing_address_line_1,
      billing_address_line_2,
      billing_city,
      billing_state_province,
      billing_postal_code,
      billing_country,
      vat_number,
    } = body;

    // Validate required fields
    if (!company_name || !billing_address_line_1 || !billing_city || !billing_postal_code || !billing_country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update company
    const { data: company, error } = await supabase
      .from('companies')
      .update({
        company_name,
        billing_address_line_1,
        billing_address_line_2: billing_address_line_2 || null,
        billing_city,
        billing_state_province: billing_state_province || null,
        billing_postal_code,
        billing_country,
        vat_number: vat_number || null,
      })
      .eq('company_id', session.company_id)
      .select()
      .single();

    if (error) {
      console.error('[Account Company PUT] Error updating company:', error);
      return NextResponse.json(
        { error: 'Failed to update company information' },
        { status: 500 }
      );
    }

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error('[Account Company PUT] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
