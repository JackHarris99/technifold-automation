/**
 * Dev-minimum admin authentication
 * Checks X-Admin-Secret header against ADMIN_SECRET env var
 */

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

/**
 * Verify admin authentication
 * Returns null if authenticated, or NextResponse with error if not
 */
export function verifyAdminAuth(request: NextRequest): NextResponse | null {
  // If no ADMIN_SECRET is configured, allow access in development
  if (!ADMIN_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[admin-auth] ADMIN_SECRET not configured in production!');
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 500 }
      );
    }
    // Allow access in development without secret
    return null;
  }

  const secret = request.headers.get('x-admin-secret');

  if (!secret || secret !== ADMIN_SECRET) {
    console.warn('[admin-auth] Invalid or missing X-Admin-Secret header');
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or missing X-Admin-Secret header' },
      { status: 401 }
    );
  }

  return null;
}
