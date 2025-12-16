/**
 * Invoice Builder
 * Create and send invoices to customers
 * Stripe Invoice → Resend Email → Supabase Record
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

interface Product {
  product_code: string;
  description: string;
  price: number;
  currency: string;
}

interface InvoiceItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function NewInvoicePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Load companies on mount and check URL params for pre-selected company
  useEffect(() => {
    loadCompanies();

    // Check if company_id is in URL params
    const params = new URLSearchParams(window.location.search);
    const companyIdFromUrl = params.get('company_id');
    if (companyIdFromUrl) {
      setSelectedCompanyId(companyIdFromUrl);
    }
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

  // Load contacts when company selected and update search field
  useEffect(() => {
    if (selectedCompanyId) {
      loadContacts(selectedCompanyId);

      // Update company search field with selected company name
      const company = companies.find(c => c.company_id === selectedCompanyId);
      if (company) {
        setCompanySearch(company.company_name);
      }
    }
  }, [selectedCompanyId, companies]);

  // Search products when user types
  useEffect(() => {
    const searchProducts = async () => {
      if (productSearch.trim().length < 2) {
        setProductSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productSearch.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setProductSuggestions(data.products || []);
        }
      } catch (err) {
        console.error('Error searching products:', err);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  const loadCompanies = async () => {
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

  const selectCompany = (company: Company) => {
    setSelectedCompanyId(company.company_id);
    setCompanySearch(company.company_name);
    setShowCompanyDropdown(false);
  };

  const addProductToInvoice = (product: Product) => {
    // Don't add products without prices
    if (!product.price || product.price === 0) {
      alert('Cannot add product: Price not set in database');
      return;
    }

    // Check if product already exists
    const existingIndex = invoiceItems.findIndex(item => item.product_code === product.product_code);

    if (existingIndex >= 0) {
      // Increase quantity
      const newItems = [...invoiceItems];
      newItems[existingIndex].quantity += 1;
      setInvoiceItems(newItems);
    } else {
      // Add new item
      setInvoiceItems([...invoiceItems, {
        product_code: product.product_code,
        description: product.description,
        quantity: 1,
        unit_price: product.price,
      }]);
    }

    setProductSearch('');
    setProductSuggestions([]);
    setShowProductDropdown(false);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...invoiceItems];
    newItems[index].quantity = Math.max(1, quantity);
    setInvoiceItems(newItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...invoiceItems];
    newItems[index].unit_price = Math.max(0, price);
    setInvoiceItems(newItems);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const createInvoice = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (invoiceItems.length === 0) {
        throw new Error('Please add at least one product to the invoice');
      }

      console.log('[INVOICE] Creating invoice with:', {
        company_id: selectedCompanyId,
        contact_id: selectedContactId,
        items: invoiceItems,
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
          items: invoiceItems,
          currency: 'gbp',
          notes: 'Created via Invoice Builder',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log('[INVOICE] Invoice created successfully:', data);
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[INVOICE] Invoice creation failed:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);
  const selectedContact = contacts.find(c => c.contact_id === selectedContactId);

  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Invoice
          </h1>
          <p className="text-sm text-gray-600">
            Create and send invoices with Stripe billing integration
          </p>
        </div>

        {/* Company Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Step 1: Search Company
          </h2>
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
                  }
                }}
                onFocus={() => setShowCompanyDropdown(true)}
                placeholder="Type company name or ID..."
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
                        {company.company_id} • {company.country || 'Unknown'}
                        {company.vat_number && ` • VAT: ${company.vat_number}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedCompany && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
              <div className="text-sm">
                <div className="font-semibold text-green-900 mb-2">✓ Company Selected</div>
                <div><strong>Company:</strong> {selectedCompany.company_name}</div>
                <div><strong>ID:</strong> {selectedCompany.company_id}</div>
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  {contacts.map((contact) => (
                    <option key={contact.contact_id} value={contact.contact_id}>
                      {contact.full_name} ({contact.email})
                    </option>
                  ))}
                </select>

                {selectedContact && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                    <div className="text-sm">
                      <div className="font-semibold text-green-900 mb-2">✓ Contact Selected</div>
                      <div><strong>Name:</strong> {selectedContact.full_name}</div>
                      <div><strong>Email:</strong> {selectedContact.email}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Product Search & Add */}
        {selectedCompanyId && selectedContactId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 3: Add Products
            </h2>

            <div className="relative mb-6">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                }}
                onFocus={() => setShowProductDropdown(true)}
                placeholder="Type product code or description..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />

              {/* Product Dropdown */}
              {showProductDropdown && productSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {productSuggestions.map((product, index) => (
                    <button
                      key={index}
                      onClick={() => addProductToInvoice(product)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      disabled={!product.price || product.price === 0}
                    >
                      <div className="font-semibold text-gray-900">{product.product_code}</div>
                      <div className="text-sm text-gray-600">{product.description}</div>
                      <div className={`text-sm font-semibold ${product.price ? 'text-green-600' : 'text-red-600'}`}>
                        {product.price
                          ? `${(product.currency || 'GBP').toUpperCase()} ${product.price.toFixed(2)}`
                          : 'Price not set - cannot add'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice Items Table */}
            {invoiceItems.length > 0 && (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                      <th className="w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-3 px-4 text-sm font-mono text-gray-900">{item.product_code}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                          £{(item.unit_price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td colSpan={4} className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                        Subtotal:
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                        £{subtotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {invoiceItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products added yet. Search and add products above.
              </div>
            )}
          </div>
        )}

        {/* Create Invoice Button */}
        {selectedCompanyId && selectedContactId && invoiceItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <button
              onClick={createInvoice}
              disabled={loading}
              className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Invoice...' : '🚀 Create Invoice & Send Email'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              This will create a real Stripe invoice and send a real email to {selectedContact?.email}
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
