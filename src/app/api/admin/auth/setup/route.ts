/**
 * POST /api/admin/auth/setup
 * One-time setup endpoint to create the first admin user
 * Only works if no users exist in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, admin_secret } = await request.json();

    // Require ADMIN_SECRET to prevent unauthorized user creation
    if (admin_secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if any users already exist
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Setup already completed. Users exist in the system.' },
        { status: 400 }
      );
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Create the first admin user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        full_name,
        role: 'director',
        is_active: true,
      })
      .select('user_id, email, full_name, role')
      .single();

    if (error) {
      console.error('[auth-setup] Failed to create user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[auth-setup] Error:', err);
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    );
  }
}
