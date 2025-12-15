/**
 * POST /api/admin/auth/login
 * Simple login - sets user cookie for session
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { rep_id, rep_name, email, role } = await request.json();

    if (!rep_id || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create user object matching the User interface in auth.ts
    const user = {
      user_id: rep_id,
      email: email,
      full_name: rep_name || rep_id,
      role: role,
      sales_rep_id: role === 'director' ? null : rep_id,
    };

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set('current_user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('[auth-login] Error:', err);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
