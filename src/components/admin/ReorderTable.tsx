/**
 * Reorder Table Component
 * Shows companies due for reorder with send reminder action
 */

'use client';

import { useState } from 'react';

interface ReorderItem {
  consumable_code: string;
  consumable_description: string;
  price: number;
  last_purchased_at: string;
  due_category: string;
}

interface Contact {
  contact_id: string;
  email: string;
  first_name: string;
  last_name: string;
  marketing_status: string;
}

interface Reorder {
  company_id: string;
  company_name: string;
  account_owner?: string | null;
  items: ReorderItem[];
  contacts: Contact[];
  urgency: string;
}

interface ReorderTableProps {
  reorders: Reorder[];
}

export default function ReorderTable({ reorders: initialReorders }: ReorderTableProps) {
  const [reorders, setReorders] = useState(initialReorders);
  const [filter, setFilter] = useState<'all' | '90_days' | '180_days' | '365_days'>('all');
  const [sending, setSending] = useState<string | null>(null);

  const filteredReorders = reorders.filter(r => {
    if (filter === 'all') return true;
    return r.urgency === filter;
  });

  const handleSendReminder = async (reorder: Reorder) => {
    if (reorder.contacts.length === 0) {
      alert('No contacts available for this company');
      return;
    }

    // Ask which contacts to send to
    const contactList = reorder.contacts.map((c, idx) =>
      `${idx + 1}. ${c.first_name} ${c.last_name} (${c.email}) - ${c.marketing_status}`
    ).join('\n');

    const confirmed = confirm(
      `Send reorder reminder to ${reorder.company_name}?\n\n` +
      `Contacts:\n${contactList}\n\n` +
      `This will enqueue a send_offer_email job with offer_key="reorder_reminder".`
    );

    if (!confirmed) return;

    setSending(reorder.company_id);

    try {
      const response = await fetch('/api/admin/reorder/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: reorder.company_id,
          contact_ids: reorder.contacts.map(c => c.contact_id),
          offer_key: 'reorder_reminder',
          campaign_key: `reorder_${reorder.urgency}_${new Date().getFullYear()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }

      const result = await response.json();

      alert(`Reorder reminder enqueued successfully!\nJob ID: ${result.job_id}`);

      // Remove from list (optional - or mark as sent)
      setReorders(prev => prev.filter(r => r.company_id !== reorder.company_id));
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setSending(null);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Urgencies</option>
          <option value="90_days">90+ days (High)</option>
          <option value="180_days">180+ days (Medium)</option>
          <option value="365_days">365+ days (Low)</option>
        </select>

        <div className="text-sm text-gray-600">
          Showing {filteredReorders.length} companies
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rep</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Urgency</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Items Due</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contacts</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReorders.map((reorder) => (
              <tr key={reorder.company_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{reorder.company_name}</div>
                  <div className="text-xs text-gray-500">{reorder.company_id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    reorder.account_owner
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {reorder.account_owner || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    reorder.urgency === '90_days'
                      ? 'bg-red-100 text-red-800'
                      : reorder.urgency === '180_days'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reorder.urgency === '90_days' && 'High'}
                    {reorder.urgency === '180_days' && 'Medium'}
                    {reorder.urgency === '365_days' && 'Low'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {reorder.items.length} item{reorder.items.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">
                    {reorder.items.slice(0, 2).map(item => item.consumable_code).join(', ')}
                    {reorder.items.length > 2 && ` +${reorder.items.length - 2} more`}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {reorder.contacts.length === 0 ? (
                    <span className="text-sm text-red-600">No contacts</span>
                  ) : (
                    <div className="text-xs text-gray-600">
                      {reorder.contacts.length} contact{reorder.contacts.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleSendReminder(reorder)}
                      disabled={sending === reorder.company_id || reorder.contacts.length === 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {sending === reorder.company_id ? 'Sending...' : 'Send Reminder'}
                    </button>
                    <a
                      href={`/admin/customer/${reorder.company_id}`}
                      className="text-xs text-gray-600 hover:text-gray-800 underline text-center"
                    >
                      View Details
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReorders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No companies due for reorder matching the current filters
          </div>
        )}
      </div>
    </div>
  );
}
