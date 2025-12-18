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

    // Get company details (including billing address and VAT number)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        company_id,
        company_name,
        country,
        vat_number,
        billing_address_line1,
        billing_address_line2,
        billing_city,
        billing_county,
        billing_postcode,
        billing_country
      `)
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
      .select('address_line1, address_line2, city, county, postcode, country')
      .eq('company_id', companyId)
      .eq('is_default', true)
      .single();

    // Check what's missing
    const hasBillingAddress = !!(
      company.billing_address_line1 &&
      company.billing_city &&
      company.billing_postcode &&
      company.billing_country
    );

    const hasShippingAddress = !!(
      shippingAddress?.address_line1 &&
      shippingAddress?.city &&
      shippingAddress?.postcode &&
      shippingAddress?.country
    );

    // Check if VAT number is needed (EU companies)
    const billingCountry = company.billing_country || company.country || '';
    const isEU = isEUCountry(billingCountry);
    const needsVAT = isEU && !company.vat_number;

    // Details needed if EITHER billing address OR shipping address is incomplete OR VAT is needed
    const detailsNeeded = !hasBillingAddress || !hasShippingAddress || needsVAT;

    return NextResponse.json({
      details_needed: detailsNeeded,
      billing_address_needed: !hasBillingAddress,
      shipping_address_needed: !hasShippingAddress,
      vat_needed: needsVAT,
      company: {
        company_id: company.company_id,
        company_name: company.company_name,
        country: company.country || '',
        vat_number: company.vat_number || '',
        billing_address_line1: company.billing_address_line1 || '',
        billing_address_line2: company.billing_address_line2 || '',
        billing_city: company.billing_city || '',
        billing_county: company.billing_county || '',
        billing_postcode: company.billing_postcode || '',
        billing_country: company.billing_country || '',
      },
      shipping_address: shippingAddress ? {
        address_line1: shippingAddress.address_line1,
        address_line2: shippingAddress.address_line2 || '',
        city: shippingAddress.city,
        county: shippingAddress.county || '',
        postcode: shippingAddress.postcode,
        country: shippingAddress.country,
      } : null,
    });

  } catch (error) {
    console.error('[check-details-needed] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
