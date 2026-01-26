/**
 * POST /api/vat/verify
 * Backend proxy for EU VIES VAT verification
 * Solves CORS issues when calling VIES from frontend
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyVATNumber } from '@/lib/vat-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, vatNumber } = body;

    if (!countryCode || !vatNumber) {
      return NextResponse.json(
        { error: 'countryCode and vatNumber are required' },
        { status: 400 }
      );
    }

    // Call VIES verification from backend (no CORS issues)
    const result = await verifyVATNumber(countryCode, vatNumber);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[VAT Verify API] Error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to verify VAT number',
        errorCode: 'UNKNOWN',
      },
      { status: 500 }
    );
  }
}
