/**
 * POST /api/offers/[offerId]/convert
 * Mark offer as converted when they start trial or request quote
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const { offerId } = params;
    const body = await request.json();
    const { conversion_type } = body; // 'trial', 'quote_request', 'purchase'

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('offer_intents')
      .update({
        status: 'converted',
        converted_at: new Date().toISOString(),
        conversion_type,
      })
      .eq('offer_intent_id', offerId);

    if (error) {
      console.error('[Offer Convert] Error:', error);
      return NextResponse.json(
        { error: 'Failed to update offer status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Offer Convert] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
