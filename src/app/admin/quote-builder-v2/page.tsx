/**
 * Quote Builder V2 - Improved UX
 * /admin/quote-builder-v2 - Build custom quotes with better workflow
 */

'use client';

import { useState, useEffect } from 'react';
import { generateToken } from '@/lib/tokens';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import QuotePreview from '@/components/admin/QuotePreview';
import MediaImage from '@/components/shared/MediaImage';

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

export default function QuoteBuilderV2Page() {
  const searchParams = useSearchParams();
  const quoteRequestId = searchParams.get('request_id');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [companyId, setCompanyId] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [companySearch, setCompanySearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [selectedProducts, setSelectedProducts] = useState<Map<string, Product>>(new Map());
  const [generatedLink, setGeneratedLink] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

  // Load all products on mount
  useEffect(() => {
    async function loadAllProducts() {
      try {
        const res = await fetch('/api/admin/products/all');
        const data = await res.json();
        setAllProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadAllProducts();
  }, []);

  // Load contacts when company changes
  useEffect(() => {
    if (!companyId) {
      setContacts([]);
      setSelectedContactIds(new Set());
      return;
    }

    async function loadContacts() {
      setLoadingContacts(true);
      try {
        const res = await fetch(`/api/admin/companies/${companyId}/contacts`);
        const data = await res.json();
        setContacts(data.contacts || []);
        setSelectedContactIds(new Set());
      } catch (err) {
        console.error('Failed to load contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    }
    loadContacts();
  }, [companyId]);

  // Filter with null safety
  const filteredCompanies = companies.filter(c => {
    const searchLower = companySearch.toLowerCase();
    return (
      (c.company_name || '').toLowerCase().includes(searchLower) ||
      (c.company_id || '').toLowerCase().includes(searchLower)
    );
  });

  const filteredContacts = contacts.filter(c => {
    const searchLower = contactSearch.toLowerCase();
    return (
      (c.email || '').toLowerCase().includes(searchLower) ||
      (c.full_name || '').toLowerCase().includes(searchLower) ||
      (c.first_name || '').toLowerCase().includes(searchLower)
    );
  });

  const filteredProducts = allProducts.filter(p => {
    if (!productSearch) return true;
    const searchLower = productSearch.toLowerCase();
    return (
      (p.product_code || '').toLowerCase().includes(searchLower) ||
      (p.description || '').toLowerCase().includes(searchLower)
    );
  });

  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContactIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactIds(newSelected);
  };

  const addProduct = (product: Product) => {
    const newSelected = new Map(selectedProducts);
    newSelected.set(product.product_code, product);
    setSelectedProducts(newSelected);
  };

  const removeProduct = (productCode: string) => {
    const newSelected = new Map(selectedProducts);
    newSelected.delete(productCode);
    setSelectedProducts(newSelected);
  };

  const handlePreview = () => {
    if (!companyId) {
      alert('Please select a company');
      return;
    }

    if (selectedContactIds.size === 0) {
      alert('Please select at least one contact');
      return;
    }

    if (selectedProducts.size === 0) {
      alert('Please select at least one product');
      return;
    }

    setShowPreview(true);
  };

  const handleGenerateFromPreview = async (quoteItems: any[], globalDiscount: number) => {
    // Use first contact for token (we'll send to all selected contacts via email)
    const firstContactId = Array.from(selectedContactIds)[0];

    const token = generateToken({
      company_id: companyId,
      contact_id: firstContactId,
      products: quoteItems.map(item => item.product.product_code),
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
    setShowPreview(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Quote link copied to clipboard!');
  };

  const handleSendEmail = async () => {
    if (selectedContactIds.size === 0) {
      alert('Please select at least one contact');
      return;
    }

    const selectedContacts = contacts.filter(c => selectedContactIds.has(c.contact_id));
    const contactEmails = selectedContacts.map(c => c.email).join(', ');

    const confirmSend = confirm(`Send quote link via email to:\n${contactEmails}?`);
    if (!confirmSend) return;

    setSendingEmail(true);
    try {
      // Send to each selected contact
      for (const contactId of selectedContactIds) {
        await fetch('/api/admin/quote/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            contact_id: contactId,
            quote_url: generatedLink,
          }),
        });
      }

      alert(`Quote link sent to ${selectedContactIds.size} contact(s)!`);
    } catch (error) {
      alert('Failed to send emails. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // If showing preview, render preview component
  if (showPreview && selectedProducts.size > 0) {
    const company = companies.find(c => c.company_id === companyId);
    const firstContact = contacts.find(c => selectedContactIds.has(c.contact_id));

    if (!company || !firstContact) return null;

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <QuotePreview
            company={company}
            contact={firstContact}
            products={Array.from(selectedProducts.values())}
            onGenerateQuote={handleGenerateFromPreview}
            onBack={() => setShowPreview(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
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
            Select company, contacts, and products to build a custom quote
          </p>
        </div>

        {/* Company & Contact Selection - Side by Side */}
        <div className="grid grid-cols-2 gap-6 mb-6">
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
                <p className="text-xs text-gray-500 mt-1">
                  {filteredCompanies.length} of {companies.length} companies shown
                </p>
              </>
            )}
          </div>

          {/* Contact Selector - Multiple Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">2. Select Contact(s)</h2>
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
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  {filteredContacts.map((contact) => (
                    <label
                      key={contact.contact_id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContactIds.has(contact.contact_id)}
                        onChange={() => toggleContact(contact.contact_id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {contact.full_name || contact.first_name || 'Unnamed'}
                        </div>
                        <div className="text-xs text-gray-600">{contact.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedContactIds.size} contact(s) selected • {filteredContacts.length} shown
                </p>
              </>
            )}
          </div>
        </div>

        {/* Product Selection - Grid Below */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">3. Select Products</h2>

          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products by code or description..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-4"
          />

          {loadingProducts ? (
            <div className="text-sm text-gray-500">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.has(product.product_code);
                return (
                  <div
                    key={product.product_code}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {product.image_url && (
                      <div className="w-full bg-white rounded-lg mb-3 p-2 h-32 flex items-center justify-center">
                        <MediaImage
                          src={product.image_url}
                          alt={product.description}
                          width={120}
                          height={120}
                          className="w-auto h-auto max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="font-bold text-sm text-gray-900 mb-1">
                      {product.product_code}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {product.description}
                    </div>
                    {product.type && (
                      <div className="text-xs text-gray-500 mb-2">
                        Type: {product.type}
                      </div>
                    )}
                    {product.price && (
                      <div className="text-sm font-bold text-gray-900 mb-2">
                        £{product.price}
                      </div>
                    )}
                    {isSelected ? (
                      <button
                        onClick={() => removeProduct(product.product_code)}
                        className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => addProduct(product)}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Add to Quote
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedProducts.size > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-3">
                Selected: {selectedProducts.size} product(s)
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedProducts.values()).map((product) => (
                  <span
                    key={product.product_code}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"
                  >
                    {product.product_code}
                    <button
                      onClick={() => removeProduct(product.product_code)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Button */}
        <div className="mb-6">
          <button
            onClick={handlePreview}
            disabled={!companyId || selectedContactIds.size === 0 || selectedProducts.size === 0}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
          >
            Preview Quote →
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Review pricing, quantities, and terms before sending to {selectedContactIds.size} contact(s)
          </p>
        </div>

        {/* Generated Link */}
        {generatedLink && (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
              <p className="text-green-900 font-semibold mb-2">
                ✓ Quote link generated successfully!
              </p>
              <p className="text-sm text-green-800">
                Share this link with your customer(s) to view pricing and complete checkout.
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
                  {sendingEmail ? 'Sending...' : `Email to ${selectedContactIds.size} Contact(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
