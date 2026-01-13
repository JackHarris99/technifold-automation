/**
 * POST /api/admin/auth/reset-password-with-token
 * Complete password reset using token from email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, new_password } = await request.json();

    if (!token || !new_password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Find user by reset token
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('user_id, email, full_name, reset_token, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (fetchError || !user) {
      console.log('[reset-password-token] Invalid token');
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      console.log('[reset-password-token] Token expired for user:', user.email);
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('[reset-password-token] Failed to update password:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    console.log(`[reset-password-token] Password reset successful for ${user.full_name} (${user.email})`);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (err) {
    console.error('[reset-password-token] Error:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
