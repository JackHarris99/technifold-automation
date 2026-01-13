/**
 * POST /api/admin/auth/reset-password
 * Emergency password reset - requires secret token from environment
 * Used when director is locked out and needs to reset password
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, new_password, reset_token } = await request.json();

    if (!email || !new_password || !reset_token) {
      return NextResponse.json(
        { error: 'Email, new_password, and reset_token are required' },
        { status: 400 }
      );
    }

    // Verify reset token matches environment variable
    const validResetToken = process.env.ADMIN_RESET_TOKEN;

    if (!validResetToken) {
      return NextResponse.json(
        { error: 'Password reset is not configured. Add ADMIN_RESET_TOKEN to .env.local' },
        { status: 503 }
      );
    }

    if (reset_token !== validResetToken) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 403 }
      );
    }

    // Validate password strength
    if (new_password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Find user by email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('user_id, email, full_name, role')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('[reset-password] Failed to update password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    console.log(`[reset-password] Password updated for ${user.full_name} (${user.email})`);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now log in at /admin/login'
    });

  } catch (err) {
    console.error('[reset-password] Error:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
