/**
 * Reorder Tab - Portal Preview with Tool Cards + Consumable Cards
 * Shows THIS company's reorder portal, select contacts, send tokenized link
 * Matches the customer portal design for consistency
 */

'use client';

import { useState, useEffect } from 'react';
import MediaImage from '@/components/shared/MediaImage';

interface ReorderTabProps {
  companyId: string;
  companyName: string;
  contacts: any[];
}

export default function ReorderTab({
  companyId,
  companyName,
  contacts
}: ReorderTabProps) {
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('previously_ordered');

  useEffect(() => {
    async function fetchPortalData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/companies/${companyId}/portal-preview`);
        const data = await response.json();
        setPortalData(data);
      } catch (error) {
        console.error('Failed to fetch portal data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPortalData();
  }, [companyId]);

  const handleSend = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select at least one contact');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/admin/reorder/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_ids: Array.from(selectedContacts),
          offer_key: 'reorder_reminder',
          campaign_key: `reorder_${new Date().toISOString().split('T')[0]}`
        })
      });

      if (!response.ok) throw new Error('Failed');

      const result = await response.json();
      alert(`Reorder link sent!\nJob ID: ${result.job_id}`);
    } catch (error) {
      alert('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => {
      const next = new Set(prev);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading portal preview...</p>
        </div>
      </div>
    );
  }

  // Build tabs array
  const tabs = [
    { id: 'previously_ordered', label: 'Previously Ordered', icon: 'clock', count: portalData?.previously_ordered?.length || 0 },
    ...(portalData?.tools || []).map((tool: any) => ({
      id: tool.tool_code,
      label: tool.description || tool.tool_code,
      icon: 'tool',
      count: tool.consumables?.length || 0
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reorder Portal Preview</h2>
          <p className="text-slate-500 mt-1">Preview what {companyName} will see</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Tools:</span>
          <span className="font-semibold text-slate-700">{portalData?.tools?.length || 0}</span>
          <span className="text-slate-300 mx-2">|</span>
          <span className="text-slate-400">Previously Ordered:</span>
          <span className="font-semibold text-slate-700">{portalData?.previously_ordered?.length || 0}</span>
        </div>
      </div>

      {/* Portal Preview Frame */}
      <div className="border-2 border-slate-300 rounded-2xl overflow-hidden bg-slate-50">
        {/* Preview Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-28 h-7 bg-white/20 rounded flex items-center justify-center text-xs text-white/60">
                Technifold Logo
              </div>
              <div className="h-6 w-px bg-slate-600"></div>
              <div>
                <h3 className="text-base font-bold">{companyName}</h3>
                <p className="text-xs text-slate-300">Consumables Reorder Portal</p>
              </div>
            </div>
            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-medium">PREVIEW</span>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex min-h-[500px]">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-slate-200 p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Browse Products</h4>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon === 'clock' ? (
                      <svg className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <span className="truncate flex-1">{tab.label}</span>
                    <span className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {tab.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
            {activeTab === 'previously_ordered' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Previously Ordered</h3>
                  <p className="text-slate-500 text-sm">Quick reorder from purchase history</p>
                </div>

                {portalData?.previously_ordered?.length > 0 ? (
                  <div className="space-y-3">
                    {portalData.previously_ordered.map((item: any) => (
                      <div
                        key={item.product_code}
                        className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 bg-slate-50 rounded-lg flex-shrink-0 overflow-hidden">
                            <MediaImage
                              src={item.image_url}
                              alt={item.description}
                              fill
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm">{item.description}</h4>
                            <p className="text-xs text-slate-400 font-mono">{item.product_code}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Last ordered: {new Date(item.last_purchased_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {item.price && (
                              <div className="text-lg font-bold text-slate-900">£{item.price.toFixed(2)}</div>
                            )}
                          </div>
                          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg">
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-500">No previous orders found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tool Header */}
                {(() => {
                  const tool = portalData?.tools?.find((t: any) => t.tool_code === activeTab);
                  if (!tool) return null;
                  return (
                    <>
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{tool.description}</h3>
                            <p className="text-blue-100 text-sm font-mono">{tool.tool_code}</p>
                            <p className="text-blue-200 text-sm mt-1">{tool.consumables?.length || 0} compatible consumables</p>
                          </div>
                        </div>
                      </div>

                      {tool.consumables?.length > 0 ? (
                        <div className="space-y-3">
                          {tool.consumables.map((item: any) => (
                            <div
                              key={item.product_code}
                              className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-slate-300 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-slate-50 rounded-lg flex-shrink-0 overflow-hidden">
                                  <MediaImage
                                    src={item.image_url}
                                    alt={item.description}
                                    fill
                                    sizes="64px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 text-sm">{item.description}</h4>
                                  <p className="text-xs text-slate-400 font-mono">{item.product_code}</p>
                                  {item.last_purchased_at && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Previously ordered
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  {item.price && (
                                    <div className="text-lg font-bold text-slate-900">£{item.price.toFixed(2)}</div>
                                  )}
                                </div>
                                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg">
                                  Add
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                          <p className="text-slate-500">No consumables found for this tool</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Selection */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Send Portal Link</h3>

        {contacts.length === 0 ? (
          <p className="text-slate-500">No contacts available for this company</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact: any) => (
              <label
                key={contact.contact_id}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedContacts.has(contact.contact_id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:bg-slate-50'
                } ${contact.marketing_status === 'unsubscribed' ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.has(contact.contact_id)}
                  onChange={() => toggleContact(contact.contact_id)}
                  disabled={contact.marketing_status === 'unsubscribed'}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">
                    {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                  </div>
                  <div className="text-sm text-slate-500">{contact.email}</div>
                </div>
                {contact.marketing_status === 'unsubscribed' && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">Unsubscribed</span>
                )}
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            {selectedContacts.size > 0
              ? `${selectedContacts.size} contact${selectedContacts.size !== 1 ? 's' : ''} selected`
              : 'Select contacts to send the portal link'}
          </p>
          <button
            onClick={handleSend}
            disabled={sending || selectedContacts.size === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              `Send Portal Link`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
