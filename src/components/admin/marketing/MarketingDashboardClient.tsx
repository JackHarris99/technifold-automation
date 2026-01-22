/**
 * Marketing Dashboard Client Component
 * Stats, charts, and recent activity
 */

'use client';

import Link from 'next/link';

interface MarketingDashboardClientProps {
  campaigns: any[];
  campaignStats: {
    totalRecipients: number;
    totalSent: number;
    totalDelivered: number;
    totalOpens: number;
    totalClicks: number;
  };
  prospectStats: {
    total: number;
    byStatus: Record<string, number>;
    byScore: {
      '0-19': number;
      '20-49': number;
      '50-99': number;
      '100+': number;
    };
  };
  recentEngagement: any[];
}

export default function MarketingDashboardClient({
  campaigns,
  campaignStats,
  prospectStats,
  recentEngagement,
}: MarketingDashboardClientProps) {
  const overallOpenRate = campaignStats.totalDelivered > 0
    ? ((campaignStats.totalOpens / campaignStats.totalDelivered) * 100).toFixed(1)
    : '0.0';

  const overallClickRate = campaignStats.totalDelivered > 0
    ? ((campaignStats.totalClicks / campaignStats.totalDelivered) * 100).toFixed(1)
    : '0.0';

  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'sending');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/marketing/campaigns/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-[600] text-[14px] hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </Link>
        <Link
          href="/admin/marketing/prospects/import"
          className="px-4 py-2 border border-[#e8e8e8] rounded-lg font-[600] text-[14px] hover:bg-[#f8fafc] transition-colors"
        >
          Import Prospects
        </Link>
        <Link
          href="/admin/marketing/campaigns/list"
          className="px-4 py-2 border border-[#e8e8e8] rounded-lg font-[600] text-[14px] hover:bg-[#f8fafc] transition-colors"
        >
          View All Campaigns
        </Link>
        <Link
          href="/admin/marketing/prospects/list"
          className="px-4 py-2 border border-[#e8e8e8] rounded-lg font-[600] text-[14px] hover:bg-[#f8fafc] transition-colors"
        >
          View All Prospects
        </Link>
      </div>

      {/* Campaign Performance Metrics */}
      <div>
        <h2 className="text-[18px] font-[700] text-[#0a0a0a] mb-4">Campaign Performance</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Total Recipients</div>
            <div className="text-[28px] font-[700] text-[#0a0a0a]">
              {campaignStats.totalRecipients.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Emails Sent</div>
            <div className="text-[28px] font-[700] text-[#0a0a0a]">
              {campaignStats.totalSent.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Delivered</div>
            <div className="text-[28px] font-[700] text-[#0a0a0a]">
              {campaignStats.totalDelivered.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Open Rate</div>
            <div className="text-[28px] font-[700] text-green-600">
              {overallOpenRate}%
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1">
              {campaignStats.totalOpens.toLocaleString()} opens
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Click Rate</div>
            <div className="text-[28px] font-[700] text-blue-600">
              {overallClickRate}%
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1">
              {campaignStats.totalClicks.toLocaleString()} clicks
            </div>
          </div>
        </div>
      </div>

      {/* Prospect Pipeline */}
      <div>
        <h2 className="text-[18px] font-[700] text-[#0a0a0a] mb-4">Prospect Pipeline</h2>
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Total Prospects</div>
            <div className="text-[28px] font-[700] text-[#0a0a0a]">
              {prospectStats.total.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Cold</div>
            <div className="text-[28px] font-[700] text-gray-600">
              {(prospectStats.byStatus['cold'] || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Warm</div>
            <div className="text-[28px] font-[700] text-yellow-600">
              {(prospectStats.byStatus['warm'] || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Hot</div>
            <div className="text-[28px] font-[700] text-orange-600">
              {(prospectStats.byStatus['hot'] || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Qualified</div>
            <div className="text-[28px] font-[700] text-purple-600">
              {(prospectStats.byStatus['qualified'] || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Converted</div>
            <div className="text-[28px] font-[700] text-green-600">
              {(prospectStats.byStatus['converted'] || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Score Distribution */}
      <div>
        <h2 className="text-[18px] font-[700] text-[#0a0a0a] mb-4">Lead Score Distribution</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">0-19 Points</div>
            <div className="text-[28px] font-[700] text-gray-600">
              {prospectStats.byScore['0-19'].toLocaleString()}
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1">Low engagement</div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">20-49 Points</div>
            <div className="text-[28px] font-[700] text-yellow-600">
              {prospectStats.byScore['20-49'].toLocaleString()}
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1">Some interest</div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">50-99 Points</div>
            <div className="text-[28px] font-[700] text-orange-600">
              {prospectStats.byScore['50-99'].toLocaleString()}
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1">Engaged</div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">100+ Points</div>
            <div className="text-[28px] font-[700] text-green-600">
              {prospectStats.byScore['100+'].toLocaleString()}
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1">Hot leads</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-[700] text-[#0a0a0a]">
              Active Campaigns ({activeCampaigns.length})
            </h2>
            <Link
              href="/admin/marketing/campaigns/list"
              className="text-[13px] text-blue-600 hover:text-blue-700 font-[600]"
            >
              View All
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8]">
            {activeCampaigns.length === 0 ? (
              <div className="p-12 text-center text-[#64748b]">
                No active campaigns
              </div>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {activeCampaigns.slice(0, 5).map((campaign) => (
                  <Link
                    key={campaign.campaign_id}
                    href={`/admin/marketing/campaigns/${campaign.campaign_id}`}
                    className="block p-4 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="font-[600] text-[14px] text-[#0a0a0a]">
                      {campaign.campaign_name}
                    </div>
                    <div className="text-[12px] text-[#64748b] mt-1">
                      {campaign.email_subject}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[12px] text-[#64748b]">
                      <span>{campaign.total_recipients?.toLocaleString() || 0} recipients</span>
                      <span>{campaign.total_sent?.toLocaleString() || 0} sent</span>
                      <span className={`px-2 py-1 rounded-full text-[11px] font-[600] ${
                        campaign.status === 'sending'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Engagement */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-[700] text-[#0a0a0a]">
              Recent Engagement
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8]">
            {recentEngagement.length === 0 ? (
              <div className="p-12 text-center text-[#64748b]">
                No engagement yet
              </div>
            ) : (
              <div className="divide-y divide-[#f1f5f9] max-h-[400px] overflow-y-auto">
                {recentEngagement.map((event) => (
                  <div key={event.event_id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-[600] text-[13px] text-[#0a0a0a]">
                          {event.prospect_contacts?.prospect_companies?.company_name || 'Unknown'}
                        </div>
                        <div className="text-[12px] text-[#64748b] mt-1">
                          {event.prospect_contacts?.email}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-[600] text-blue-600">
                            {event.event_type}
                          </span>
                          <span className="text-[11px] text-[#94a3b8]">
                            {new Date(event.occurred_at).toLocaleString('en-GB')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Summary */}
      {completedCampaigns.length > 0 && (
        <div>
          <h2 className="text-[18px] font-[700] text-[#0a0a0a] mb-4">
            Completed Campaigns ({completedCampaigns.length})
          </h2>
          <div className="bg-white rounded-xl border border-[#e8e8e8]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#e8e8e8]">
                  <tr>
                    <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Campaign</th>
                    <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Sent</th>
                    <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Delivered</th>
                    <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Open Rate</th>
                    <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Click Rate</th>
                    <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Sent Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completedCampaigns.slice(0, 10).map((campaign) => {
                    const openRate = campaign.total_delivered > 0
                      ? ((campaign.total_opens / campaign.total_delivered) * 100).toFixed(1)
                      : '0.0';
                    const clickRate = campaign.total_delivered > 0
                      ? ((campaign.total_clicks / campaign.total_delivered) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={campaign.campaign_id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/marketing/campaigns/${campaign.campaign_id}`}
                            className="font-[600] text-[13px] text-blue-600 hover:text-blue-700"
                          >
                            {campaign.campaign_name}
                          </Link>
                          <div className="text-[12px] text-[#64748b] mt-1">
                            {campaign.email_subject}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                          {campaign.total_sent?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                          {campaign.total_delivered?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-[13px] font-[600] text-green-600">
                          {openRate}%
                        </td>
                        <td className="py-3 px-4 text-right text-[13px] font-[600] text-blue-600">
                          {clickRate}%
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#64748b]">
                          {campaign.sent_at
                            ? new Date(campaign.sent_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
