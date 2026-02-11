/**
 * POST /api/customer/accept-invitation
 * Accept invitation and set password for new customer user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { hashPassword } from '@/lib/customerAuth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Verify token and get user
    const { data: user, error: userError } = await supabase
      .from('customer_users')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    // Check token not expired
    if (user.invitation_expires_at && new Date(user.invitation_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check user hasn't already set password
    if (user.password_hash) {
      return NextResponse.json({ error: 'Password already set' }, { status: 400 });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Update user - set password and clear invitation
    const { error: updateError } = await supabase
      .from('customer_users')
      .update({
        password_hash,
        invitation_token: null,
        invitation_expires_at: null,
      })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('[Accept Invitation] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to set password' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        first_name: user.first_name,
      }
    });
  } catch (error: any) {
    console.error('[Accept Invitation] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
