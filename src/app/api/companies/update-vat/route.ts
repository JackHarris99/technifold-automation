/**
 * POST /api/companies/update-vat
 * Save VAT number permanently to companies table
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, vat_number } = body;

    if (!company_id || !vat_number) {
      return NextResponse.json(
        { error: 'company_id and vat_number are required' },
        { status: 400 }
      );
    }

    // Clean and validate VAT number
    const cleanedVAT = vat_number.trim().toUpperCase();

    if (cleanedVAT.length < 4) {
      return NextResponse.json(
        { error: 'VAT number is too short' },
        { status: 400 }
      );
    }

    // Basic format check: Should start with 2-letter country code
    const countryCodeMatch = cleanedVAT.match(/^[A-Z]{2}/);
    if (!countryCodeMatch) {
      return NextResponse.json(
        { error: 'VAT number should start with a 2-letter country code (e.g., DE123456789)' },
        { status: 400 }
      );
    }

    // Save to database
    const supabase = getSupabaseClient();
    const { error: updateError } = await supabase
      .from('companies')
      .update({ vat_number: cleanedVAT })
      .eq('company_id', company_id);

    if (updateError) {
      console.error('[update-vat] Database error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save VAT number' },
        { status: 500 }
      );
    }

    console.log(`[update-vat] Saved VAT number for company ${company_id}: ${cleanedVAT}`);

    return NextResponse.json({
      success: true,
      vat_number: cleanedVAT,
    });

  } catch (error) {
    console.error('[update-vat] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
