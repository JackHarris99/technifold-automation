/**
 * PUT /api/customer/account/password
 * Change password for logged-in customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession, hashPassword, verifyPassword } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    // Validate required fields
    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password length
    if (new_password.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get current user with password hash
    const { data: user, error: fetchError } = await supabase
      .from('customer_users')
      .select('user_id, password_hash')
      .eq('user_id', session.user_id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(current_password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password);

    // Update password
    const { error: updateError } = await supabase
      .from('customer_users')
      .update({ password_hash: newPasswordHash })
      .eq('user_id', session.user_id);

    if (updateError) {
      console.error('[Account Password PUT] Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('[Account Password PUT] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
