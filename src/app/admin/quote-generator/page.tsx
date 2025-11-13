/**
 * Manual Quote Generator
 * Generate /q/[token] links for phone calls or urgent quote requests
 */

'use client';

import { useState, useEffect } from 'react';
import { generateToken } from '@/lib/tokens';
import Link from 'next/link';

interface Company {
  company_id: string;
  company_name: string;
}

interface Contact {
  contact_id: string;
  email: string;
  full_name: string;
  first_name: string;
}

export default function QuoteGeneratorPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');

  const [generatedLink, setGeneratedLink] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Load companies
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch('/api/admin/companies/all');
        const data = await res.json();
        setCompanies(data.companies || []);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoadingCompanies(false);
      }
    }
    loadCompanies();
  }, []);

  // Load contacts when company changes
  useEffect(() => {
    if (!companyId) {
      setContacts([]);
      setContactId('');
      return;
    }

    async function loadContacts() {
      setLoadingContacts(true);
      try {
        const res = await fetch(`/api/admin/companies/${companyId}/contacts`);
        const data = await res.json();
        setContacts(data.contacts || []);
        setContactId('');
      } catch (err) {
        console.error('Failed to load contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    }
    loadContacts();
  }, [companyId]);

  const filteredCompanies = companies.filter(c =>
    c.company_name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.company_id.toLowerCase().includes(companySearch.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.full_name?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleGenerate = () => {
    if (!companyId || !contactId) {
      alert('Please select both company and contact');
      return;
    }

    const token = generateToken({ company_id: companyId, contact_id: contactId });
    const baseUrl = window.location.origin;
    const quoteLink = `${baseUrl}/q/${token}`;

    setGeneratedLink(quoteLink);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Quote link copied to clipboard!');
  };

  const handleSendEmail = async () => {
    if (!contactId) {
      alert('Please select a contact first');
      return;
    }

    const contact = contacts.find(c => c.contact_id === contactId);
    if (!contact) return;

    const confirmSend = confirm(`Send quote link via email to ${contact.email}?`);
    if (!confirmSend) return;

    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/quote/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_id: contactId,
          quote_url: generatedLink
        })
      });

      if (!res.ok) throw new Error('Failed to send');

      alert(`Quote link sent to ${contact.email}!`);
    } catch (error) {
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-gray-900">Manual Quote Generator</h1>
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Admin
            </Link>
          </div>
          <p className="text-gray-600">
            Generate personalized quote links for phone calls, urgent requests, or manual outreach
          </p>
        </div>

        {/* Generator Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Quote Link</h2>

          <div className="space-y-4">
            {/* Company Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company <span className="text-red-600">*</span>
              </label>
              {loadingCompanies ? (
                <div className="text-sm text-gray-500">Loading companies...</div>
              ) : (
                <>
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Search companies..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-2"
                  />
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a company...</option>
                    {filteredCompanies.map((company) => (
                      <option key={company.company_id} value={company.company_id}>
                        {company.company_name} ({company.company_id})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredCompanies.length} of {companies.length} companies shown
                  </p>
                </>
              )}
            </div>

            {/* Contact Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact <span className="text-red-600">*</span>
              </label>
              {!companyId ? (
                <div className="text-sm text-gray-500">Select a company first</div>
              ) : loadingContacts ? (
                <div className="text-sm text-gray-500">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-sm text-yellow-600">No contacts found for this company</div>
              ) : (
                <>
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-2"
                  />
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a contact...</option>
                    {filteredContacts.map((contact) => (
                      <option key={contact.contact_id} value={contact.contact_id}>
                        {contact.full_name || contact.first_name || 'Unnamed'} - {contact.email}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredContacts.length} of {contacts.length} contacts shown
                  </p>
                </>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!companyId || !contactId}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Generate Quote Link
            </button>
          </div>
        </div>

        {/* Generated Link */}
        {generatedLink && (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
              <p className="text-green-900 font-semibold mb-2">
                ✓ Quote link generated successfully!
              </p>
              <p className="text-sm text-green-800">
                Share this link with your customer to view pricing and complete checkout.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  💰 Quote Link
                </label>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  📋 Copy Link
                </button>
              </div>
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs mb-3"
              />

              <div className="flex gap-3">
                <a
                  href={generatedLink}
                  target="_blank"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-blue-700"
                >
                  Open Quote Page →
                </a>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="flex-1 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400"
                >
                  {sendingEmail ? 'Sending...' : '📧 Email to Customer'}
                </button>
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">💡 How to Use This Link:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Phone Calls:</strong> Generate and send via SMS or email while on the phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Follow-ups:</strong> Send personalized quotes after meetings or demos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Urgent Requests:</strong> Quickly respond to customers who need immediate pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Manual Outreach:</strong> Include in personalized emails or messages</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
