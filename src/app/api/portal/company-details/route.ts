/**
 * GET /api/portal/company-details
 * Fetch company billing details using token or session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortalAuth } from '@/lib/portalAuth';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') || undefined;

    // Get auth from either token or session
    const auth = await getPortalAuth(token);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

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
      .eq('company_id', auth.company_id)
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
