/**
 * POST /api/distributor/users/toggle-active
 * Activate or deactivate a team member (distributor admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentDistributor } from '@/lib/distributorAuth';

export async function POST(request: NextRequest) {
  try {
    const currentDistributor = await getCurrentDistributor();
    if (!currentDistributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (currentDistributor.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can activate/deactivate users' },
        { status: 403 }
      );
    }

    const { user_id, active } = await request.json();

    if (!user_id || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'user_id and active (boolean) required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get user to verify company
    const { data: user, error: userError } = await supabase
      .from('distributor_users')
      .select('company_id')
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user belongs to same company
    if (user.company_id !== currentDistributor.company_id) {
      return NextResponse.json(
        { error: 'You can only manage users in your own company' },
        { status: 403 }
      );
    }

    // Prevent user from deactivating themselves
    if (user_id === currentDistributor.user_id) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }

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
