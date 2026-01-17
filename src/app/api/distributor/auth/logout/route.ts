/**
 * POST /api/distributor/auth/logout
 * Log out distributor user
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('distributor_token');

  // Use the request origin to build the redirect URL (works on any domain)
  const origin = request.headers.get('origin') || request.nextUrl.origin;
  return NextResponse.redirect(new URL('/distributor/login', origin));
}
