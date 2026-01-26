/**
 * Prospect Detail Client Component
 * Shows prospect info, contacts, and engagement timeline
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProspectDetailClientProps {
  prospect: any;
  contacts: any[];
  events: any[];
  campaignSends: any[];
}

export default function ProspectDetailClient({
  prospect,
  contacts,
  events,
  campaignSends,
}: ProspectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'campaigns'>('overview');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const router = useRouter();

  const handleConvertToCustomer = async () => {
    setConverting(true);
    setConvertError(null);

    try {
      const response = await fetch('/api/admin/prospects/convert-to-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_company_id: prospect.prospect_company_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert prospect');
      }

      // Success! Redirect to the new customer page
      alert(`✅ ${data.message}\n\n${data.migrated_contacts} contact(s) migrated.`);
      router.push(`/admin/company/${data.company.company_id}`);
      router.refresh();
    } catch (error: any) {
      console.error('[Convert Prospect] Error:', error);
      setConvertError(error.message);
      setConverting(false);
    }
  };

  // Don't show convert button if already converted
  const isConverted = prospect.lead_status === 'converted';

  return (
    <div className="space-y-6">
      {/* Action Bar - Convert to Customer */}
      {!isConverted && (
        <div className="bg-white rounded-xl border border-[#e8e8e8] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-[600] text-[#0a0a0a]">Ready to convert?</h3>
              <p className="text-[12px] text-[#64748b] mt-1">
                Convert this prospect to a customer and assign to a sales rep
              </p>
            </div>
            <button
              onClick={() => setShowConvertModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[14px] font-[600] transition-colors"
            >
              Convert to Customer
            </button>
          </div>
        </div>
      )}

      {/* Conversion Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-[20px] font-[700] text-[#0a0a0a] mb-2">
                Convert to Customer?
              </h2>
              <p className="text-[14px] text-[#64748b] mb-4">
                This will:
              </p>
              <ul className="list-disc list-inside text-[14px] text-[#64748b] space-y-1 mb-6">
                <li>Create a new customer record</li>
                <li>Auto-assign to sales rep (fair distribution)</li>
                <li>Migrate {contacts.length} contact(s)</li>
                <li>Mark this prospect as "converted"</li>
                <li>Move to Sales Centre</li>
              </ul>

              {convertError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-[13px] mb-4">
                  {convertError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConvertModal(false);
                    setConvertError(null);
                  }}
                  disabled={converting}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-[14px] font-[600] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvertToCustomer}
                  disabled={converting}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[14px] font-[600] transition-colors disabled:opacity-50"
                >
                  {converting ? 'Converting...' : 'Yes, Convert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#e8e8e8]">
        <div className="border-b border-[#e8e8e8]">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-[14px] font-[600] border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[#64748b] hover:text-[#0a0a0a]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-3 text-[14px] font-[600] border-b-2 transition-colors ${
                activeTab === 'timeline'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[#64748b] hover:text-[#0a0a0a]'
              }`}
            >
              Engagement Timeline ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-6 py-3 text-[14px] font-[600] border-b-2 transition-colors ${
                activeTab === 'campaigns'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[#64748b] hover:text-[#0a0a0a]'
              }`}
            >
              Campaigns ({campaignSends.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Company Info */}
              <div>
                <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-4">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-[#64748b] mb-1">Website</div>
                    <div className="text-[14px] text-[#0a0a0a]">{prospect.website || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#64748b] mb-1">Industry</div>
                    <div className="text-[14px] text-[#0a0a0a]">{prospect.industry || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#64748b] mb-1">Country</div>
                    <div className="text-[14px] text-[#0a0a0a]">{prospect.country || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#64748b] mb-1">Employee Range</div>
                    <div className="text-[14px] text-[#0a0a0a]">{prospect.employee_count_range || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#64748b] mb-1">Last Engaged</div>
                    <div className="text-[14px] text-[#0a0a0a]">
                      {prospect.last_engaged_at
                        ? new Date(prospect.last_engaged_at).toLocaleString('en-GB')
                        : 'Never'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#64748b] mb-1">Created</div>
                    <div className="text-[14px] text-[#0a0a0a]">
                      {new Date(prospect.created_at).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Proposed Plant List */}
              {prospect.identified_machines && prospect.identified_machines.length > 0 && (
                <div>
                  <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-4">
                    Proposed Plant List (Based on Page Visits)
                  </h3>
                  <div className="space-y-3">
                    {prospect.identified_machines
                      .sort((a: any, b: any) => {
                        // Sort by confidence (high, medium, low)
                        const confidenceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
                        return (confidenceOrder[b.confidence] || 0) - (confidenceOrder[a.confidence] || 0);
                      })
                      .map((machine: any, idx: number) => (
                        <div key={idx} className="border border-[#e8e8e8] rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-[600] text-[15px] text-[#0a0a0a]">
                                  {machine.brand} {machine.model}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[11px] font-[600] ${
                                  machine.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                  machine.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {machine.confidence.toUpperCase()} confidence
                                </span>
                              </div>
                              <div className="text-[13px] text-[#64748b] mt-2">
                                <div>First seen: {new Date(machine.first_seen).toLocaleDateString('en-GB')}</div>
                                <div>Last seen: {new Date(machine.last_seen).toLocaleDateString('en-GB')}</div>
                                <div>Page visits: {machine.visit_count}</div>
                              </div>
                              {machine.pages_viewed && machine.pages_viewed.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-[12px] text-[#64748b] mb-1">Pages viewed:</div>
                                  <div className="space-y-1">
                                    {machine.pages_viewed.slice(0, 3).map((page: string, pidx: number) => (
                                      <div key={pidx} className="text-[11px] text-blue-600">
                                        {page}
                                      </div>
                                    ))}
                                    {machine.pages_viewed.length > 3 && (
                                      <div className="text-[11px] text-[#94a3b8]">
                                        +{machine.pages_viewed.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-[12px] text-blue-800 font-[600] mb-1">💡 Marketing Tip</div>
                    <div className="text-[12px] text-blue-700">
                      This prospect has shown interest in specific machine brands. Consider sending targeted campaigns featuring solutions for their identified machines.
                    </div>
                  </div>
                </div>
              )}

              {/* Contacts */}
              <div>
                <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-4">Contacts ({contacts.length})</h3>
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.prospect_contact_id} className="border border-[#e8e8e8] rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-[600] text-[14px] text-[#0a0a0a]">
                            {contact.full_name || `${contact.first_name} ${contact.last_name}`.trim() || 'No name'}
                          </div>
                          <div className="text-[13px] text-[#64748b] mt-1">{contact.email}</div>
                          {contact.phone && (
                            <div className="text-[13px] text-[#64748b] mt-1">{contact.phone}</div>
                          )}
                          {contact.role && (
                            <div className="text-[12px] text-[#94a3b8] mt-1">{contact.role}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-[600] ${
                            contact.marketing_status === 'subscribed' ? 'bg-green-100 text-green-700' :
                            contact.marketing_status === 'unsubscribed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {contact.marketing_status}
                          </span>
                          <div className="text-[11px] text-[#94a3b8] mt-2">
                            Token: {contact.token.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {prospect.notes && (
                <div>
                  <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-2">Notes</h3>
                  <div className="text-[14px] text-[#64748b]">{prospect.notes}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-4">Engagement Timeline</h3>
              {events.length === 0 ? (
                <div className="text-center py-12 text-[#64748b]">No engagement yet</div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.event_id} className="border-l-2 border-blue-200 pl-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-[600] text-[13px] text-[#0a0a0a]">{event.event_type}</div>
                          <div className="text-[12px] text-[#64748b] mt-1">{event.url || event.event_name}</div>
                        </div>
                        <div className="text-[11px] text-[#94a3b8]">
                          {new Date(event.occurred_at).toLocaleString('en-GB')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div>
              <h3 className="text-[16px] font-[600] text-[#0a0a0a] mb-4">Campaign History</h3>
              {campaignSends.length === 0 ? (
                <div className="text-center py-12 text-[#64748b]">No campaigns sent yet</div>
              ) : (
                <div className="space-y-3">
                  {campaignSends.map((send: any) => (
                    <div key={send.send_id} className="border border-[#e8e8e8] rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-[600] text-[14px] text-[#0a0a0a]">
                            {send.marketing_campaigns?.campaign_name || 'Unknown Campaign'}
                          </div>
                          <div className="text-[13px] text-[#64748b] mt-1">
                            {send.marketing_campaigns?.email_subject}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-[12px] text-[#64748b]">
                            <span>Sent: {send.sent_at ? new Date(send.sent_at).toLocaleDateString('en-GB') : 'Not sent'}</span>
                            <span>Opens: {send.total_opens || 0}</span>
                            <span>Clicks: {send.total_clicks || 0}</span>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-[600] ${
                          send.send_status === 'delivered' ? 'bg-green-100 text-green-700' :
                          send.send_status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          send.send_status === 'bounced' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {send.send_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
