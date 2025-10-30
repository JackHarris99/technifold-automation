/**
 * Reorder Tab - THIS COMPANY'S consumable reorder items
 */

'use client';

import { useState, useEffect } from 'react';

export default function ReorderTab({ companyId, companyName, contacts }: any) {
  const [dueItems, setDueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchDueItems() {
      setLoading(true);
      try {
        // Fetch due items for THIS company only
        const response = await fetch(`/api/admin/companies/${companyId}/due-consumables`);
        const data = await response.json();
        setDueItems(data.items || []);
      } catch (error) {
        console.error('Failed to fetch due items:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDueItems();
  }, [companyId]);

  const handleSendReminder = async () => {
    const optedInContacts = contacts.filter((c: any) => c.marketing_status !== 'unsubscribed');

    if (optedInContacts.length === 0) {
      alert('No opted-in contacts for this company');
      return;
    }

    if (!confirm(`Send reorder reminder to ${optedInContacts.length} contact(s)?`)) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/admin/reorder/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_ids: optedInContacts.map((c: any) => c.contact_id),
          offer_key: 'reorder_reminder',
          campaign_key: `reorder_${new Date().toISOString().split('T')[0]}`
        })
      });

      if (!response.ok) throw new Error('Failed');

      const result = await response.json();
      alert(`Reorder reminder queued!\nJob ID: ${result.job_id}`);
    } catch (error) {
      alert('Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consumable Reorders</h2>
          <p className="text-gray-600 mt-1">Items this company is due to restock</p>
        </div>
        <button
          onClick={handleSendReminder}
          disabled={loading || dueItems.length === 0 || sending}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {sending ? 'Sending...' : 'Send Reminder Email'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading due items...</div>
      ) : dueItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-lg mb-2">No overdue consumables</p>
          <p className="text-gray-500 text-sm">This company is up to date or has no purchase history</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Last Purchased</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dueItems.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{item.consumable_code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.consumable_description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.last_purchased_at ? new Date(item.last_purchased_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                    £{item.price?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
