/**
 * Admin API - Engagement Feed
 * GET /api/admin/engagement-feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const supabase = getSupabaseClient();

    let query = supabase
      .from('engagement_events')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(Math.min(limit, 200)); // Cap at 200

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('[engagement-feed] Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch engagement events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('[engagement-feed] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
