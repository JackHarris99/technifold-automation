/**
 * Admin API - Next Best Actions / Suggestions
 * GET /api/admin/suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const supabase = getSupabaseClient();

    const { data: suggestions, error } = await supabase
      .from('v_next_best_actions')
      .select('*')
      .limit(Math.min(limit, 100)); // Cap at 100

    if (error) {
      console.error('[suggestions] Error fetching suggestions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestions: suggestions || [] });
  } catch (error) {
    console.error('[suggestions] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
