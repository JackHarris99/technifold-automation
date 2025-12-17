/**
 * GET /api/companies/check-details-needed?company_id=xxx
 * Check if a company needs address/VAT collection before invoice creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isEUCountry } from '@/lib/vat-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get company details (VAT number)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, country, vat_number')
      .eq('company_id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get default shipping address
    const { data: shippingAddress } = await supabase
      .from('shipping_addresses')
      .select('address_line_1, address_line_2, city, state_province, postal_code, country')
      .eq('company_id', companyId)
      .eq('is_default', true)
      .single();

    // Check what's missing
    const hasAddress = !!(
      shippingAddress?.address_line_1 &&
      shippingAddress?.city &&
      shippingAddress?.postal_code &&
      shippingAddress?.country
    );

    const addressCountry = shippingAddress?.country || company.country || '';
    const isEU = isEUCountry(addressCountry);
    const needsVAT = isEU && !company.vat_number;

    // Details needed if address is incomplete OR VAT is needed
    const detailsNeeded = !hasAddress || needsVAT;

    return NextResponse.json({
      details_needed: detailsNeeded,
      address_needed: !hasAddress,
      vat_needed: needsVAT,
      company: {
        company_id: company.company_id,
        company_name: company.company_name,
        address_line1: shippingAddress?.address_line_1 || '',
        address_line2: shippingAddress?.address_line_2 || '',
        city: shippingAddress?.city || '',
        county: shippingAddress?.state_province || '',
        postcode: shippingAddress?.postal_code || '',
        country: shippingAddress?.country || company.country || '',
        vat_number: company.vat_number || '',
      },
    });

  } catch (error) {
    console.error('[check-details-needed] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
