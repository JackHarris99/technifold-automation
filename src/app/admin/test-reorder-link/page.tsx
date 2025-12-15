/**
 * Test Reorder Link Generator
 * Generates a real tokenized reorder URL to see exactly what customers see
 * Permanent tool for sales reps to test and troubleshoot
 */

'use client';

import { useState, useEffect } from 'react';

interface Company {
  company_id: string;
  company_name: string;
  machine_count?: number;
  unique_tool_count?: number;
  country?: string;
}

interface Contact {
  contact_id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

export default function TestReorderLinkPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Filter companies based on search
  useEffect(() => {
    if (companySearch.trim() === '') {
      setFilteredCompanies(companies.slice(0, 20));
    } else {
      const searchLower = companySearch.toLowerCase();
      const filtered = companies.filter(c =>
        c.company_name.toLowerCase().includes(searchLower) ||
        c.company_id.toLowerCase().includes(searchLower)
      ).slice(0, 20);
      setFilteredCompanies(filtered);
    }
  }, [companySearch, companies]);

  // Load contacts when company selected
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
      setFilteredCompanies((data.companies || []).slice(0, 20));
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  }

  async function loadContacts(companyId: string) {
    setLoadingContacts(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts`);
      const data = await response.json();
      setContacts(data.contacts || []);
      if (data.contacts?.length > 0) {
        setSelectedContactId(data.contacts[0].contact_id);
        setSelectedContact(data.contacts[0]);
      } else {
        setSelectedContactId('');
        setSelectedContact(null);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  }

  function selectCompany(company: Company) {
    setSelectedCompanyId(company.company_id);
    setSelectedCompany(company);
    setCompanySearch(company.company_name);
    setShowCompanyDropdown(false);
    setGeneratedUrl('');
  }

  function handleContactChange(contactId: string) {
    setSelectedContactId(contactId);
    setSelectedContact(contacts.find(c => c.contact_id === contactId) || null);
    setGeneratedUrl('');
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Test Reorder Link Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Generate a real tokenized URL to see exactly what customers see. Use this to test and troubleshoot customer issues.
          </p>

          {/* Company Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              1. Search Company
            </label>
            {loadingCompanies ? (
              <div className="text-gray-500">Loading companies...</div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(e.target.value);
                    setShowCompanyDropdown(true);
                    if (!e.target.value) {
                      setSelectedCompanyId('');
                      setSelectedCompany(null);
                      setGeneratedUrl('');
                    }
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  placeholder="Type company name to search..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />

                {/* Company Dropdown */}
                {showCompanyDropdown && filteredCompanies.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredCompanies.map((company) => (
                      <button
                        key={company.company_id}
                        onClick={() => selectCompany(company)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-gray-900">{company.company_name}</div>
                        <div className="text-sm text-gray-600">
                          {company.company_id} • {company.country || 'UK'} • {company.machine_count || 0} tools ({company.unique_tool_count || 0} unique)
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Company Info */}
          {selectedCompany && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
              <div className="text-sm">
                <div className="font-semibold text-green-900 mb-2">Selected Company</div>
                <div><strong>Name:</strong> {selectedCompany.company_name}</div>
                <div><strong>ID:</strong> {selectedCompany.company_id}</div>
                <div><strong>Total Tools Owned:</strong> {selectedCompany.machine_count || 0}</div>
                <div><strong>Unique Tool Types:</strong> {selectedCompany.unique_tool_count || 0} (tabs in portal)</div>
              </div>
            </div>
          )}

          {/* Contact Selection */}
          {selectedCompanyId && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                2. Select Contact
              </label>
              {loadingContacts ? (
                <div className="text-gray-500">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-yellow-600 p-3 bg-yellow-50 rounded-lg">
                  No contacts found for this company
                </div>
              ) : (
                <select
                  value={selectedContactId}
                  onChange={(e) => handleContactChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  {contacts.map((contact) => (
                    <option key={contact.contact_id} value={contact.contact_id}>
                      {contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'No name'} ({contact.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Selected Contact Info */}
          {selectedContact && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="text-sm">
                <div className="font-semibold text-blue-900 mb-2">Selected Contact</div>
                <div><strong>Name:</strong> {selectedContact.full_name || `${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim()}</div>
                <div><strong>Email:</strong> {selectedContact.email}</div>
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
              <h3 className="font-bold text-green-900 mb-3">Your Test Link (www.technifold.com):</h3>
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
              <div className="flex gap-3">
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  Open Link
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedUrl);
                    alert('Link copied to clipboard!');
                  }}
                  className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-green-700 mt-4">
                This is exactly what customers see. Link valid for 30 days.
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Troubleshooting Guide</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><strong>Empty portal?</strong> Company has no tools assigned in company_tools table.</li>
            <li><strong>No products?</strong> Check tool_consumable_map has consumables mapped to their tools.</li>
            <li><strong>Missing prices?</strong> Check products table has prices set for consumables.</li>
            <li><strong>Link expired?</strong> Generate a new link - they're valid for 30 days.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
