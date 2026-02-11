/**
 * GET /api/customer/auth/me
 * Get current customer session
 */

import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: session });
  } catch (error: any) {
    console.error('[Customer Me] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
