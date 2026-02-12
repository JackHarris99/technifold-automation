/**
 * POST /api/admin/customer-users/login-as
 * Admin-only: Generate a temporary session to preview customer portal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get customer user details
    const { data: user, error: userError } = await supabase
      .from('customer_users')
      .select('*, companies(company_name)')
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'User is not active' }, { status: 400 });
    }

    // Create JWT token for customer (same as login, but with preview flag)
    const fullName = `${user.first_name} ${user.last_name}`;
    const token = await new SignJWT({
      user_id: user.user_id,
      company_id: user.company_id,
      company_name: user.companies?.company_name || 'Unknown Company',
      email: user.email,
      full_name: fullName,
      type: 'customer',
      preview_mode: true, // Flag to show banner
      admin_user_id: currentUser.user_id, // Track who's previewing
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h') // Shorter expiry for preview sessions
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Set customer session cookie
    const cookieStore = await cookies();
    cookieStore.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: `Preview session created for ${fullName}`,
      redirect: '/customer/portal',
    });
  } catch (error: any) {
    console.error('[Customer Login As] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
