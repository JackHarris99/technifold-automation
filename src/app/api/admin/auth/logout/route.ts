/**
 * POST /api/admin/auth/logout
 * Clear user cookie
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('current_user');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[auth-logout] Error:', err);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
