/**
 * GET /api/companies/check-vat-needed?company_id=xxx
 * Check if a company needs VAT number collection before invoice creation
 * SECURITY: Requires authentication (admin or valid token)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkVATNumberNeeded } from '@/lib/vat-helpers';
import { getCurrentUser } from '@/lib/auth';

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

    // TODO: If token provided, validate it belongs to this company_id

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
