/**
 * Campaign Detail Page
 * View campaign stats and control sending
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import CampaignDetailClient from '@/components/admin/marketing/CampaignDetailClient';

interface Props {
  params: Promise<{ campaign_id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'director') {
    redirect('/admin');
  }

  const { campaign_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch campaign
  const { data: campaign, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('campaign_id', campaign_id)
    .single();

  if (error || !campaign) {
    notFound();
  }

  // Fetch send statistics
  const { data: sendStats } = await supabase
    .from('campaign_sends')
    .select('send_status')
    .eq('campaign_id', campaign_id);

  const stats = sendStats?.reduce((acc, send) => {
    acc[send.send_status] = (acc[send.send_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Fetch recent sends with details
  const { data: recentSends } = await supabase
    .from('campaign_sends')
    .select(`
      send_id,
      email_address,
      send_status,
      sent_at,
      opened_at,
      clicked_at,
      total_opens,
      total_clicks,
      error_message,
      prospect_contacts (
        first_name,
        last_name,
        full_name,
        prospect_companies (
          company_name
        )
      )
    `)
    .eq('campaign_id', campaign_id)
    .order('sent_at', { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <a
              href="/admin/marketing/campaigns/list"
              className="text-[#64748b] hover:text-[#0a0a0a] text-[14px]"
            >
              ← Back to Campaigns
            </a>
          </div>
          <h1 className="text-[28px] font-[700] text-[#0a0a0a]">{campaign.campaign_name}</h1>
          <p className="text-[14px] text-[#64748b] mt-1">{campaign.email_subject}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-[600] ${
              campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
              campaign.status === 'active' ? 'bg-blue-100 text-blue-700' :
              campaign.status === 'sending' ? 'bg-purple-100 text-purple-700' :
              campaign.status === 'completed' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {campaign.status}
            </span>
            {campaign.campaign_code && (
              <span className="text-[13px] text-[#64748b]">
                Code: <span className="font-[600]">{campaign.campaign_code}</span>
              </span>
            )}
            {campaign.sending_domain && (
              <span className="text-[13px] text-[#64748b]">
                Domain: <span className="font-[600]">{campaign.sending_domain}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CampaignDetailClient
          campaign={campaign}
          sendStats={stats}
          recentSends={recentSends || []}
        />
      </div>
    </div>
  );
}
