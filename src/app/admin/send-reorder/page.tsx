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
  const [showPreview, setShowPreview] = useState(false);

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
        setContacts(contactsData.contacts || []);
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

    console.log('[SendReorder] Sending to:', { companyId, selectedContacts });
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

      console.log('[SendReorder] Response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('[SendReorder] Error response:', data);
        console.error('[SendReorder] Error details:', data.details);
        throw new Error(data.details || data.error || `Failed to send emails (${response.status})`);
      }

      const result = await response.json();
      console.log('[SendReorder] Success:', result);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/company/${companyId}`);
      }, 2000);
    } catch (err: any) {
      console.error('[SendReorder] Catch error:', err);
      setError(err.message || 'Unknown error occurred');
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

            {/* Email Preview */}
            {selectedContacts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-lg font-bold text-gray-900">Email Preview</h2>
                  <span className="text-blue-600 text-sm">
                    {showPreview ? '▼ Hide' : '▶ Show'}
                  </span>
                </button>

                {showPreview && (
                  <div className="mt-4 space-y-6">
                    {/* Email Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-3">📧 Email Preview</h3>
                      <div className="text-sm text-gray-600 mb-4">
                        <p><strong>From:</strong> sales@technifold.com</p>
                        <p><strong>To:</strong> {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}</p>
                        <p><strong>Subject:</strong> Time to Restock Your Technifold Supplies</p>
                        <p className="text-xs italic text-blue-600 mt-2">
                          Note: Each email will be personalized with the contact's actual name
                        </p>
                      </div>

                    <div className="bg-white p-6 rounded border border-gray-300">
                      <div className="mb-4">
                        <img
                          src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                          alt="Technifold"
                          className="h-12 mb-4"
                        />
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Hi [Contact Name],
                      </h3>

                      <p className="text-gray-700 mb-4">
                        We hope your Technifold tools are working great for you! Based on your previous orders,
                        it might be time to restock your supplies.
                      </p>

                      <p className="text-gray-700 mb-4">
                        We've put together a personalized reorder link just for you, making it quick and easy
                        to get the products you need:
                      </p>

                      <div className="my-6">
                        <a
                          href="#"
                          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                          onClick={(e) => e.preventDefault()}
                        >
                          View Your Personalized Catalog
                        </a>
                      </div>

                      <p className="text-gray-700 mb-4">
                        This link is personalized for {company?.company_name} and includes:
                      </p>

                      <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                        <li>Your complete order history</li>
                        <li>Quick reorder with saved preferences</li>
                        <li>Current pricing and availability</li>
                        <li>Fast checkout process</li>
                      </ul>

                      <p className="text-gray-700 mb-4">
                        If you have any questions or need assistance, please don't hesitate to reach out.
                      </p>

                      <p className="text-gray-700">
                        Best regards,<br/>
                        <strong>The Technifold Team</strong>
                      </p>

                      <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
                        <p>This is a personalized email sent to {company?.company_name}</p>
                      </div>
                    </div>
                    </div>

                    {/* Portal Content Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-3">🛒 Portal Content Preview</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        This is what customers see when they click the link in their email:
                      </p>

                      <div className="bg-white p-6 rounded border border-gray-300">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{company?.company_name}</h2>
                            <p className="text-sm text-gray-600">Personalized Reorder Portal</p>
                          </div>
                          <img
                            src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                            alt="Technifold"
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-bold text-blue-900 mb-2">Your Order History</h4>
                            <p className="text-sm text-blue-800">
                              Based on your previous orders, we've pre-selected items you might need to restock.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                              <div>
                                <p className="font-medium text-gray-900">Product Name Example</p>
                                <p className="text-sm text-gray-500">Last ordered: 3 months ago</p>
                              </div>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
                                Add to Cart
                              </button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                              <div>
                                <p className="font-medium text-gray-900">Product Name Example</p>
                                <p className="text-sm text-gray-500">Last ordered: 5 months ago</p>
                              </div>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
                                Add to Cart
                              </button>
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <button className="w-full py-3 bg-green-600 text-white font-bold rounded-lg">
                              Proceed to Checkout
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
