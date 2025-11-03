/**
 * Reorder Tab - Portal Preview with Tool Cards + Consumable Cards
 * Shows THIS company's reorder portal, select contacts, send tokenized link
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

  useEffect(() => {
    async function fetchPortalData() {
      setLoading(true);
      try {
        // Fetch portal data for this company
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
    return <div className="text-center py-12 text-gray-500">Loading portal preview...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reorder Portal Preview</h2>
          <p className="text-gray-600 mt-1">What {companyName} will see when they click the link</p>
        </div>
      </div>

      {/* Portal Preview */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Consumables for {companyName}
          </h3>

          {/* Tool Cards with Consumables */}
          {portalData?.tools && portalData.tools.length > 0 ? (
            <div className="space-y-8">
              {portalData.tools.map((tool: any) => (
                <div key={tool.tool_code} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Tool Header Card */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{tool.description}</div>
                        <div className="text-blue-100 text-sm">Tool Code: {tool.tool_code}</div>
                      </div>
                    </div>
                  </div>

                  {/* Consumable Cards - 2 columns */}
                  <div className="p-6 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                      Compatible Consumables
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {tool.consumables && tool.consumables.map((consumable: any) => (
                        <div key={consumable.product_code} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all">
                          <div className="flex gap-4">
                            {/* Product Image - Small, left side */}
                            <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                              <MediaImage
                                src={consumable.image_url}
                                alt={consumable.description}
                                fill
                                sizes="80px"
                              />
                            </div>

                            {/* Product Details - Right side */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-mono text-xs text-blue-600 font-bold mb-1">
                                    {consumable.product_code}
                                  </div>
                                  <div className="font-semibold text-gray-900 text-sm leading-tight">
                                    {consumable.description}
                                  </div>
                                </div>
                                {consumable.price && (
                                  <div className="text-lg font-bold text-gray-900 ml-3 flex-shrink-0">
                                    £{consumable.price.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              {consumable.last_purchased_at && (
                                <div className="text-xs text-gray-500 mb-3">
                                  Last ordered: {new Date(consumable.last_purchased_at).toLocaleDateString()}
                                </div>
                              )}

                              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No tools found for this company</p>
              <p className="text-sm">They need to purchase tools before we can recommend consumables</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">Send Portal Link To</h3>

        {contacts.length === 0 ? (
          <p className="text-gray-500">No contacts available</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact: any) => (
              <label
                key={contact.contact_id}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedContacts.has(contact.contact_id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.has(contact.contact_id)}
                  onChange={() => toggleContact(contact.contact_id)}
                  disabled={contact.marketing_status === 'unsubscribed'}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                  </div>
                  <div className="text-sm text-gray-600">{contact.email}</div>
                </div>
                {contact.marketing_status === 'unsubscribed' && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Unsubscribed</span>
                )}
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSend}
            disabled={sending || selectedContacts.size === 0}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
          >
            {sending ? 'Sending...' : `Send Portal Link to ${selectedContacts.size} Contact(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
