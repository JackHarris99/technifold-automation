/**
 * PATCH /api/portal/update-billing
 * Update company billing address using HMAC token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      billing_address_line_1,
      billing_address_line_2,
      billing_city,
      billing_state_province,
      billing_postal_code,
      billing_country,
      vat_number,
    } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify HMAC token
    console.log('[portal/update-billing] Verifying token, length:', token?.length, 'first 20 chars:', token?.substring(0, 20));
    const payload = verifyToken(token);
    if (!payload) {
      console.error('[portal/update-billing] TOKEN VERIFICATION FAILED - Check logs above for [tokens] warnings');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    console.log('[portal/update-billing] Token verified successfully for company:', payload.company_id);

    const supabase = getSupabaseClient();
    const company_id = payload.company_id;

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
      .eq('company_id', company_id);

    if (updateError) {
      console.error('[portal/update-billing] Error:', updateError);
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
    console.error('[portal/update-billing] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
