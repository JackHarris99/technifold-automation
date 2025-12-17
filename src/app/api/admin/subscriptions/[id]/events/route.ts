/**
 * GET /api/admin/subscriptions/[id]/events
 * Fetch events for a subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscription_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: events, error } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('[subscriptions/[id]/events] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: events || [],
    });
  } catch (error) {
    console.error('[subscriptions/[id]/events] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
