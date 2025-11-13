/**
 * /api/admin/users/[userId]
 * Update or delete specific user (directors only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector, getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * PATCH - Update user
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Only directors can manage users
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { full_name, role, sales_rep_id, is_active, new_password } = body;

    const supabase = getSupabaseClient();

    // Build update object
    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) updates.role = role;
    if (sales_rep_id !== undefined) updates.sales_rep_id = sales_rep_id || null;
    if (is_active !== undefined) updates.is_active = is_active;

    // Hash new password if provided
    if (new_password) {
      updates.password_hash = await bcrypt.hash(new_password, 10);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select('user_id, email, full_name, role, sales_rep_id, is_active, last_login_at, created_at')
      .single();

    if (error) {
      console.error('[users] Failed to update user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
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
        action_type: 'user_updated',
        entity_type: 'user',
        entity_id: user.user_id,
        description: `Updated user: ${user.full_name} (${user.email})`,
        metadata: updates,
      });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[users] Error updating user:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
