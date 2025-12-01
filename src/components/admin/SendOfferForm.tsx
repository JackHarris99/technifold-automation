/**
 * Send Offer Form - Client Component
 * Dynamically fetches contacts when company is selected
 */

'use client';

import { useState, useEffect } from 'react';

interface Contact {
  contact_id: string;
  company_id: string;
  full_name: string;
  email: string;
}

interface Company {
  company_id: string;
  company_name: string;
}

interface SendOfferFormProps {
  companies: Company[];
  sendOfferAction: (formData: FormData) => void;
}

export default function SendOfferForm({ companies, sendOfferAction }: SendOfferFormProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  // Fetch contacts when company changes
  useEffect(() => {
    if (!selectedCompany) {
      setContacts([]);
      setContactsError(null);
      return;
    }

    const fetchContacts = async () => {
      setLoadingContacts(true);
      setContactsError(null);

      try {
        const response = await fetch(`/api/admin/companies/${selectedCompany}/contacts`);

        if (!response.ok) {
          throw new Error(`Failed to fetch contacts: ${response.statusText}`);
        }

        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (error) {
        console.error('[SendOfferForm] Error fetching contacts:', error);
        setContactsError(error instanceof Error ? error.message : 'Failed to load contacts');
        setContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, [selectedCompany]);

  return (
    <form action={sendOfferAction} className="space-y-4">
      <div>
        <label htmlFor="company_id" className="block text-sm font-medium text-gray-700 mb-1">
          Company *
        </label>
        <select
          id="company_id"
          name="company_id"
          required
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select company...</option>
          {companies?.map((c) => (
            <option key={c.company_id} value={c.company_id}>
              {c.company_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact_id" className="block text-sm font-medium text-gray-700 mb-1">
          Contact (optional)
        </label>
        <select
          id="contact_id"
          name="contact_id"
          disabled={!selectedCompany || loadingContacts}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {loadingContacts ? 'Loading contacts...' : 'All eligible contacts'}
          </option>
          {contacts.map((c) => (
            <option key={c.contact_id} value={c.contact_id}>
              {c.full_name} ({c.email})
            </option>
          ))}
        </select>
        {selectedCompany && !loadingContacts && contacts.length === 0 && !contactsError && (
          <p className="text-xs text-gray-500 mt-1">No contacts found for this company</p>
        )}
        {contactsError && (
          <p className="text-xs text-red-600 mt-1">Error: {contactsError}</p>
        )}
      </div>

      <div>
        <label htmlFor="offer_key" className="block text-sm font-medium text-gray-700 mb-1">
          Offer Key *
        </label>
        <input
          type="text"
          id="offer_key"
          name="offer_key"
          required
          placeholder="e.g., reorder_reminder"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="campaign_key_offer" className="block text-sm font-medium text-gray-700 mb-1">
          Campaign Key
        </label>
        <input
          type="text"
          id="campaign_key_offer"
          name="campaign_key"
          placeholder="e.g., q1-2025-restock"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
      >
        Enqueue send_offer_email
      </button>
    </form>
  );
}
