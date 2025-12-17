/**
 * Send Reorder Email - Single Dedicated Page
 * Accepts company_id as query param and pre-fills company info
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SendReorderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyId = searchParams.get('company_id');

  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setError('No company ID provided');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        // Fetch company details
        const companyRes = await fetch(`/api/admin/companies/${companyId}`);
        if (!companyRes.ok) throw new Error('Failed to fetch company');
        const companyData = await companyRes.json();
        setCompany(companyData);

        // Fetch contacts
        const contactsRes = await fetch(`/api/admin/companies/${companyId}/contacts`);
        if (!contactsRes.ok) throw new Error('Failed to fetch contacts');
        const contactsData = await contactsRes.json();
        setContacts(contactsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSend = async () => {
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/reorder/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_ids: selectedContacts,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send emails');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/company/${companyId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/admin/company/${companyId}`}
                className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
              >
                ← Back to {company?.company_name}
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Send Reorder Email
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Select contacts to receive personalized reorder emails with tokenized links
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-900 mb-2">
              Emails Sent Successfully!
            </h2>
            <p className="text-green-700">
              Reorder emails sent to {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-green-600 mt-2">Redirecting back to company page...</p>
          </div>
        ) : (
          <>
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Company</h2>
              <p className="text-gray-600">{company?.company_name}</p>
              <p className="text-sm text-gray-500">{company?.company_id}</p>
            </div>

            {/* Contact Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Select Contacts</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedContacts(contacts.map(c => c.contact_id))}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedContacts([])}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedContacts.length} of {contacts.length} selected
                  </span>
                </div>
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No contacts found for this company.</p>
                  <Link
                    href={`/admin/company/${companyId}`}
                    className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                  >
                    Add contacts first
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <label
                      key={contact.contact_id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.contact_id)}
                        onChange={() => toggleContact(contact.contact_id)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{contact.full_name}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <Link
                href={`/admin/company/${companyId}`}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                onClick={handleSend}
                disabled={sending || selectedContacts.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {sending ? 'Sending...' : `Send to ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
