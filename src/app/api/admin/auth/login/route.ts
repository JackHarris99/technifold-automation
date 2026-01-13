/**
 * POST /api/admin/auth/login
 * Authenticate admin users with proper database validation
 * SECURITY: Role is validated from database, not client request
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

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

    // Find user by email - MUST fetch from database
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, email, password_hash, full_name, role, sales_rep_id, is_active')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login time
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', user.user_id);

    // Create user object - role comes from DATABASE, not request
    const userData = {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role, // ✅ FROM DATABASE - cannot be manipulated
      sales_rep_id: user.sales_rep_id,
    };

    // Set session cookies
    const cookieStore = await cookies();
    cookieStore.set('current_user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    cookieStore.set('admin_authorized', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    console.error('[auth-login] Error:', err);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
