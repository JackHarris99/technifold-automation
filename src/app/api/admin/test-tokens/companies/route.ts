/**
 * GET /api/admin/test-tokens/companies
 * Fetch all companies for test token generator
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: companies, error } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .order('company_name');

    if (error) {
      console.error('[test-tokens] Error fetching companies:', error);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }

    return NextResponse.json({ companies });
  } catch (err) {
    console.error('[test-tokens] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
