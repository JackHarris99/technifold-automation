/**
 * GET /api/admin/engagement/company-activity?company_ids=ABC001,ABC002
 * Returns engagement scores and recent activity for companies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export const maxDuration = 10;

// Event scoring weights (based on actual event_type values in engagement_events table)
const EVENT_SCORES = {
  // High value actions
  'purchase': 100,
  'trial_checkout_created': 80,
  'quote_requested': 50,

  // Medium value actions
  'quote_view': 10,
  'portal_view': 8,
  'email_sent': 5,
  'distributor_activity': 5,
  'quote_page_view': 8,

  // Lower value actions
  'reorder_reminder_sent': 3,
  'manual_activity': 2,
  'admin_action': 1,
  'payment_issue': -5,  // Negative score for payment failures
  'quote_lost': -10,
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
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const salesRepId = searchParams.get('sales_rep_id');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    const supabase = getSupabaseClient();

    // Calculate date boundaries
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch activity for customer companies (with optional sales rep filter)
    // Join to companies table to filter by type='customer' and status != 'dead'
    let query = supabase
      .from('engagement_events')
      .select(`
        event_id,
        company_id,
        event_type,
        event_name,
        source,
        url,
        occurred_at,
        meta,
        companies!inner (
          company_id,
          company_name,
          type,
          status,
          account_owner
        )
      `)
      .gte('occurred_at', thirtyDaysAgo)
      .eq('companies.type', 'customer')
      .neq('companies.status', 'dead')
      .not('company_id', 'is', null)
      .order('occurred_at', { ascending: false });

    // Apply sales rep filter if provided
    if (salesRepId) {
      query = query.eq('companies.account_owner', salesRepId);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('[CompanyActivity] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }

    // Process engagement data per company
    const engagementMap = new Map<string, CompanyEngagement & { company_name: string }>();

    // Process activities (filter out internal admin/sales rep previews)
    (activities || []).filter((a: any) => !a.meta?.internal_view).forEach((activity: any) => {
      const companyId = activity.company_id;
      if (!companyId) return;

      // Initialize engagement tracking for this company if not exists
      if (!engagementMap.has(companyId)) {
        engagementMap.set(companyId, {
          company_id: companyId,
          company_name: activity.companies.company_name,
          total_score: 0,
          score_30d: 0,
          score_7d: 0,
          last_activity_at: null,
          activity_count: 0,
          recent_events: [],
          heat_level: 'cold',
        });
      }

      const engagement = engagementMap.get(companyId)!;
      const eventScore = EVENT_SCORES[activity.event_type as keyof typeof EVENT_SCORES] || 1;

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
          activity_id: activity.event_id,
          event_type: activity.event_type,
          source: activity.source || 'unknown',
          url: activity.url || '',
          occurred_at: activity.occurred_at,
          score: eventScore,
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

    // Sort by 7-day score (most engaged first) and limit results
    const result = Array.from(engagementMap.values())
      .sort((a, b) => b.score_7d - a.score_7d)
      .slice(0, limit);

    return NextResponse.json({
      engagements: result,
      total_companies: engagementMap.size,
      total_activities: activities?.length || 0,
    });

  } catch (err) {
    console.error('[CompanyActivity] Exception:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
