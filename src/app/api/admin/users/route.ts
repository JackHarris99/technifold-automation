/**
 * /api/admin/users
 * Manage system users (directors only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector, getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * GET - List all users
 */
export async function GET() {
  try {
    // Only directors can manage users
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, email, full_name, role, sales_rep_id, is_active, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[users] Failed to fetch users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (err) {
    console.error('[users] Error:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new user
 */
export async function POST(request: NextRequest) {
  try {
    // Only directors can manage users
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const { email, password, full_name, role, sales_rep_id } = await request.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        role,
        sales_rep_id: sales_rep_id || null,
        is_active: true,
      })
      .select('user_id, email, full_name, role, sales_rep_id, is_active, created_at')
      .single();

    if (error) {
      console.error('[users] Failed to create user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Log activity
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await supabase.from('activity_log').insert({
        user_id: currentUser.user_id,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        action_type: 'user_created',
        entity_type: 'user',
        entity_id: user.user_id,
        description: `Created user: ${user.full_name} (${user.email})`,
        metadata: { role: user.role, sales_rep_id: user.sales_rep_id },
      });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[users] Error creating user:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
