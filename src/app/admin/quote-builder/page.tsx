/**
 * Quote Builder
 * /admin/quote-builder - Build custom quotes with specific products
 */

'use client';

import { useState, useEffect } from 'react';
import { generateToken } from '@/lib/tokens';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

interface Product {
  product_code: string;
  description: string;
  price?: number;
  rental_price_monthly?: number;
  currency?: string;
  type?: string;
  category?: string;
  image_url?: string;
}

export default function QuoteBuilderPage() {
  const searchParams = useSearchParams();
  const quoteRequestId = searchParams.get('request_id');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
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

  // Search products
  const searchProducts = async () => {
    if (!productSearch || productSearch.length < 2) {
      setProducts([]);
      return;
    }

    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productSearch)}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const filteredCompanies = companies.filter(c =>
    c.company_name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.company_id.toLowerCase().includes(companySearch.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.full_name?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const toggleProduct = (productCode: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productCode)) {
      newSelected.delete(productCode);
    } else {
      newSelected.add(productCode);
    }
    setSelectedProducts(newSelected);
  };

  const handleGenerate = async () => {
    if (!companyId || !contactId) {
      alert('Please select both company and contact');
      return;
    }

    if (selectedProducts.size === 0) {
      alert('Please select at least one product');
      return;
    }

    const token = generateToken({
      company_id: companyId,
      contact_id: contactId,
      products: Array.from(selectedProducts),
    });

    const baseUrl = window.location.origin;
    const quoteLink = `${baseUrl}/q/${token}`;

    // Update quote_request if we came from one
    if (quoteRequestId) {
      try {
        await fetch(`/api/admin/quote-requests/${quoteRequestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quote_token: token,
            status: 'quote_sent',
            quote_sent_at: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Failed to update quote request:', err);
      }
    }

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
          quote_url: generatedLink,
        }),
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-gray-900">Quote Builder</h1>
            <Link
              href="/admin/quote-requests"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Quote Requests
            </Link>
          </div>
          <p className="text-gray-600">
            Select company, contact, and products to build a custom quote
          </p>
        </div>

        {/* Builder Form */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Company & Contact */}
          <div className="space-y-6">
            {/* Company Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">1. Select Company</h2>
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
                </>
              )}
            </div>

            {/* Contact Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">2. Select Contact</h2>
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
                </>
              )}
            </div>
          </div>

          {/* Right Column - Product Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">3. Select Products</h2>

            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by code or description..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
            />

            {loadingProducts ? (
              <div className="text-sm text-gray-500">Searching...</div>
            ) : products.length === 0 && productSearch.length >= 2 ? (
              <div className="text-sm text-gray-500">No products found</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.product_code}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedProducts.has(product.product_code)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => toggleProduct(product.product_code)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{product.product_code}</div>
                        <div className="text-sm text-gray-600">{product.description}</div>
                        {product.type && (
                          <div className="text-xs text-gray-500 mt-1">
                            Type: {product.type}
                            {product.category && ` • ${product.category}`}
                          </div>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.product_code)}
                        onChange={() => {}}
                        className="w-5 h-5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedProducts.size > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Selected: {selectedProducts.size} product(s)
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedProducts).map((code) => (
                    <span
                      key={code}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={!companyId || !contactId || selectedProducts.size === 0}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
          >
            Generate Quote Link
          </button>
        </div>

        {/* Generated Link */}
        {generatedLink && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
              <p className="text-green-900 font-semibold mb-2">
                Quote link generated successfully!
              </p>
              <p className="text-sm text-green-800">
                Share this link with your customer to view pricing and complete checkout.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Quote Link
                </label>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Copy Link
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
                  Open Quote Page
                </a>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="flex-1 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400"
                >
                  {sendingEmail ? 'Sending...' : 'Email to Customer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
