/**
 * GET /api/companies/check-vat-needed?company_id=xxx
 * Check if a company needs VAT number collection before invoice creation
 * SECURITY: Requires authentication (admin or valid token)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkVATNumberNeeded } from '@/lib/vat-helpers';
import { getCurrentUser } from '@/lib/auth';
import { verifyToken, getCompanyQueryField } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    // This endpoint can be called by admins or customers with valid portal tokens
    const user = await getCurrentUser();

    // Also check for portal token in query params (customer access)
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    // SECURITY: If token provided, validate it belongs to this company_id
    if (token && !user) {
      // Verify HMAC token signature
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Extract company_id from token
      const tokenCompanyId = payload.company_id;

      // Verify token's company_id matches requested company_id
      // Need to handle backward compatibility (old TEXT company_id vs new UUID)
      const supabase = getSupabaseClient();

      // Get company record using token's company_id
      const tokenCompanyQuery = getCompanyQueryField(tokenCompanyId);
      const { data: tokenCompany } = await supabase
        .from('companies')
        .select('company_id')
        .eq(tokenCompanyQuery.column, tokenCompanyQuery.value)
        .single();

      // Get company record using requested company_id
      const requestedCompanyQuery = getCompanyQueryField(companyId);
      const { data: requestedCompany } = await supabase
        .from('companies')
        .select('company_id')
        .eq(requestedCompanyQuery.column, requestedCompanyQuery.value)
        .single();

      // Compare UUIDs to prevent privilege escalation
      if (!tokenCompany || !requestedCompany || tokenCompany.company_id !== requestedCompany.company_id) {
        console.warn('[check-vat-needed] Token mismatch: token belongs to', tokenCompanyId, 'but requested', companyId);
        return NextResponse.json(
          { error: 'Forbidden - token does not belong to this company' },
          { status: 403 }
        );
      }

      console.log('[check-vat-needed] Token validated successfully for company:', tokenCompany.company_id);
    }

    const result = await checkVATNumberNeeded(companyId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      vat_needed: result.needed,
      company: result.company,
    });

  } catch (error) {
    console.error('[check-vat-needed] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
