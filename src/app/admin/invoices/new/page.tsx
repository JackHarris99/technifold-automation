/**
 * Technifold Invoice Builder
 * Premium precision engineering aesthetic
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

  useEffect(() => {
    loadCompanies();
    const params = new URLSearchParams(window.location.search);
    const companyIdFromUrl = params.get('company_id');
    if (companyIdFromUrl) {
      setSelectedCompanyId(companyIdFromUrl);
    }
  }, []);

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

  useEffect(() => {
    if (selectedCompanyId) {
      loadContacts(selectedCompanyId);
      const company = companies.find(c => c.company_id === selectedCompanyId);
      if (company) {
        setCompanySearch(company.company_name);
      }
    }
  }, [selectedCompanyId, companies]);

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

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [productSearch]);

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
    if (!product.price || product.price === 0) {
      alert('Cannot add product: Price not set in database');
      return;
    }

    const existingIndex = invoiceItems.findIndex(item => item.product_code === product.product_code);

    if (existingIndex >= 0) {
      const newItems = [...invoiceItems];
      newItems[existingIndex].quantity += 1;
      setInvoiceItems(newItems);
    } else {
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

      const checkResponse = await fetch(`/api/companies/check-details-needed?company_id=${selectedCompanyId}`);
      const checkData = await checkResponse.json();

      if (checkData.details_needed) {
        setShowAddressModal(true);
        setLoading(false);
        return;
      }

      const itemsToSend = preview.line_items.map(item => ({
        product_code: item.product_code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

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
    setLoading(true);
    await createInvoice();
  };

  const handleAddressCancel = () => {
    setShowAddressModal(false);
  };

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);
  const selectedContact = contacts.find(c => c.contact_id === selectedContactId);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          letter-spacing: -0.011em;
        }

        body {
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        }
      `}</style>

      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-[1600px] mx-auto px-6 py-12">
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
          <div className="mb-16">
            <h1 className="text-[56px] font-[800] text-[#0a0a0a] mb-3 tracking-[-0.04em] leading-[1.1]">
              Invoice Builder
            </h1>
            <p className="text-[19px] text-[#666] font-[400] tracking-[-0.01em]">
              Professional invoicing with intelligent tiered pricing
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <div className="col-span-4 space-y-6">
              {/* Company Selection */}
              <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] transition-all duration-200 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                    <span className="text-white font-[700] text-[15px]">1</span>
                  </div>
                  <h2 className="text-[17px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">Select Company</h2>
                </div>

                {loadingCompanies ? (
                  <div className="text-[#999] text-[15px]">Loading...</div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => {
                        setCompanySearch(e.target.value);
                        setShowCompanyDropdown(true);
                        if (!e.target.value) setSelectedCompanyId('');
                      }}
                      onFocus={() => setShowCompanyDropdown(true)}
                      placeholder="Search company..."
                      className="w-full px-5 py-4 bg-[#f5f5f5] border border-[#e8e8e8] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent text-[#0a0a0a] text-[15px] font-[500] transition-all placeholder:text-[#999] placeholder:font-[400]"
                    />

                    {showCompanyDropdown && filteredCompanies.length > 0 && (
                      <div className="absolute z-[100] w-full mt-2 bg-white border border-[#e8e8e8] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-h-[400px] overflow-y-auto">
                        {filteredCompanies.map((company) => (
                          <button
                            key={company.company_id}
                            onClick={() => selectCompany(company)}
                            className="w-full px-5 py-4 text-left hover:bg-[#f9f9f9] transition-colors border-b border-[#f0f0f0] last:border-b-0 first:rounded-t-[16px] last:rounded-b-[16px]"
                          >
                            <div className="font-[600] text-[#0a0a0a] text-[15px] tracking-[-0.01em]">{company.company_name}</div>
                            <div className="text-[13px] text-[#999] mt-1 font-[400]">
                              {company.company_id} · {company.country || 'Unknown'}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedCompany && (
                  <div className="mt-5 p-5 bg-[#f9fafb] rounded-[14px] border border-[#e8e8e8]">
                    <div className="text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em] mb-3">Selected</div>
                    <div className="text-[15px] text-[#0a0a0a] space-y-2">
                      <div className="font-[600] tracking-[-0.01em]">{selectedCompany.company_name}</div>
                      <div className="text-[13px] text-[#666] font-[400]">{selectedCompany.country || 'GB'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Selection */}
              {selectedCompanyId && (
                <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] transition-all duration-200 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                      <span className="text-white font-[700] text-[15px]">2</span>
                    </div>
                    <h2 className="text-[17px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">Select Contact</h2>
                  </div>

                  {loadingContacts ? (
                    <div className="text-[#999] text-[15px]">Loading...</div>
                  ) : contacts.length === 0 ? (
                    <div className="text-[#e67e22] text-[15px]">No contacts found</div>
                  ) : (
                    <>
                      <select
                        value={selectedContactId}
                        onChange={(e) => setSelectedContactId(e.target.value)}
                        className="w-full px-5 py-4 bg-[#f5f5f5] border border-[#e8e8e8] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent text-[#0a0a0a] text-[15px] font-[500] transition-all"
                      >
                        {contacts.map((contact) => (
                          <option key={contact.contact_id} value={contact.contact_id}>
                            {contact.full_name}
                          </option>
                        ))}
                      </select>

                      {selectedContact && (
                        <div className="mt-5 p-5 bg-[#f9fafb] rounded-[14px] border border-[#e8e8e8]">
                          <div className="text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em] mb-3">Recipient</div>
                          <div className="text-[15px] text-[#0a0a0a]">
                            <div className="font-[600] tracking-[-0.01em]">{selectedContact.full_name}</div>
                            <div className="text-[13px] text-[#666] mt-1 font-[400]">{selectedContact.email}</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Summary Sidebar */}
              {preview && (
                <div className="bg-[#0a0a0a] rounded-[20px] p-8 text-white sticky top-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
                  <div className="text-[12px] font-[700] text-[#999] uppercase tracking-[0.05em] mb-6">Invoice Summary</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
                      <span className="text-[15px] text-[#999] font-[500]">Subtotal</span>
                      <span className="font-[700] text-[17px] tracking-[-0.01em]">£{preview.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-[#999] font-[500]">Shipping</span>
                      <span className="font-[600] text-[15px]">£{preview.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
                      <span className="text-[15px] text-[#999] font-[500]">VAT ({(preview.vat_rate * 100).toFixed(0)}%)</span>
                      <span className="font-[600] text-[15px]">£{preview.vat_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[19px] font-[700] tracking-[-0.01em]">Total</span>
                      <span className="text-[28px] font-[800] tracking-[-0.02em]">£{preview.total.toFixed(2)}</span>
                    </div>
                    {preview.total_savings > 0 && (
                      <div className="mt-5 p-4 bg-[#16a34a] rounded-[12px]">
                        <div className="text-[12px] text-white/80 mb-1 font-[600]">Total Savings</div>
                        <div className="text-[22px] font-[800] text-white tracking-[-0.02em]">£{preview.total_savings.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content */}
            <div className="col-span-8 space-y-6">
              {/* Product Search */}
              {selectedCompanyId && selectedContactId && (
                <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] transition-all duration-200 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                      <span className="text-white font-[700] text-[15px]">3</span>
                    </div>
                    <h2 className="text-[17px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">Add Products</h2>
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
                      className="w-full px-5 py-4 bg-[#f5f5f5] border border-[#e8e8e8] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent text-[#0a0a0a] text-[15px] font-[500] transition-all placeholder:text-[#999] placeholder:font-[400]"
                    />

                    {showProductDropdown && productSuggestions.length > 0 && (
                      <div className="absolute z-[200] w-full mt-2 bg-white border border-[#e8e8e8] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-h-[500px] overflow-y-auto">
                        {productSuggestions.map((product, index) => (
                          <button
                            key={index}
                            onClick={() => addProductToInvoice(product)}
                            className="w-full px-5 py-4 text-left hover:bg-[#f9f9f9] transition-colors border-b border-[#f0f0f0] last:border-b-0 first:rounded-t-[16px] last:rounded-b-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!product.price || product.price === 0}
                          >
                            <div className="flex items-center gap-4">
                              {product.image_url ? (
                                <div className="w-16 h-16 relative flex-shrink-0 bg-[#fafafa] rounded-[12px] overflow-hidden border border-[#e8e8e8]">
                                  <Image
                                    src={product.image_url}
                                    alt={product.product_code}
                                    fill
                                    className="object-contain p-2"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 flex-shrink-0 bg-[#fafafa] rounded-[12px] flex items-center justify-center border border-[#e8e8e8]">
                                  <span className="text-[#ccc] text-[11px] font-[500]">No image</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-[600] text-[#0a0a0a] truncate text-[15px] tracking-[-0.01em]">{product.product_code}</div>
                                <div className="text-[13px] text-[#666] truncate mt-1 font-[400]">{product.description}</div>
                                <div className={`text-[14px] font-[700] mt-2 tracking-[-0.01em] ${product.price ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                                  {product.price ? `£${product.price.toFixed(2)}` : 'Price not set'}
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

              {/* Invoice Table */}
              {invoiceItems.length > 0 && (
                <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] overflow-hidden">
                  {preview?.validation_errors && preview.validation_errors.length > 0 && (
                    <div className="p-6 bg-[#fef3c7] border-b border-[#fde68a]">
                      <div className="font-[700] text-[#92400e] text-[15px] mb-2 tracking-[-0.01em]">Validation Warnings</div>
                      {preview.validation_errors.map((error, idx) => (
                        <div key={idx} className="text-[14px] text-[#b45309] font-[500]">{error}</div>
                      ))}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#fafafa] border-b border-[#e8e8e8]">
                          <th className="text-left py-5 px-8 text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em]">Product</th>
                          <th className="text-center py-5 px-6 text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em] w-[120px]">Quantity</th>
                          <th className="text-right py-5 px-6 text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em]">Price</th>
                          <th className="text-right py-5 px-6 text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em]">Total</th>
                          <th className="w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f0]">
                        {preview && !loadingPreview ? (
                          preview.line_items.map((item, index) => {
                            const invoiceItem = invoiceItems.find(i => i.product_code === item.product_code);
                            const invoiceItemIndex = invoiceItems.findIndex(i => i.product_code === item.product_code);

                            return (
                              <tr key={index} className="group hover:bg-[#fafafa] transition-colors">
                                <td className="py-5 px-8">
                                  <div className="flex items-center gap-5">
                                    {item.image_url ? (
                                      <div className="w-20 h-20 relative flex-shrink-0 bg-[#fafafa] rounded-[14px] overflow-hidden border border-[#e8e8e8]">
                                        <Image
                                          src={item.image_url}
                                          alt={item.product_code}
                                          fill
                                          className="object-contain p-2"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-20 h-20 flex-shrink-0 bg-[#fafafa] rounded-[14px] flex items-center justify-center border border-[#e8e8e8]">
                                        <span className="text-[#ccc] text-[11px] font-[500]">No image</span>
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="font-mono text-[14px] font-[700] text-[#0a0a0a] tracking-tight">{item.product_code}</div>
                                      <div className="text-[14px] text-[#666] mt-1 font-[400]">{item.description}</div>
                                      {item.discount_applied && (
                                        <div className="inline-flex items-center mt-3 px-3 py-1.5 bg-[#16a34a] text-white text-[12px] rounded-full font-[700] tracking-tight">
                                          <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          {item.discount_applied}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-5 px-6 text-center">
                                  <input
                                    type="number"
                                    value={invoiceItem?.quantity || 1}
                                    onChange={(e) => updateItemQuantity(invoiceItemIndex, parseInt(e.target.value) || 1)}
                                    min="1"
                                    className="w-[90px] px-4 py-3 bg-[#f5f5f5] border border-[#e8e8e8] rounded-[12px] text-center text-[#0a0a0a] text-[15px] font-[700] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent transition-all tracking-tight"
                                  />
                                </td>
                                <td className="py-5 px-6 text-right">
                                  <div className="space-y-1.5">
                                    {item.base_price !== item.unit_price && (
                                      <div className="text-[13px] text-[#999] line-through font-[500]">
                                        £{item.base_price.toFixed(2)}
                                      </div>
                                    )}
                                    <div className="text-[15px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">
                                      £{item.unit_price.toFixed(2)}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-5 px-6 text-right">
                                  <div className="text-[17px] font-[800] text-[#0a0a0a] tracking-[-0.02em]">
                                    £{item.line_total.toFixed(2)}
                                  </div>
                                </td>
                                <td className="py-5 px-6 text-center">
                                  <button
                                    onClick={() => removeItem(invoiceItemIndex)}
                                    className="text-[#ccc] hover:text-[#dc2626] transition-colors p-2 rounded-[8px] hover:bg-[#fee2e2]"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : loadingPreview ? (
                          invoiceItems.map((_, index) => (
                            <tr key={index} className="animate-pulse">
                              <td className="py-5 px-8">
                                <div className="flex items-center gap-5">
                                  <div className="w-20 h-20 bg-[#f0f0f0] rounded-[14px]"></div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-[#f0f0f0] rounded-[8px] w-40 mb-3"></div>
                                    <div className="h-3 bg-[#f0f0f0] rounded-[8px] w-56"></div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 px-6 text-center">
                                <div className="h-12 w-[90px] bg-[#f0f0f0] rounded-[12px] mx-auto"></div>
                              </td>
                              <td className="py-5 px-6 text-right">
                                <div className="h-4 bg-[#f0f0f0] rounded-[8px] w-20 ml-auto"></div>
                              </td>
                              <td className="py-5 px-6 text-right">
                                <div className="h-5 bg-[#f0f0f0] rounded-[8px] w-24 ml-auto"></div>
                              </td>
                              <td className="py-5 px-6"></td>
                            </tr>
                          ))
                        ) : previewError ? (
                          <tr>
                            <td colSpan={5} className="py-12 px-8 text-center text-[#dc2626] text-[15px] font-[600]">
                              Preview Error: {previewError}
                            </td>
                          </tr>
                        ) : null}

                        {preview && !loadingPreview && (
                          <>
                            <tr className="bg-[#fafafa]">
                              <td colSpan={3} className="py-4 px-8 text-[15px] font-[700] text-[#0a0a0a] text-right tracking-[-0.01em]">
                                Subtotal
                              </td>
                              <td className="py-4 px-6 text-[17px] font-[800] text-[#0a0a0a] text-right tracking-[-0.02em]">
                                £{preview.subtotal.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                            <tr className="bg-[#fafafa]">
                              <td colSpan={3} className="py-3 px-8 text-[14px] text-[#666] text-right font-[500]">
                                Shipping to {preview.company.destination_country}
                              </td>
                              <td className="py-3 px-6 text-[15px] font-[700] text-[#0a0a0a] text-right tracking-[-0.01em]">
                                £{preview.shipping.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                            <tr className="bg-[#fafafa]">
                              <td colSpan={3} className="py-3 px-8 text-[14px] text-[#666] text-right font-[500]">
                                VAT ({(preview.vat_rate * 100).toFixed(0)}%)
                                {preview.vat_exempt_reason && (
                                  <span className="ml-2 text-[12px] text-[#16a34a] font-[600]">
                                    ({preview.vat_exempt_reason})
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-6 text-[15px] font-[700] text-[#0a0a0a] text-right tracking-[-0.01em]">
                                £{preview.vat_amount.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                            <tr className="bg-[#0a0a0a] text-white">
                              <td colSpan={3} className="py-6 px-8 text-[19px] font-[800] text-right tracking-[-0.02em]">
                                Total
                              </td>
                              <td className="py-6 px-6 text-[28px] font-[800] text-right tracking-[-0.03em]">
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
                <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] p-20 text-center">
                  <div className="w-20 h-20 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div className="text-[#666] text-[15px] font-[500]">
                    Search and add products to begin
                  </div>
                </div>
              )}

              {/* Send Button */}
              {preview && !loadingPreview && (
                <button
                  onClick={createInvoice}
                  disabled={loading}
                  className="w-full bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-10 py-6 rounded-[16px] font-[800] text-[17px] shadow-[0_4px_16px_rgba(0,0,0,0.16)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_8px_24px_rgba(0,0,0,0.24)] tracking-[-0.01em]"
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
                    <span className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Invoice to {selectedContact?.email}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-8 bg-[#fef2f2] border-2 border-[#fecaca] rounded-[20px] p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#dc2626] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[19px] font-[800] text-[#991b1b] tracking-[-0.01em]">Error</h3>
                  <p className="text-[#dc2626] mt-2 font-mono text-[14px] font-[500]">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="mt-8 bg-[#f0fdf4] border-2 border-[#86efac] rounded-[20px] p-10">
              <div className="flex items-start gap-5 mb-8">
                <div className="w-14 h-14 bg-[#16a34a] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[28px] font-[800] text-[#166534] tracking-[-0.02em]">Invoice Sent Successfully</h3>
                  <p className="text-[#16a34a] mt-2 text-[16px] font-[500]">The invoice has been sent to {selectedContact?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="bg-white rounded-[16px] p-6 border border-[#d1fae5]">
                  <div className="text-[12px] font-[700] text-[#16a34a] mb-2 uppercase tracking-[0.05em]">Order ID</div>
                  <div className="font-mono text-[15px] text-[#0a0a0a] font-[600]">{result.order_id || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-[16px] p-6 border border-[#d1fae5]">
                  <div className="text-[12px] font-[700] text-[#16a34a] mb-2 uppercase tracking-[0.05em]">Stripe Invoice ID</div>
                  <div className="font-mono text-[15px] text-[#0a0a0a] font-[600]">{result.invoice_id || 'N/A'}</div>
                </div>
              </div>

              {result.invoice_url && (
                <div className="bg-white rounded-[16px] p-6 border border-[#d1fae5] mb-5">
                  <div className="text-[12px] font-[700] text-[#16a34a] mb-3 uppercase tracking-[0.05em]">Payment Page</div>
                  <a href={result.invoice_url} target="_blank" rel="noopener noreferrer" className="text-[#0a0a0a] hover:text-[#16a34a] underline text-[14px] break-all font-[600]">
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
                className="w-full bg-white border-2 border-[#16a34a] text-[#16a34a] px-8 py-4 rounded-[14px] font-[800] hover:bg-[#f0fdf4] transition-all text-[16px] tracking-[-0.01em]"
              >
                Create Another Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
