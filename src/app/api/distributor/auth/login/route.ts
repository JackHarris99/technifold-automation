/**
 * POST /api/distributor/auth/login
 * Authenticate distributor users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Look up distributor user by email
    const { data: user, error: userError } = await supabase
      .from('distributor_users')
      .select('*, companies(company_name)')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.active) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Check if user has set password
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Please set your password using the invitation link sent to your email.' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await supabase
      .from('distributor_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', user.user_id);

    // Create JWT token
    const token = await new SignJWT({
      user_id: user.user_id,
      company_id: user.company_id,
      company_name: user.companies?.company_name || 'Unknown Company',
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      type: 'distributor',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('distributor_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        company_id: user.company_id,
        company_name: user.companies?.company_name || 'Unknown Company',
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Distributor Login] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
