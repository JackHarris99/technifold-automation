/**
 * GET /api/portal/company-details
 * Fetch company billing details using HMAC token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify HMAC token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    const company_id = payload.company_id;

    // Fetch company billing details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        company_id,
        company_name,
        billing_address_line_1,
        billing_address_line_2,
        billing_city,
        billing_state_province,
        billing_postal_code,
        billing_country,
        vat_number
      `)
      .eq('company_id', company_id)
      .single();

    if (companyError) {
      console.error('[portal/company-details] Error fetching company:', companyError);
      return NextResponse.json(
        { error: 'Failed to fetch company details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company: company || null,
    });

  } catch (error) {
    console.error('[portal/company-details] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
