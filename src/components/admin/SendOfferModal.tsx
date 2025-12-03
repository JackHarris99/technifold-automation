/**
 * Send Offer Modal
 * Choose offer template + contacts, enqueue email send job
 */

'use client';

import { useState, useEffect } from 'react';

interface SendOfferModalProps {
  companyId: string;
  companyName: string;
  onClose: () => void;
}

interface Contact {
  contact_id: string;
  full_name: string;
  email: string;
  marketing_status: string;
}

const OFFER_TEMPLATES = [
  { key: 'reorder_reminder', label: 'Reorder Reminder', description: '10% off reorders' },
  { key: 'new_product_launch', label: 'New Product Launch', description: '20% off new products' },
  { key: 'seasonal_promotion', label: 'Seasonal Promotion', description: 'Seasonal discounts' },
  { key: 'custom', label: 'Custom Offer', description: 'Freeform offer text' },
];

export default function SendOfferModal({
  companyId,
  companyName,
  onClose,
}: SendOfferModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [offerTemplate, setOfferTemplate] = useState('reorder_reminder');
  const [campaignKey, setCampaignKey] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, [companyId]);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts`);
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (selectedContacts.length === 0) {
        setError('Please select at least one contact');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/offers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_ids: selectedContacts,
          offer_key: offerTemplate,
          campaign_key: campaignKey || `offer-${Date.now()}`,
          custom_message: customMessage || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send offer');
      }

      const data = await response.json();
      alert(`Offer sending enqueued! Job ID: ${data.job_id}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Send Offer to {companyName}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Offer Template */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer Template
            </label>
            <select
              value={offerTemplate}
              onChange={(e) => setOfferTemplate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {OFFER_TEMPLATES.map(template => (
                <option key={template.key} value={template.key}>
                  {template.label} - {template.description}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Key */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Key
            </label>
            <input
              type="text"
              value={campaignKey}
              onChange={(e) => setCampaignKey(e.target.value)}
              placeholder="e.g., q1-2025-reorder (optional)"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Custom Message */}
          {offerTemplate === 'custom' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                placeholder="Enter your custom offer message..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          )}

          {/* Contact Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients
            </label>
            {loadingContacts ? (
              <p className="text-sm text-gray-500">Loading contacts...</p>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-gray-500">No contacts found for this company</p>
            ) : (
              <div className="border border-gray-300 rounded-md divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {contacts.map(contact => (
                  <label
                    key={contact.contact_id}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.contact_id)}
                      onChange={() => toggleContact(contact.contact_id)}
                      disabled={contact.marketing_status === 'unsubscribed'}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.full_name || contact.email}
                      </div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      contact.marketing_status === 'subscribed'
                        ? 'bg-green-100 text-green-800'
                        : contact.marketing_status === 'unsubscribed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.marketing_status}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedContacts.length} contact(s)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedContacts.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
