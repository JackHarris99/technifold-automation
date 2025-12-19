/**
 * Interactive Invoice Builder
 * Premium design with live pricing preview
 */

'use client';

import { useState, useEffect } from 'react';
import AddressCollectionModal from '@/components/portals/AddressCollectionModal';
import Image from 'next/image';

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
  image_url: string | null;
}

interface InvoiceItem {
  product_code: string;
  quantity: number;
}

interface PreviewLineItem {
  product_code: string;
  description: string;
  quantity: number;
  base_price: number;
  unit_price: number;
  line_total: number;
  discount_applied?: string;
  image_url: string | null;
  currency: string;
}

interface InvoicePreview {
  company: {
    company_id: string;
    company_name: string;
    country: string;
    vat_number: string | null;
    destination_country: string;
  };
  line_items: PreviewLineItem[];
  subtotal: number;
  shipping: number;
  vat_amount: number;
  vat_rate: number;
  vat_exempt_reason: string | null;
  total: number;
  total_savings: number;
  currency: string;
  validation_errors: string[];
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
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Preview state
  const [preview, setPreview] = useState<InvoicePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

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

  // Load preview whenever items or company changes
  useEffect(() => {
    if (selectedCompanyId && invoiceItems.length > 0) {
      loadPreview();
    } else {
      setPreview(null);
      setPreviewError(null);
    }
  }, [selectedCompanyId, invoiceItems]);

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

  const loadPreview = async () => {
    setLoadingPreview(true);
    setPreviewError(null);

    try {
      const response = await fetch('/api/admin/invoices/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': 'Technifold',
        },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          items: invoiceItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success && data.preview) {
        setPreview(data.preview);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
      console.error('[PREVIEW] Error:', err);
      setPreviewError(errorMessage);
    } finally {
      setLoadingPreview(false);
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
        quantity: 1,
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

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const createInvoice = async () => {
    if (!preview) {
      alert('Please wait for preview to load');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (invoiceItems.length === 0) {
        throw new Error('Please add at least one product to the invoice');
      }

      // Check if addresses and VAT are needed
      console.log('[INVOICE] Checking if addresses needed for company:', selectedCompanyId);
      const checkResponse = await fetch(`/api/companies/check-details-needed?company_id=${selectedCompanyId}`);
      const checkData = await checkResponse.json();
      console.log('[INVOICE] Check result:', checkData);

      if (checkData.details_needed) {
        console.log('[INVOICE] Addresses needed - showing modal');
        // Show address collection modal
        setShowAddressModal(true);
        setLoading(false);
        return;
      }

      console.log('[INVOICE] Addresses OK - proceeding with invoice creation');

      // Build items from preview (use calculated prices)
      const itemsToSend = preview.line_items.map(item => ({
        product_code: item.product_code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      console.log('[INVOICE] Creating invoice with:', {
        company_id: selectedCompanyId,
        contact_id: selectedContactId,
        items: itemsToSend,
      });

      const response = await fetch('/api/admin/invoices/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': 'Technifold',
        },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          contact_id: selectedContactId,
          items: itemsToSend,
          currency: 'gbp',
          notes: 'Created via Interactive Invoice Builder',
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

  const handleAddressSaved = async () => {
    setShowAddressModal(false);
    // Retry invoice creation after addresses are saved
    setLoading(true);
    await createInvoice();
  };

  const handleAddressCancel = () => {
    setShowAddressModal(false);
  };

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);
  const selectedContact = contacts.find(c => c.contact_id === selectedContactId);

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
        {/* Address Collection Modal */}
        {showAddressModal && selectedCompany && (
          <AddressCollectionModal
            isOpen={showAddressModal}
            onClose={handleAddressCancel}
            companyId={selectedCompany.company_id}
            companyName={selectedCompany.company_name}
            onSuccess={handleAddressSaved}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-slate-900 mb-2 tracking-tight">
            Invoice Builder
          </h1>
          <p className="text-slate-600 text-lg">
            Create professional invoices with intelligent pricing
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Search */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Company</h2>
              </div>

              {loadingCompanies ? (
                <div className="text-slate-500 text-sm">Loading...</div>
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
                    placeholder="Search company..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
                  />

                  {showCompanyDropdown && filteredCompanies.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      {filteredCompanies.map((company) => (
                        <button
                          key={company.company_id}
                          onClick={() => selectCompany(company)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900">{company.company_name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {company.company_id} • {company.country || 'Unknown'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedCompany && (
                <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                  <div className="text-xs font-medium text-green-700 mb-2">Selected</div>
                  <div className="text-sm text-slate-700 space-y-1">
                    <div className="font-medium text-slate-900">{selectedCompany.company_name}</div>
                    <div className="text-xs text-slate-600">{selectedCompany.country || 'GB'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Selection */}
            {selectedCompanyId && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">2</span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
                </div>

                {loadingContacts ? (
                  <div className="text-slate-500 text-sm">Loading...</div>
                ) : contacts.length === 0 ? (
                  <div className="text-amber-600 text-sm">No contacts found</div>
                ) : (
                  <>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 transition-all"
                    >
                      {contacts.map((contact) => (
                        <option key={contact.contact_id} value={contact.contact_id}>
                          {contact.full_name}
                        </option>
                      ))}
                    </select>

                    {selectedContact && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border border-purple-200/50">
                        <div className="text-xs font-medium text-purple-700 mb-2">Recipient</div>
                        <div className="text-sm text-slate-700">
                          <div className="font-medium text-slate-900">{selectedContact.full_name}</div>
                          <div className="text-xs text-slate-600 mt-0.5">{selectedContact.email}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Preview Summary (Sticky) */}
            {preview && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 text-white sticky top-6">
                <div className="text-xs font-medium text-slate-400 mb-3">Invoice Summary</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="text-sm text-slate-300">Subtotal</span>
                    <span className="font-semibold">£{preview.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Shipping</span>
                    <span className="font-medium">£{preview.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="text-sm text-slate-300">
                      VAT ({(preview.vat_rate * 100).toFixed(0)}%)
                    </span>
                    <span className="font-medium">£{preview.vat_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">£{preview.total.toFixed(2)}</span>
                  </div>
                  {preview.total_savings > 0 && (
                    <div className="mt-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <div className="text-xs text-green-300 mb-1">Total Savings</div>
                      <div className="text-lg font-bold text-green-400">£{preview.total_savings.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Products & Invoice */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Search */}
            {selectedCompanyId && selectedContactId && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-sm">3</span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Add Products</h2>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Search products..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 transition-all"
                  />

                  {showProductDropdown && productSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      {productSuggestions.map((product, index) => (
                        <button
                          key={index}
                          onClick={() => addProductToInvoice(product)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                          disabled={!product.price || product.price === 0}
                        >
                          <div className="flex items-center gap-4">
                            {product.image_url ? (
                              <div className="w-14 h-14 relative flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                                <Image
                                  src={product.image_url}
                                  alt={product.product_code}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-400 text-xs">No image</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 truncate">{product.product_code}</div>
                              <div className="text-sm text-slate-600 truncate">{product.description}</div>
                              <div className={`text-sm font-semibold mt-1 ${product.price ? 'text-emerald-600' : 'text-red-600'}`}>
                                {product.price
                                  ? `£${product.price.toFixed(2)}`
                                  : 'Price not set'}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invoice Preview */}
            {invoiceItems.length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden transition-all hover:shadow-md">
                {/* Validation Warnings */}
                {preview?.validation_errors && preview.validation_errors.length > 0 && (
                  <div className="p-4 bg-amber-50 border-b border-amber-200">
                    <div className="font-medium text-amber-900 text-sm mb-2">Validation Warnings</div>
                    {preview.validation_errors.map((error, idx) => (
                      <div key={idx} className="text-sm text-amber-700">{error}</div>
                    ))}
                  </div>
                )}

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                        <th className="text-center py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                        <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                        <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingPreview ? (
                        // Skeleton loader - maintains height
                        invoiceItems.map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                                  <div className="h-3 bg-slate-200 rounded w-48"></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="h-9 w-16 bg-slate-200 rounded-lg mx-auto"></div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div>
                            </td>
                            <td className="py-4 px-4"></td>
                          </tr>
                        ))
                      ) : previewError ? (
                        <tr>
                          <td colSpan={5} className="py-8 px-6 text-center text-red-600">
                            Preview Error: {previewError}
                          </td>
                        </tr>
                      ) : preview ? (
                        preview.line_items.map((item, index) => {
                          const invoiceItem = invoiceItems.find(i => i.product_code === item.product_code);
                          const invoiceItemIndex = invoiceItems.findIndex(i => i.product_code === item.product_code);

                          return (
                            <tr key={index} className="group hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-4">
                                  {item.image_url ? (
                                    <div className="w-16 h-16 relative flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                                      <Image
                                        src={item.image_url}
                                        alt={item.product_code}
                                        fill
                                        className="object-contain p-1"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center">
                                      <span className="text-slate-400 text-xs">No image</span>
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="font-mono text-sm font-semibold text-slate-900">{item.product_code}</div>
                                    <div className="text-sm text-slate-600 mt-0.5">{item.description}</div>
                                    {item.discount_applied && (
                                      <div className="inline-flex items-center mt-2 px-2 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs rounded-full font-medium">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {item.discount_applied}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="number"
                                  value={invoiceItem?.quantity || 1}
                                  onChange={(e) => updateItemQuantity(invoiceItemIndex, parseInt(e.target.value) || 1)}
                                  min="1"
                                  className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="space-y-1">
                                  {item.base_price !== item.unit_price && (
                                    <div className="text-xs text-slate-400 line-through">
                                      £{item.base_price.toFixed(2)}
                                    </div>
                                  )}
                                  <div className="text-sm font-semibold text-slate-900">
                                    £{item.unit_price.toFixed(2)}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="text-base font-bold text-slate-900">
                                  £{item.line_total.toFixed(2)}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => removeItem(invoiceItemIndex)}
                                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : null}

                      {/* Totals */}
                      {preview && !loadingPreview && (
                        <>
                          <tr className="bg-slate-50">
                            <td colSpan={3} className="py-3 px-6 text-sm font-semibold text-slate-700 text-right">
                              Subtotal
                            </td>
                            <td className="py-3 px-4 text-base font-bold text-slate-900 text-right">
                              £{preview.subtotal.toFixed(2)}
                            </td>
                            <td></td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td colSpan={3} className="py-2 px-6 text-sm text-slate-600 text-right">
                              Shipping to {preview.company.destination_country}
                            </td>
                            <td className="py-2 px-4 text-sm font-medium text-slate-900 text-right">
                              £{preview.shipping.toFixed(2)}
                            </td>
                            <td></td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td colSpan={3} className="py-2 px-6 text-sm text-slate-600 text-right">
                              VAT ({(preview.vat_rate * 100).toFixed(0)}%)
                              {preview.vat_exempt_reason && (
                                <span className="ml-2 text-xs text-emerald-600">
                                  ({preview.vat_exempt_reason})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-4 text-sm font-medium text-slate-900 text-right">
                              £{preview.vat_amount.toFixed(2)}
                            </td>
                            <td></td>
                          </tr>
                          <tr className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <td colSpan={3} className="py-4 px-6 text-lg font-bold text-right">
                              Total
                            </td>
                            <td className="py-4 px-4 text-2xl font-bold text-right">
                              £{preview.total.toFixed(2)}
                            </td>
                            <td></td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {invoiceItems.length === 0 && selectedCompanyId && selectedContactId && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div className="text-slate-600">
                  Search and add products to begin
                </div>
              </div>
            )}

            {/* Send Invoice Button */}
            {preview && !loadingPreview && (
              <button
                onClick={createInvoice}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-5 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-xl hover:shadow-blue-500/40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Invoice...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Invoice to {selectedContact?.email}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Error</h3>
                <p className="text-red-700 mt-1 font-mono text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-900">Invoice Created Successfully!</h3>
                <p className="text-green-700 mt-1">The invoice has been sent to {selectedContact?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="text-xs font-semibold text-green-700 mb-1">Order ID</div>
                <div className="font-mono text-sm text-slate-900">{result.order_id || 'N/A'}</div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="text-xs font-semibold text-green-700 mb-1">Stripe Invoice ID</div>
                <div className="font-mono text-sm text-slate-900">{result.invoice_id || 'N/A'}</div>
              </div>
            </div>

            {result.invoice_url && (
              <div className="bg-white rounded-xl p-4 border border-green-200 mb-4">
                <div className="text-xs font-semibold text-green-700 mb-2">Customer Payment Page</div>
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

            <button
              onClick={() => {
                setResult(null);
                setInvoiceItems([]);
                setPreview(null);
              }}
              className="w-full bg-white border-2 border-green-600 text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all"
            >
              Create Another Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
