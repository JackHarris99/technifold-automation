/**
 * Marketing Analytics Dashboard
 * Overview of campaigns, prospects, and engagement
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import MarketingDashboardClient from '@/components/admin/marketing/MarketingDashboardClient';

export default async function MarketingDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'director') {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Fetch campaign stats
  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch prospect counts by status
  const { data: prospects } = await supabase
    .from('prospect_companies')
    .select('lead_status, lead_score');

  // Fetch recent engagement events
  const { data: recentEngagement } = await supabase
    .from('engagement_events')
    .select(`
      event_id,
      event_type,
      occurred_at,
      meta,
      prospect_contacts (
        email,
        prospect_companies (
          company_name
        )
      )
    `)
    .order('occurred_at', { ascending: false })
    .limit(50);

  // Calculate campaign totals
  const campaignStats = campaigns?.reduce((acc, c) => ({
    totalRecipients: acc.totalRecipients + (c.total_recipients || 0),
    totalSent: acc.totalSent + (c.total_sent || 0),
    totalDelivered: acc.totalDelivered + (c.total_delivered || 0),
    totalOpens: acc.totalOpens + (c.total_opens || 0),
    totalClicks: acc.totalClicks + (c.total_clicks || 0),
  }), {
    totalRecipients: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalOpens: 0,
    totalClicks: 0,
  }) || {
    totalRecipients: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalOpens: 0,
    totalClicks: 0,
  };

  // Calculate prospect stats
  const prospectStats = prospects?.reduce((acc, p) => {
    acc.total++;
    acc.byStatus[p.lead_status] = (acc.byStatus[p.lead_status] || 0) + 1;

    if (p.lead_score >= 100) acc.byScore['100+']++;
    else if (p.lead_score >= 50) acc.byScore['50-99']++;
    else if (p.lead_score >= 20) acc.byScore['20-49']++;
    else acc.byScore['0-19']++;

    return acc;
  }, {
    total: 0,
    byStatus: {} as Record<string, number>,
    byScore: {
      '0-19': 0,
      '20-49': 0,
      '50-99': 0,
      '100+': 0,
    }
  }) || {
    total: 0,
    byStatus: {},
    byScore: { '0-19': 0, '20-49': 0, '50-99': 0, '100+': 0 }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-[28px] font-[700] text-[#0a0a0a]">Marketing Dashboard</h1>
          <p className="text-[14px] text-[#64748b] mt-1">
            Overview of campaigns, prospects, and engagement
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <MarketingDashboardClient
          campaigns={campaigns || []}
          campaignStats={campaignStats}
          prospectStats={prospectStats}
          recentEngagement={(recentEngagement || []).filter((e: any) => !e.meta?.internal_view).slice(0, 20)}
        />
      </div>
    </div>
  );
}
