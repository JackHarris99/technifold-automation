/**
 * GET /api/admin/users/list
 * List users filtered by role and active status
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { isDirector } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if user is a director
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'sales_rep', 'director', etc.
    const isActive = searchParams.get('is_active'); // 'true' or 'false'

    const supabase = getSupabaseClient();

    let query = supabase
      .from('users')
      .select('user_id, sales_rep_id, full_name, email, role, is_active')
      .order('full_name');

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (isActive === 'true') {
      query = query.eq('is_active', true);
    } else if (isActive === 'false') {
      query = query.eq('is_active', false);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('[users/list] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: users || [],
    });
  } catch (error) {
    console.error('[users/list] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
