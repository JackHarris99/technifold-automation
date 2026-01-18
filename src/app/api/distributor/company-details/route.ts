/**
 * GET /api/distributor/company-details
 * Fetch company billing details for the distributor
 *
 * PATCH /api/distributor/company-details
 * Update company billing address (distributor JWT auth)
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

    const { data: company, error } = await supabase
      .from('companies')
      .select('company_id, company_name, billing_address_line_1, billing_address_line_2, billing_city, billing_state_province, billing_postal_code, billing_country, vat_number')
      .eq('company_id', distributor.company_id)
      .single();

    if (error) {
      console.error('[Distributor Company Details] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('[Distributor Company Details] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const distributor = await getCurrentDistributor();

    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      billing_address_line_1,
      billing_address_line_2,
      billing_city,
      billing_state_province,
      billing_postal_code,
      billing_country,
      vat_number,
    } = body;

    if (!billing_address_line_1 || !billing_city || !billing_postal_code || !billing_country) {
      return NextResponse.json(
        { error: 'Missing required billing address fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update company billing address
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        billing_address_line_1,
        billing_address_line_2,
        billing_city,
        billing_state_province,
        billing_postal_code,
        billing_country,
        vat_number,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', distributor.company_id);

    if (updateError) {
      console.error('[Distributor Update Billing] Error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update billing address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Billing address updated successfully',
    });
  } catch (error) {
    console.error('[Distributor Update Billing] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
