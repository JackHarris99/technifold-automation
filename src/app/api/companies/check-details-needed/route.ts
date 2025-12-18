/**
 * GET /api/companies/check-details-needed?company_id=xxx (Admin use)
 * POST /api/companies/check-details-needed (Customer use with token)
 * Check if a company needs address/VAT collection before invoice creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isEUCountry } from '@/lib/vat-helpers';
import { verifyToken } from '@/lib/tokens';

async function checkCompanyDetails(companyId: string) {
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
    return { error: 'Company not found', status: 404 };
  }

  // Get default shipping address
  const { data: shippingAddress } = await supabase
    .from('shipping_addresses')
    .select('address_line_1, address_line_2, city, state_province, postal_code, country')
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
    shippingAddress?.address_line_1 &&
    shippingAddress?.city &&
    shippingAddress?.postal_code &&
    shippingAddress?.country
  );

  // Check if VAT number is needed (EU companies)
  const billingCountry = company.billing_country || company.country || '';
  const isEU = isEUCountry(billingCountry);
  const needsVAT = isEU && !company.vat_number;

  // Details needed if EITHER billing address OR shipping address is incomplete OR VAT is needed
  const detailsNeeded = !hasBillingAddress || !hasShippingAddress || needsVAT;

  return {
    data: {
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
        address_line1: shippingAddress.address_line_1,
        address_line2: shippingAddress.address_line_2 || '',
        city: shippingAddress.city,
        county: shippingAddress.state_province || '',
        postcode: shippingAddress.postal_code,
        country: shippingAddress.country,
      } : null,
    }
  };
}

// GET handler for admin use (no token required)
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

    const result = await checkCompanyDetails(companyId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error('[check-details-needed GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler for customer use (token required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Verify HMAC token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract company_id from verified token (not from request body - security!)
    const companyId = payload.company_id;

    const result = await checkCompanyDetails(companyId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error('[check-details-needed POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
