/**
 * POST /api/cron/daily-digest
 * Cron job endpoint to send daily digest emails to all sales reps
 * Should be called daily at 9:00 AM via Vercel Cron or external scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendDailyDigest } from '@/lib/salesNotifications';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'default-secret'}`;

    if (authHeader !== expectedAuth) {
      console.error('[cron/daily-digest] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[cron/daily-digest] Starting daily digest...');

    const supabase = getSupabaseClient();

    // Get all users with notification preferences enabled
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('user_id, daily_digest_enabled')
      .eq('daily_digest_enabled', true);

    // If no preferences exist, get all users (assume enabled by default)
    let userIds: string[];
    if (preferences && preferences.length > 0) {
      userIds = preferences.map(p => p.user_id);
    } else {
      const { data: allUsers } = await supabase
        .from('users')
        .select('user_id')
        .eq('role', 'sales_rep');

      userIds = allUsers?.map(u => u.user_id) || [];
    }

    // Get user details
    const { data: users } = await supabase
      .from('users')
      .select('user_id, email, full_name')
      .in('user_id', userIds);

    if (!users || users.length === 0) {
      console.log('[cron/daily-digest] No users to send digest to');
      return NextResponse.json({
        success: true,
        sent: 0,
        errors: 0,
      });
    }

    // Send digests in parallel
    const results = await Promise.allSettled(
      users.map(user =>
        sendDailyDigest({
          user_id: user.user_id,
          user_email: user.email,
          user_name: user.full_name || user.email,
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const errors = results.filter(r => r.status === 'rejected' || !(r.value as any).success).length;

    console.log(`[cron/daily-digest] Complete: ${sent} sent, ${errors} errors`);

    return NextResponse.json({
      success: true,
      sent,
      errors,
      total_users: users.length,
    });
  } catch (error) {
    console.error('[cron/daily-digest] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  // Check if running in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'GET method only available in development' },
      { status: 403 }
    );
  }

  console.log('[cron/daily-digest] Manual trigger (dev mode)');

  try {
    const supabase = getSupabaseClient();

    // Get first user for testing
    const { data: user } = await supabase
      .from('users')
      .select('user_id, email, full_name')
      .limit(1)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }

    const result = await sendDailyDigest({
      user_id: user.user_id,
      user_email: user.email,
      user_name: user.full_name || user.email,
    });

    return NextResponse.json({
      success: true,
      result,
      test_user: user.email,
    });
  } catch (error) {
    console.error('[cron/daily-digest] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
