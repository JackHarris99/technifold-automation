/**
 * Prospect Detail Page
 * Individual prospect view with engagement timeline
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import ProspectDetailClient from '@/components/admin/marketing/ProspectDetailClient';

interface Props {
  params: Promise<{ prospect_id: string }>;
}

export default async function ProspectDetailPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'director') {
    redirect('/admin');
  }

  const { prospect_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch prospect company
  const { data: prospect, error } = await supabase
    .from('prospect_companies')
    .select('*')
    .eq('prospect_company_id', prospect_id)
    .single();

  if (error || !prospect) {
    notFound();
  }

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('prospect_contacts')
    .select('*')
    .eq('prospect_company_id', prospect_id)
    .order('created_at', { ascending: false });

  // Fetch engagement events
  const { data: events } = await supabase
    .from('engagement_events')
    .select('*')
    .eq('prospect_company_id', prospect_id)
    .order('occurred_at', { ascending: false })
    .limit(100);

  // Fetch campaign sends for this prospect
  const { data: campaignSends } = await supabase
    .from('campaign_sends')
    .select(`
      send_id,
      campaign_id,
      send_status,
      sent_at,
      opened_at,
      clicked_at,
      total_opens,
      total_clicks,
      marketing_campaigns (
        campaign_name,
        email_subject
      )
    `)
    .eq('prospect_company_id', prospect_id)
    .order('sent_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <a
              href="/admin/marketing/prospects/list"
              className="text-[#64748b] hover:text-[#0a0a0a] text-[14px]"
            >
              ← Back to Prospects
            </a>
          </div>
          <h1 className="text-[28px] font-[700] text-[#0a0a0a]">{prospect.company_name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-[600] ${
              prospect.lead_status === 'hot' ? 'bg-orange-100 text-orange-700' :
              prospect.lead_status === 'warm' ? 'bg-yellow-100 text-yellow-700' :
              prospect.lead_status === 'qualified' ? 'bg-purple-100 text-purple-700' :
              prospect.lead_status === 'converted' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {prospect.lead_status}
            </span>
            <span className="text-[14px] text-[#64748b]">
              Score: <span className="font-[600] text-[#0a0a0a]">{prospect.lead_score}</span>
            </span>
            <span className="text-[14px] text-[#64748b]">
              Source: <span className="font-[500]">{prospect.source}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProspectDetailClient
          prospect={prospect}
          contacts={contacts || []}
          events={events || []}
          campaignSends={campaignSends || []}
        />
      </div>
    </div>
  );
}
