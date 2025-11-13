/**
 * GET /api/admin/companies/all
 * Fetch all companies for dropdowns/selectors
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Fetch ALL companies by removing the default 1000 row limit
    const { data: companies, error } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .order('company_name')
      .range(0, 9999); // Fetch up to 10,000 companies

    if (error) {
      console.error('[companies/all] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }

    return NextResponse.json({ companies });
  } catch (err) {
    console.error('[companies/all] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
