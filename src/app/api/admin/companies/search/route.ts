/**
 * GET /api/admin/companies/search?q=searchTerm
 * Search companies by name
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ companies: [] });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner')
      .ilike('company_name', `%${q}%`)
      .order('company_name')
      .limit(20);

    if (error) {
      console.error('[admin/companies/search] Error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ companies: data || [] });
  } catch (err) {
    console.error('[admin/companies/search] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
