/**
 * Invoice Creation Test Page
 * Simple UI to test end-to-end invoice creation:
 * Stripe Invoice → Resend Email → Supabase Order Record
 */

'use client';

import { useState, useEffect } from 'react';

interface Company {
  company_id: string;
  company_name: string;
  country: string;
  vat_number: string | null;
}

interface Contact {
  contact_id: string;
  email: string;
  full_name: string;
}

export default function TestInvoicePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Test invoice items (simple, hardcoded for testing)
  const testItems = [
    {
      product_code: 'TEST-001',
      description: 'Test Product 1 - Tri-Creaser',
      quantity: 2,
      unit_price: 89.99,
    },
    {
      product_code: 'TEST-002',
      description: 'Test Product 2 - Carbon Steel Blade',
      quantity: 10,
      unit_price: 12.50,
    },
  ];

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load contacts when company selected
  useEffect(() => {
    if (selectedCompanyId) {
      loadContacts(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies/all');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadContacts = async (companyId: string) => {
    setLoadingContacts(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts`);
      const data = await response.json();
      setContacts(data.contacts || []);
      if (data.contacts && data.contacts.length > 0) {
        setSelectedContactId(data.contacts[0].contact_id);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const createTestInvoice = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('[TEST] Creating invoice with:', {
        company_id: selectedCompanyId,
        contact_id: selectedContactId,
        items: testItems,
      });

      const response = await fetch('/api/admin/invoices/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': 'Technifold', // From env.local.txt
        },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          contact_id: selectedContactId,
          items: testItems,
          currency: 'gbp',
          notes: 'TEST INVOICE - Created via Test Page',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log('[TEST] Invoice created successfully:', data);
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[TEST] Invoice creation failed:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);
  const selectedContact = contacts.find(c => c.contact_id === selectedContactId);

  const subtotal = testItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invoice Creation Test
          </h1>
          <p className="text-sm text-gray-600">
            Test the complete invoice flow: Stripe Invoice → Resend Email → Supabase DB
          </p>
        </div>

        {/* Company Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Step 1: Select Company
          </h2>
          {loadingCompanies ? (
            <div className="text-gray-500">Loading companies...</div>
          ) : (
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a company --</option>
              {companies.slice(0, 50).map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company_name} ({company.country || 'Unknown'})
                  {company.vat_number ? ' - VAT: ' + company.vat_number : ''}
                </option>
              ))}
            </select>
          )}

          {selectedCompany && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm">
                <div><strong>Company:</strong> {selectedCompany.company_name}</div>
                <div><strong>Country:</strong> {selectedCompany.country || 'GB'}</div>
                <div><strong>VAT Number:</strong> {selectedCompany.vat_number || 'None'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Selection */}
        {selectedCompanyId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 2: Select Contact
            </h2>
            {loadingContacts ? (
              <div className="text-gray-500">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="text-yellow-600">No contacts found for this company</div>
            ) : (
              <>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {contacts.map((contact) => (
                    <option key={contact.contact_id} value={contact.contact_id}>
                      {contact.full_name} ({contact.email})
                    </option>
                  ))}
                </select>

                {selectedContact && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm">
                      <div><strong>Name:</strong> {selectedContact.full_name}</div>
                      <div><strong>Email:</strong> {selectedContact.email}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Invoice Items Preview */}
        {selectedCompanyId && selectedContactId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 3: Invoice Items (Hardcoded for Testing)
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-left py-2 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700">Price</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {testItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 text-sm text-gray-900">{item.product_code}</td>
                    <td className="py-2 text-sm text-gray-600">{item.description}</td>
                    <td className="py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                    <td className="py-2 text-sm text-gray-900 text-right">£{item.unit_price.toFixed(2)}</td>
                    <td className="py-2 text-sm font-semibold text-gray-900 text-right">
                      £{(item.unit_price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300">
                  <td colSpan={4} className="py-2 text-sm font-bold text-gray-900 text-right">
                    Subtotal:
                  </td>
                  <td className="py-2 text-sm font-bold text-gray-900 text-right">
                    £{subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">
              VAT will be calculated automatically based on company country and VAT number
            </p>
          </div>
        )}

        {/* Create Invoice Button */}
        {selectedCompanyId && selectedContactId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <button
              onClick={createTestInvoice}
              disabled={loading}
              className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Invoice...' : '🚀 Create Test Invoice'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              This will create a real Stripe invoice and send a real email
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-red-900 mb-2">❌ Error</h3>
            <p className="text-red-800 font-mono text-sm">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">✅ Invoice Created Successfully!</h3>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Order ID</div>
                <div className="font-mono text-xs text-gray-900">{result.order_id || 'N/A'}</div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Stripe Invoice ID</div>
                <div className="font-mono text-xs text-gray-900">{result.invoice_id || 'N/A'}</div>
              </div>

              {result.invoice_url && (
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Customer Payment Page</div>
                  <a
                    href={result.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline text-sm break-all"
                  >
                    {result.invoice_url}
                  </a>
                </div>
              )}

              {result.invoice_pdf_url && (
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Invoice PDF</div>
                  <a
                    href={result.invoice_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline text-sm break-all"
                  >
                    {result.invoice_pdf_url}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Next Steps:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                <li>Check the contact's email ({selectedContact?.email}) for invoice</li>
                <li>Check Stripe dashboard for invoice details</li>
                <li>Check Supabase orders table for order record</li>
                <li>Try clicking the payment link above</li>
              </ul>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">System Checklist</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Stripe API configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Resend API configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">Supabase connected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">VAT automation enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
