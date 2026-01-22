/**
 * Campaign Creation Page
 * Build and send email campaigns to prospects
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import CampaignCreateClient from '@/components/admin/marketing/CampaignCreateClient';

export default async function CampaignCreatePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'director') {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Get prospect counts by status for targeting
  const { data: prospects } = await supabase
    .from('prospect_companies')
    .select('lead_status');

  const counts = {
    total: prospects?.length || 0,
    cold: prospects?.filter(p => p.lead_status === 'cold').length || 0,
    warm: prospects?.filter(p => p.lead_status === 'warm').length || 0,
    hot: prospects?.filter(p => p.lead_status === 'hot').length || 0,
    qualified: prospects?.filter(p => p.lead_status === 'qualified').length || 0,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-[28px] font-[700] text-[#0a0a0a]">Create Campaign</h1>
          <p className="text-[14px] text-[#64748b] mt-1">
            Send targeted emails to your prospects
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <CampaignCreateClient prospectCounts={counts} />
      </div>
    </div>
  );
}
