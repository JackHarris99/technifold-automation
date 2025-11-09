/**
 * GET /api/admin/companies/search?q=searchterm
 * Search companies (filtered by sales rep territory)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getUserRepFilter } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ companies: [] });
    }

    const supabase = getSupabaseClient();
    const repFilter = await getUserRepFilter();

    // Build query with territory filter
    let query = supabase
      .from('companies')
      .select('company_id, company_name, account_owner')
      .ilike('company_name', `%${q}%`)
      .order('company_name')
      .limit(20);

    if (repFilter) {
      query = query.eq('account_owner', repFilter);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ companies: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
