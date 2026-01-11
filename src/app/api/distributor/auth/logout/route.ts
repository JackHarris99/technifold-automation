/**
 * POST /api/distributor/auth/logout
 * Log out distributor user
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('distributor_token');

  return NextResponse.redirect(new URL('/distributor/login', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));
}
