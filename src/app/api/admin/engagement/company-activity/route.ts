/**
 * GET /api/admin/engagement/company-activity?company_ids=ABC001,ABC002
 * Returns engagement scores and recent activity for companies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export const maxDuration = 10;

// Event scoring weights
const EVENT_SCORES = {
  // High value actions
  'order_placed': 100,
  'subscription_created': 80,
  'quote_requested': 50,
  'trial_started': 40,

  // Medium value actions
  'reorder_view': 10,
  'quote_view': 8,
  'offer_view': 6,
  'product_view': 5,
  'solution_page_view': 4,
  'machine_page_view': 3,

  // Lower value actions
  'email_click': 2,
  'page_view': 1,
  'subscription_page_view': 2,
};

interface CompanyEngagement {
  company_id: string;
  total_score: number;
  score_30d: number;
  score_7d: number;
  last_activity_at: string | null;
  activity_count: number;
  recent_events: ActivityEvent[];
  heat_level: 'cold' | 'warm' | 'hot' | 'fire';
}

interface ActivityEvent {
  activity_id: string;
  event_type: string;
  source: string;
  url: string;
  occurred_at: string;
  score: number;
  object_type?: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const companyIdsParam = searchParams.get('company_ids');

    if (!companyIdsParam) {
      return NextResponse.json({ error: 'company_ids required' }, { status: 400 });
    }

    const companyIds = companyIdsParam.split(',').map(id => id.trim());
    const supabase = getSupabaseClient();

    // Calculate date boundaries
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch activity for all companies
    const { data: activities, error } = await supabase
      .from('activity_tracking')
      .select('activity_id, customer_company_id, event_type, source, url, occurred_at, object_type')
      .in('customer_company_id', companyIds)
      .order('occurred_at', { ascending: false })
      .limit(500); // Get last 500 events across all companies

    if (error) {
      console.error('[CompanyActivity] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }

    // Process engagement data per company
    const engagementMap = new Map<string, CompanyEngagement>();

    companyIds.forEach(companyId => {
      engagementMap.set(companyId, {
        company_id: companyId,
        total_score: 0,
        score_30d: 0,
        score_7d: 0,
        last_activity_at: null,
        activity_count: 0,
        recent_events: [],
        heat_level: 'cold',
      });
    });

    // Process activities
    (activities || []).forEach(activity => {
      const companyId = activity.customer_company_id;
      if (!companyId) return;

      const engagement = engagementMap.get(companyId);
      if (!engagement) return;

      const eventScore = EVENT_SCORES[activity.event_type as keyof typeof EVENT_SCORES] || 1;
      const occurredAt = new Date(activity.occurred_at);

      // Add to total score
      engagement.total_score += eventScore;
      engagement.activity_count += 1;

      // Add to time-bounded scores
      if (activity.occurred_at >= thirtyDaysAgo) {
        engagement.score_30d += eventScore;
      }
      if (activity.occurred_at >= sevenDaysAgo) {
        engagement.score_7d += eventScore;
      }

      // Update last activity
      if (!engagement.last_activity_at || activity.occurred_at > engagement.last_activity_at) {
        engagement.last_activity_at = activity.occurred_at;
      }

      // Add to recent events (keep top 20 per company)
      if (engagement.recent_events.length < 20) {
        engagement.recent_events.push({
          activity_id: activity.activity_id,
          event_type: activity.event_type,
          source: activity.source,
          url: activity.url,
          occurred_at: activity.occurred_at,
          score: eventScore,
          object_type: activity.object_type || undefined,
        });
      }
    });

    // Calculate heat levels
    engagementMap.forEach(engagement => {
      const score = engagement.score_7d; // Use 7-day score for heat

      if (score >= 50) engagement.heat_level = 'fire';
      else if (score >= 20) engagement.heat_level = 'hot';
      else if (score >= 5) engagement.heat_level = 'warm';
      else engagement.heat_level = 'cold';
    });

    const result = Array.from(engagementMap.values());

    return NextResponse.json({
      engagements: result,
      total_activities: activities?.length || 0,
    });

  } catch (err) {
    console.error('[CompanyActivity] Exception:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
