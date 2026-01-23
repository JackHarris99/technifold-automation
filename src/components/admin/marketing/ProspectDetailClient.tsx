/**
 * Prospect Detail Client Component
 * Shows prospect info, contacts, and engagement timeline
 */

'use client';

import { useState } from 'react';

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

  return (
    <div className="space-y-6">
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
