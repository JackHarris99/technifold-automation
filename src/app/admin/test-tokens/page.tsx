/**
 * Test Token Generator
 * Generate tokenized links for testing marketing/quote/reorder pages
 */

'use client';

import { useState, useEffect } from 'react';
import { generateToken } from '@/lib/tokens';

interface Company {
  company_id: string;
  company_name: string;
}

interface Contact {
  contact_id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

export default function TestTokensPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');

  const [generatedLinks, setGeneratedLinks] = useState<{
    marketing: string;
    quote: string;
    reorder: string;
    token: string;
  } | null>(null);

  // Load companies on mount
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch('/api/admin/test-tokens/companies');
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
        const res = await fetch(`/api/admin/test-tokens/contacts?company_id=${companyId}`);
        const data = await res.json();
        setContacts(data.contacts || []);
        setContactId(''); // Reset contact selection
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
    c.full_name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.first_name?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleGenerate = () => {
    if (!companyId || !contactId) {
      alert('Enter both company_id and contact_id');
      return;
    }

    const token = generateToken({ company_id: companyId, contact_id: contactId });
    const baseUrl = window.location.origin;

    setGeneratedLinks({
      marketing: `${baseUrl}/m/${token}`,
      quote: `${baseUrl}/q/${token}`,
      reorder: `${baseUrl}/r/${token}`,
      token,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Token Generator</h1>
        <p className="text-gray-600 mb-8">Generate tokenized links for testing the customer journey</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Links</h2>

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
              Generate Test Links
            </button>
          </div>
        </div>

        {generatedLinks && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>Token generated!</strong> These links will work for any company/contact in your database.
              </p>
            </div>

            {/* Raw Token */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Raw Token (HMAC Signed)
                </label>
                <button
                  onClick={() => copyToClipboard(generatedLinks.token)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Copy
                </button>
              </div>
              <input
                type="text"
                value={generatedLinks.token}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs"
              />
            </div>

            {/* Marketing Link */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  📧 Marketing Page - /m/[token]
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedLinks.marketing)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Copy
                  </button>
                  <a
                    href={generatedLinks.marketing}
                    target="_blank"
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Open →
                  </a>
                </div>
              </div>
              <input
                type="text"
                value={generatedLinks.marketing}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs mb-2"
              />
              <p className="text-xs text-gray-600">
                Shows full marketing content with solutions, before/after images, and products
              </p>
            </div>

            {/* Quote Link */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  💰 Quote Page - /q/[token]
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedLinks.quote)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Copy
                  </button>
                  <a
                    href={generatedLinks.quote}
                    target="_blank"
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Open →
                  </a>
                </div>
              </div>
              <input
                type="text"
                value={generatedLinks.quote}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs mb-2"
              />
              <p className="text-xs text-gray-600">
                Interactive quote with rental (£50/month, 30-day trial) vs purchase options + Stripe checkout
              </p>
            </div>

            {/* Reorder Link */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  🔄 Reorder Portal - /r/[token]
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedLinks.reorder)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Copy
                  </button>
                  <a
                    href={generatedLinks.reorder}
                    target="_blank"
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Open →
                  </a>
                </div>
              </div>
              <input
                type="text"
                value={generatedLinks.reorder}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs mb-2"
              />
              <p className="text-xs text-gray-600">
                Consumables reorder portal with company-specific product recommendations
              </p>
            </div>

            {/* Usage Instructions */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">📋 How to Use:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Select a company and contact from the dropdowns above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Click "Generate Test Links" to create tokenized URLs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Click "Open →" to view each page as that customer would see it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Test the full flow: Marketing → Quote → Stripe Checkout</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
