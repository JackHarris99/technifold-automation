/**
 * GET /api/admin/test-tokens/contacts?company_id=XXX
 * Fetch contacts for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('contact_id, email, full_name, first_name, last_name')
      .eq('company_id', companyId)
      .order('full_name');

    if (error) {
      console.error('[test-tokens] Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    return NextResponse.json({ contacts });
  } catch (err) {
    console.error('[test-tokens] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
