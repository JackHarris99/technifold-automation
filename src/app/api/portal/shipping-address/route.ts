/**
 * GET /api/portal/shipping-address
 * Fetch company shipping address using HMAC token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCompanyQueryField } from '@/lib/tokens';
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

    // First fetch company to get UUID (handles backward compatibility for old TEXT company_id values)
    const companyQuery = getCompanyQueryField(company_id);
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id')
      .eq(companyQuery.column, companyQuery.value)
      .single();

    if (companyError || !company) {
      console.error('[portal/shipping-address] Company not found:', companyError);
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Fetch ALL shipping addresses for the company using UUID company_id
    const { data: shippingAddresses, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('address_id, address_line_1, address_line_2, city, state_province, postal_code, country, is_default, label')
      .eq('company_id', company.company_id)
      .order('is_default', { ascending: false }); // Default address first

    if (addressError) {
      console.error('[portal/shipping-address] Error fetching addresses:', addressError);
      return NextResponse.json(
        { error: 'Failed to fetch shipping addresses' },
        { status: 500 }
      );
    }

    // Return all addresses (empty array if none found)
    return NextResponse.json({
      success: true,
      addresses: shippingAddresses || [],
    });

  } catch (error) {
    console.error('[portal/shipping-address] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
