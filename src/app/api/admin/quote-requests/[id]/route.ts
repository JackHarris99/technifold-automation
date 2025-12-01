/**
 * PATCH /api/admin/quote-requests/[id]
 * Update quote request status and details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('quote_requests')
      .update(body)
      .eq('quote_request_id', id)
      .select()
      .single();

    if (error) {
      console.error('[quote-requests/update] Error:', error);
      return NextResponse.json({ error: 'Failed to update quote request' }, { status: 500 });
    }

    return NextResponse.json({ quote_request: data });
  } catch (err) {
    console.error('[quote-requests/update] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
