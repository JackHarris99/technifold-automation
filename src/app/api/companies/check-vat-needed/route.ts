/**
 * GET /api/companies/check-vat-needed?company_id=xxx
 * Check if a company needs VAT number collection before invoice creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkVATNumberNeeded } from '@/lib/vat-helpers';

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
