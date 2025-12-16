/**
 * GET /api/admin/companies/search?q=searchterm
 * Search companies (filtered by sales rep territory)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getUserRepFilter } from '@/lib/auth';

export const maxDuration = 10; // 10 second timeout

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    console.log('[companies/search] Query:', q);

    if (!q || q.length < 2) {
      return NextResponse.json({ companies: [] });
    }

    const supabase = getSupabaseClient();

    // All users can see all companies (no territory filter on search)
    // Search both company_name and company_id for better results
    const { data, error } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner')
      .or(`company_name.ilike.%${q}%,company_id.ilike.%${q}%`)
      .order('company_name')
      .limit(20);

    if (error) {
      console.error('[companies/search] Error:', error);
      return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
    }

    console.log(`[companies/search] Found ${data?.length || 0} companies`);

    return NextResponse.json({ companies: data || [] });
  } catch (err) {
    console.error('[companies/search] Exception:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
