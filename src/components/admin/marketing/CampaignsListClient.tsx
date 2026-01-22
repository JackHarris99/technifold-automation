/**
 * Campaigns List Client Component
 * Filterable table of campaigns with stats
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  campaign_code: string | null;
  status: string;
  email_subject: string;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opens: number;
  total_clicks: number;
  sent_at: string | null;
  created_at: string;
}

interface CampaignsListClientProps {
  campaigns: Campaign[];
}

export default function CampaignsListClient({ campaigns: initialCampaigns }: CampaignsListClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter campaigns
  const campaigns = useMemo(() => {
    if (statusFilter === 'all') return initialCampaigns;
    return initialCampaigns.filter(c => c.status === statusFilter);
  }, [initialCampaigns, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-yellow-100 text-yellow-700',
      active: 'bg-blue-100 text-blue-700',
      sending: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      paused: 'bg-orange-100 text-orange-700',
      failed: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const calculateOpenRate = (campaign: Campaign) => {
    if (campaign.total_delivered === 0) return 0;
    return ((campaign.total_opens / campaign.total_delivered) * 100).toFixed(1);
  };

  const calculateClickRate = (campaign: Campaign) => {
    if (campaign.total_delivered === 0) return 0;
    return ((campaign.total_clicks / campaign.total_delivered) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e8e8e8]">
      {/* Filters */}
      <div className="p-6 border-b border-[#e8e8e8]">
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[#e8e8e8] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="sending">Sending</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="failed">Failed</option>
          </select>

          <div className="text-[12px] text-[#64748b]">
            Showing {campaigns.length} of {initialCampaigns.length} campaigns
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f8fafc] border-b border-[#e8e8e8]">
            <tr>
              <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Campaign</th>
              <th className="text-center py-3 px-4 text-[12px] font-[600] text-[#64748b]">Status</th>
              <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Recipients</th>
              <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Sent</th>
              <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Open Rate</th>
              <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Click Rate</th>
              <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Sent Date</th>
              <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#64748b]">
                  No campaigns found
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.campaign_id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <td className="py-3 px-4">
                    <div className="font-[600] text-[13px] text-[#0a0a0a]">{campaign.campaign_name}</div>
                    <div className="text-[12px] text-[#64748b] mt-1">{campaign.email_subject}</div>
                    {campaign.campaign_code && (
                      <div className="text-[11px] text-[#94a3b8] mt-1">{campaign.campaign_code}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-[600] ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                    {campaign.total_recipients.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                    {campaign.total_sent.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                    {calculateOpenRate(campaign)}%
                  </td>
                  <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                    {calculateClickRate(campaign)}%
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
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/marketing/campaigns/${campaign.campaign_id}`}
                      className="text-blue-600 hover:text-blue-700 font-[500] text-[13px]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
