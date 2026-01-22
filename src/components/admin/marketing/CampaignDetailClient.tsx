/**
 * Campaign Detail Client Component
 * Campaign stats, send control, and recipient list
 */

'use client';

import { useState } from 'react';

interface CampaignDetailClientProps {
  campaign: any;
  sendStats: Record<string, number>;
  recentSends: any[];
}

export default function CampaignDetailClient({
  campaign,
  sendStats,
  recentSends: initialRecentSends,
}: CampaignDetailClientProps) {
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [recentSends, setRecentSends] = useState(initialRecentSends);
  const [batchSize, setBatchSize] = useState(200);

  const handleSendBatch = async () => {
    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/admin/marketing/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.campaign_id,
          batch_size: batchSize,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      setSendResult(data);

      // Refresh the page to get updated stats
      window.location.reload();

    } catch (error: any) {
      console.error('Send error:', error);
      setSendResult({
        success: false,
        error: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const openRate = campaign.total_delivered > 0
    ? ((campaign.total_opens / campaign.total_delivered) * 100).toFixed(1)
    : '0.0';

  const clickRate = campaign.total_delivered > 0
    ? ((campaign.total_clicks / campaign.total_delivered) * 100).toFixed(1)
    : '0.0';

  const queuedCount = sendStats['queued'] || 0;
  const sentCount = sendStats['sent'] || 0;
  const deliveredCount = sendStats['delivered'] || 0;
  const failedCount = sendStats['failed'] || 0;
  const bouncedCount = sendStats['bounced'] || 0;

  return (
    <div className="space-y-6">
      {/* Campaign Stats */}
      <div>
        <h2 className="text-[18px] font-[700] text-[#0a0a0a] mb-4">Campaign Performance</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Total Recipients</div>
            <div className="text-[28px] font-[700] text-[#0a0a0a]">
              {campaign.total_recipients?.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Sent</div>
            <div className="text-[28px] font-[700] text-blue-600">
              {campaign.total_sent?.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Delivered</div>
            <div className="text-[28px] font-[700] text-green-600">
              {campaign.total_delivered?.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Open Rate</div>
            <div className="text-[28px] font-[700] text-green-600">
              {openRate}%
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1">
              {campaign.total_opens?.toLocaleString() || 0} opens
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Click Rate</div>
            <div className="text-[28px] font-[700] text-blue-600">
              {clickRate}%
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-1">
              {campaign.total_clicks?.toLocaleString() || 0} clicks
            </div>
          </div>
        </div>
      </div>

      {/* Send Status */}
      <div>
        <h2 className="text-[18px] font-[700] text-[#0a0a0a] mb-4">Send Status</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Queued</div>
            <div className="text-[28px] font-[700] text-gray-600">
              {queuedCount.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Sent</div>
            <div className="text-[28px] font-[700] text-blue-600">
              {sentCount.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Delivered</div>
            <div className="text-[28px] font-[700] text-green-600">
              {deliveredCount.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Failed</div>
            <div className="text-[28px] font-[700] text-red-600">
              {failedCount.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
            <div className="text-[12px] text-[#64748b] mb-2">Bounced</div>
            <div className="text-[28px] font-[700] text-orange-600">
              {bouncedCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Send Control */}
      {queuedCount > 0 && (
        <div className="bg-white rounded-xl border border-[#e8e8e8] p-6">
          <h3 className="text-[16px] font-[700] text-[#0a0a0a] mb-4">Send Emails</h3>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-[12px] text-[#64748b] mb-1 block">Batch Size</label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 200)}
                className="px-3 py-2 border border-[#e8e8e8] rounded-lg text-[14px] w-32"
                min={1}
                max={1000}
              />
            </div>
            <div className="flex-1">
              <button
                onClick={handleSendBatch}
                disabled={sending}
                className={`px-6 py-2 rounded-lg font-[600] text-[14px] ${
                  sending
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {sending ? 'Sending...' : `Send ${Math.min(batchSize, queuedCount)} Emails`}
              </button>
              <div className="text-[12px] text-[#64748b] mt-2">
                {queuedCount} emails remaining in queue
              </div>
            </div>
          </div>

          {sendResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              sendResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {sendResult.success ? (
                <div>
                  <div className="font-[600] text-[14px] text-green-700">
                    Successfully sent {sendResult.sent} emails
                  </div>
                  {sendResult.failed > 0 && (
                    <div className="text-[13px] text-red-600 mt-1">
                      {sendResult.failed} emails failed
                    </div>
                  )}
                  {sendResult.remaining > 0 && (
                    <div className="text-[13px] text-[#64748b] mt-1">
                      {sendResult.remaining} emails remaining
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[14px] text-red-700">
                  Error: {sendResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Email Preview */}
      <div className="bg-white rounded-xl border border-[#e8e8e8]">
        <div className="border-b border-[#e8e8e8] p-6">
          <h3 className="text-[16px] font-[700] text-[#0a0a0a]">Email Preview</h3>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <div className="text-[12px] text-[#64748b] mb-1">Subject</div>
            <div className="text-[14px] font-[600] text-[#0a0a0a]">{campaign.email_subject}</div>
          </div>
          <div>
            <div className="text-[12px] text-[#64748b] mb-2">Body</div>
            <div
              className="border border-[#e8e8e8] rounded-lg p-4 max-h-[400px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: campaign.email_body_html }}
            />
          </div>
        </div>
      </div>

      {/* Recent Sends */}
      <div className="bg-white rounded-xl border border-[#e8e8e8]">
        <div className="border-b border-[#e8e8e8] p-6">
          <h3 className="text-[16px] font-[700] text-[#0a0a0a]">Recent Sends</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#e8e8e8]">
              <tr>
                <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Recipient</th>
                <th className="text-center py-3 px-4 text-[12px] font-[600] text-[#64748b]">Status</th>
                <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Opens</th>
                <th className="text-right py-3 px-4 text-[12px] font-[600] text-[#64748b]">Clicks</th>
                <th className="text-left py-3 px-4 text-[12px] font-[600] text-[#64748b]">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {recentSends.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#64748b]">
                    No sends yet
                  </td>
                </tr>
              ) : (
                recentSends.map((send) => (
                  <tr key={send.send_id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                    <td className="py-3 px-4">
                      <div className="font-[600] text-[13px] text-[#0a0a0a]">
                        {send.prospect_contacts?.prospect_companies?.company_name || 'Unknown'}
                      </div>
                      <div className="text-[12px] text-[#64748b] mt-1">{send.email_address}</div>
                      {send.error_message && (
                        <div className="text-[11px] text-red-600 mt-1">{send.error_message}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-[600] ${
                        send.send_status === 'delivered' ? 'bg-green-100 text-green-700' :
                        send.send_status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        send.send_status === 'bounced' ? 'bg-orange-100 text-orange-700' :
                        send.send_status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {send.send_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                      {send.total_opens || 0}
                      {send.opened_at && (
                        <div className="text-[11px] text-[#94a3b8]">
                          First: {new Date(send.opened_at).toLocaleDateString('en-GB')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-[13px] text-[#0a0a0a]">
                      {send.total_clicks || 0}
                      {send.clicked_at && (
                        <div className="text-[11px] text-[#94a3b8]">
                          First: {new Date(send.clicked_at).toLocaleDateString('en-GB')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[13px] text-[#64748b]">
                      {send.sent_at
                        ? new Date(send.sent_at).toLocaleString('en-GB')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
