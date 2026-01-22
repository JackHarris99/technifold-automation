/**
 * Campaigns List Page
 * View all marketing campaigns with stats
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import CampaignsListClient from '@/components/admin/marketing/CampaignsListClient';

export default async function CampaignsListPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'director') {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Fetch all campaigns with stats
  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-[700] text-[#0a0a0a]">Campaigns</h1>
              <p className="text-[14px] text-[#64748b] mt-1">
                {campaigns?.length || 0} campaigns created
              </p>
            </div>
            <a
              href="/admin/marketing/campaigns/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-[600] text-[14px] hover:bg-blue-700 transition-colors"
            >
              Create Campaign
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CampaignsListClient campaigns={campaigns || []} />
      </div>
    </div>
  );
}
