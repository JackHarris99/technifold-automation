/**
 * GET /api/admin/companies/search?q=searchterm
 * Search companies (filtered by sales rep territory)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export const maxDuration = 10;

export async function GET(request: NextRequest) {
  console.log('[companies/search] Endpoint called');

  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    console.log('[companies/search] Query:', q);

    if (!q || q.length < 2) {
      console.log('[companies/search] Query too short, returning empty');
      return NextResponse.json({ companies: [] });
    }

    console.log('[companies/search] Getting Supabase client...');
    const supabase = getSupabaseClient();
    console.log('[companies/search] Supabase client obtained');

    // All users can see all companies (no territory filter on search)
    // But exclude dead customers from search results
    console.log('[companies/search] Running query...');
    const { data, error } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner, status')
      .ilike('company_name', `%${q}%`)
      .neq('status', 'dead')  // Hide dead customers from search
      .order('company_name')
      .limit(20);

    console.log('[companies/search] Query completed', {
      success: !error,
      count: data?.length
    });

    if (error) {
      console.error('[companies/search] Database error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ companies: data || [] });
  } catch (err) {
    console.error('[companies/search] Exception:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
