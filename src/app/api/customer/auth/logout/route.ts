/**
 * POST /api/customer/auth/logout
 * Customer logout endpoint
 */

import { NextResponse } from 'next/server';
import { clearCustomerSession } from '@/lib/customerAuth';

export async function POST() {
  try {
    await clearCustomerSession();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Customer Logout] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
