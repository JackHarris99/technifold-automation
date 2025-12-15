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

    const { data: company, error } = await supabase
      .from('companies')
      .select('company_id, company_name, address_line1, address_line2, city, county, postcode, country, vat_number')
      .eq('company_id', companyId)
      .single();

    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check what's missing
    const hasAddress = !!(company.address_line1 && company.city && company.postcode && company.country);
    const isEU = isEUCountry(company.country || '');
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
        address_line1: company.address_line1 || '',
        address_line2: company.address_line2 || '',
        city: company.city || '',
        county: company.county || '',
        postcode: company.postcode || '',
        country: company.country || '',
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
