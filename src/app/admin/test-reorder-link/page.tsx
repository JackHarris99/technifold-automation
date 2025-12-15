/**
 * Test Reorder Link Generator
 * Generates a real tokenized reorder URL you can click to see exactly what customers see
 */

'use client';

import { useState, useEffect } from 'react';

export default function TestReorderLinkPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadContacts(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  async function loadCompanies() {
    try {
      const response = await fetch('/api/admin/companies/all');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  }

  async function loadContacts(companyId: string) {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts`);
      const data = await response.json();
      setContacts(data.contacts || []);
      if (data.contacts?.length > 0) {
        setSelectedContactId(data.contacts[0].contact_id);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }

  async function generateLink() {
    if (!selectedCompanyId || !selectedContactId) {
      alert('Please select a company and contact');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/generate-test-reorder-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          contact_id: selectedContactId,
        }),
      });

      const data = await response.json();
      if (data.url) {
        setGeneratedUrl(data.url);
      } else {
        alert('Failed to generate URL: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error generating URL');
    } finally {
      setLoading(false);
    }
  }

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);
  const selectedContact = contacts.find(c => c.contact_id === selectedContactId);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Test Reorder Link Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Generate a real tokenized URL to see exactly what customers see when they click a reorder link.
          </p>

          {/* Company Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              1. Select Company
            </label>
            {loadingCompanies ? (
              <div className="text-gray-500">Loading companies...</div>
            ) : (
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                  setGeneratedUrl('');
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">-- Select a company --</option>
                {companies.slice(0, 100).map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name} ({company.machine_count || 0} tools)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Contact Selection */}
          {selectedCompanyId && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                2. Select Contact
              </label>
              {contacts.length === 0 ? (
                <div className="text-yellow-600">No contacts found for this company</div>
              ) : (
                <select
                  value={selectedContactId}
                  onChange={(e) => {
                    setSelectedContactId(e.target.value);
                    setGeneratedUrl('');
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  {contacts.map((contact) => (
                    <option key={contact.contact_id} value={contact.contact_id}>
                      {contact.full_name || contact.email} ({contact.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Selected Info */}
          {selectedCompany && selectedContact && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="text-sm">
                <div><strong>Company:</strong> {selectedCompany.company_name}</div>
                <div><strong>Contact:</strong> {selectedContact.full_name || selectedContact.email}</div>
                <div><strong>Email:</strong> {selectedContact.email}</div>
                <div><strong>Tools:</strong> {selectedCompany.machine_count || 0}</div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {selectedCompanyId && selectedContactId && (
            <button
              onClick={generateLink}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 mb-6"
            >
              {loading ? 'Generating...' : 'Generate Reorder Link'}
            </button>
          )}

          {/* Generated URL */}
          {generatedUrl && (
            <div className="p-6 bg-green-50 border-2 border-green-500 rounded-lg">
              <h3 className="font-bold text-green-900 mb-3">Your Test Link:</h3>
              <div className="bg-white p-4 rounded border border-green-300 mb-4">
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all text-sm font-mono"
                >
                  {generatedUrl}
                </a>
              </div>
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                Open Link in New Tab →
              </a>
              <p className="text-sm text-green-700 mt-4">
                This is the exact page customers will see. The link is valid for 30 days.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
