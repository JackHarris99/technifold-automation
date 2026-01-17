/**
 * POST /api/admin/distributor-users/toggle-active
 * Activate or deactivate a distributor user
 * Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, active } = await request.json();

    if (!user_id || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'user_id and active (boolean) required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('distributor_users')
      .update({ active })
      .eq('user_id', user_id);

    if (error) {
      console.error('[Toggle Active] Error:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: active ? 'User activated' : 'User deactivated',
    });
  } catch (error: any) {
    console.error('[Toggle Active] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
