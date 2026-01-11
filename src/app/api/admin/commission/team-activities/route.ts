/**
 * Get team activity metrics for comparison
 * NO revenue comparison - only activity counts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Get current month boundaries
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthStart = firstDayOfMonth.toISOString();
    const monthEnd = firstDayOfNextMonth.toISOString();

    // Get all sales reps
    const { data: reps } = await supabase
      .from('sales_reps')
      .select('sales_rep_id, full_name')
      .order('full_name');

    if (!reps || reps.length === 0) {
      return NextResponse.json({
        month: firstDayOfMonth.toISOString().substring(0, 7),
        reps: [],
      });
    }

    // Get activities for all reps
    const repsWithActivities = await Promise.all(
      reps.map(async (rep) => {
        // Count calls
        const { count: callsCount } = await supabase
          .from('engagement_events')
          .select('event_id', { count: 'exact', head: true })
          .ilike('event_name', 'manual_contact_call%')
          .gte('occurred_at', monthStart)
          .lt('occurred_at', monthEnd);

        // Count visits
        const { count: visitsCount } = await supabase
          .from('engagement_events')
          .select('event_id', { count: 'exact', head: true })
          .ilike('event_name', 'manual_contact_visit%')
          .gte('occurred_at', monthStart)
          .lt('occurred_at', monthEnd);

        // Count emails
        const { count: emailsCount } = await supabase
          .from('engagement_events')
          .select('event_id', { count: 'exact', head: true })
          .ilike('event_name', 'manual_contact_email%')
          .gte('occurred_at', monthStart)
          .lt('occurred_at', monthEnd);

        // Count followups
        const { count: followupsCount } = await supabase
          .from('engagement_events')
          .select('event_id', { count: 'exact', head: true })
          .ilike('event_name', 'manual_contact_followup%')
          .gte('occurred_at', monthStart)
          .lt('occurred_at', monthEnd);

        // Count meetings
        const { count: meetingsCount } = await supabase
          .from('engagement_events')
          .select('event_id', { count: 'exact', head: true })
          .ilike('event_name', 'manual_contact_meeting%')
          .gte('occurred_at', monthStart)
          .lt('occurred_at', monthEnd);

        // Count quotes sent
        const { count: quotesCount } = await supabase
          .from('quotes')
          .select('quote_id', { count: 'exact', head: true })
          .eq('created_by', rep.sales_rep_id)
          .not('sent_at', 'is', null)
          .gte('sent_at', monthStart)
          .lt('sent_at', monthEnd);

        return {
          rep_id: rep.sales_rep_id,
          full_name: rep.full_name,
          activities: {
            calls: callsCount || 0,
            visits: visitsCount || 0,
            quotes_sent: quotesCount || 0,
            emails: emailsCount || 0,
            followups: followupsCount || 0,
            meetings: meetingsCount || 0,
          },
        };
      })
    );

    return NextResponse.json({
      month: firstDayOfMonth.toISOString().substring(0, 7),
      reps: repsWithActivities,
    });
  } catch (error) {
    console.error('Error fetching team activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team activities' },
      { status: 500 }
    );
  }
}
