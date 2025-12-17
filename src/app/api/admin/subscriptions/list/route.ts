/**
 * GET /api/admin/subscriptions/list
 * Fetch all subscriptions and anomalies
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Load subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('v_active_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('[subscriptions/list] Error:', subsError);
      return NextResponse.json(
        { error: subsError.message },
        { status: 500 }
      );
    }

    // Load anomalies (ratchet violations) - optional view
    const { data: anomalies, error: anomalyError } = await supabase
      .from('v_subscription_anomalies')
      .select('*')
      .order('updated_at', { ascending: false });

    if (anomalyError) {
      console.warn('[subscriptions/list] Anomaly load error (view may not exist):', anomalyError);
      // Don't fail if view doesn't exist
    }

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions || [],
      anomalies: anomalies || [],
    });
  } catch (error) {
    console.error('[subscriptions/list] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
