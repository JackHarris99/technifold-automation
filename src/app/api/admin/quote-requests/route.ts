/**
 * GET /api/admin/quote-requests
 * Fetch all quote requests with company/contact details
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: quoteRequests, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        companies:company_id (
          company_id,
          company_name,
          country
        ),
        contacts:contact_id (
          contact_id,
          email,
          full_name,
          first_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[quote-requests] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch quote requests' }, { status: 500 });
    }

    return NextResponse.json({ quote_requests: quoteRequests || [] });
  } catch (err) {
    console.error('[quote-requests] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
