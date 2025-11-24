/**
 * Mass Campaign Send UI
 * Segment and send to thousands of contacts at once
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contact {
  contact_id: string;
  email: string;
  full_name: string;
  company_id: string;
  company_name: string;
  company_category?: string;
  has_machine: boolean;
  last_order_date?: string;
  marketing_consent: boolean;
}

export default function CampaignSendPage() {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    hasMachine: '',
    lastOrderDays: '',
    consentOnly: true,
  });

  // Campaign details
  const [campaign, setCampaign] = useState({
    campaignKey: '',
    subject: '',
    machineSlug: '',
    problemIds: [] as string[],
  });

  // Load contacts based on filters
  const loadContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.hasMachine) params.append('has_machine', filters.hasMachine);
      if (filters.lastOrderDays) params.append('last_order_days', filters.lastOrderDays);
      params.append('consent_only', filters.consentOnly.toString());

      const res = await fetch(`/api/admin/campaigns/contacts?${params}`);
      const data = await res.json();

      if (data.contacts) {
        setContacts(data.contacts);
        // Auto-select all
        setSelectedContacts(new Set(data.contacts.map((c: Contact) => c.contact_id)));
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
      alert('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSelectAll = () => {
    setSelectedContacts(new Set(contacts.map(c => c.contact_id)));
  };

  const handleDeselectAll = () => {
    setSelectedContacts(new Set());
  };

  const handleToggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSend = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select at least one contact');
      return;
    }

    if (!campaign.campaignKey || !campaign.subject) {
      alert('Please fill in campaign key and subject');
      return;
    }

    const confirmed = confirm(
      `Send campaign to ${selectedContacts.size} contact(s)?\n\n` +
      `Campaign: ${campaign.campaignKey}\n` +
      `Subject: ${campaign.subject}\n\n` +
      `This will generate unique tokenized links for each contact.`
    );

    if (!confirmed) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/campaigns/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_ids: Array.from(selectedContacts),
          campaign_key: campaign.campaignKey,
          subject: campaign.subject,
          machine_slug: campaign.machineSlug,
          problem_ids: campaign.problemIds,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          `Campaign sent successfully!\n\n` +
          `Sent: ${data.successful}\n` +
          `Failed: ${data.failed}\n\n` +
          `Check the engagement timeline to see opens and clicks.`
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error sending campaign:', err);
      alert('Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mass Campaign Builder</h1>
            <p className="mt-2 text-gray-600">
              Segment your audience and send personalized emails at scale
            </p>
          </div>
          <Link
            href="/admin/campaigns"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium"
          >
            ← Back
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Audience Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Category
              </label>
              <select
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="hot">Hot Leads</option>
                <option value="active">Active Customers</option>
                <option value="dormant">Dormant</option>
                <option value="prospect">Prospects</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Status
              </label>
              <select
                value={filters.hasMachine}
                onChange={e => setFilters({ ...filters, hasMachine: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All</option>
                <option value="true">Has Machine</option>
                <option value="false">No Machine</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Order
              </label>
              <select
                value={filters.lastOrderDays}
                onChange={e => setFilters({ ...filters, lastOrderDays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Any Time</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadContacts}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : '🔍 Apply Filters'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={filters.consentOnly}
              onChange={e => setFilters({ ...filters, consentOnly: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              Only contacts with marketing consent (GDPR compliant)
            </label>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">✉️ Campaign Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Key *
              </label>
              <input
                type="text"
                value={campaign.campaignKey}
                onChange={e => setCampaign({ ...campaign, campaignKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="spring_2025_reorder"
                pattern="[a-z0-9_-]+"
              />
              <p className="mt-1 text-xs text-gray-500">Lowercase, numbers, underscores only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={campaign.subject}
                onChange={e => setCampaign({ ...campaign, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Solutions for your {{machine.brand}} {{machine.model}}"
              />
              <p className="mt-1 text-xs text-gray-500">Use {"{{machine.brand}}"} for personalization</p>
            </div>
          </div>
        </div>

        {/* Selected Contacts */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              👥 Selected Contacts ({selectedContacts.size}/{contacts.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Select All
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Apply filters to load contacts</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedContacts.size === contacts.length}
                        onChange={e => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map(contact => (
                    <tr
                      key={contact.contact_id}
                      className={selectedContacts.has(contact.contact_id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.contact_id)}
                          onChange={() => handleToggleContact(contact.contact_id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{contact.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{contact.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{contact.company_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {contact.has_machine && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Machine</span>
                          )}
                          {contact.marketing_consent && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Consent</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Send Button */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Send?</h3>
              <p className="text-green-100">
                {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} will receive personalized emails with tracking links
              </p>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || selectedContacts.size === 0}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {sending ? '📤 Sending...' : `📧 Send to ${selectedContacts.size} Contact${selectedContacts.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
