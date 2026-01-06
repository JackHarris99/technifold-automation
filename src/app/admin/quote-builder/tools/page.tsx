/**
 * Tools Quote Builder
 * Creates sales-controlled quotes for tools with tier guidance
 * Shows max discount possible based on quantity, sales rep sets final discount
 * Generates STATIC quotes (customers cannot adjust quantities)
 */

'use client';

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

interface Company {
  company_id: string;
  company_name: string;
  country?: string;
}

interface Contact {
  contact_id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

interface Product {
  product_code: string;
  description: string;
  price: number;
  category?: string;
  image_url?: string;
  product_type: string;
}

interface QuoteLineItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  product_type: 'tool';
  category?: string;
  image_url?: string;
}

interface PricingTier {
  tier_name: string;
  min_quantity: number;
  discount_percent: number;
}

export default function ToolsQuoteBuilderPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [blanketDiscount, setBlanketDiscount] = useState<number>(0);

  const [toolTiers, setToolTiers] = useState<PricingTier[]>([]);

  const [quoteUrl, setQuoteUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadCompanies();
    loadPricingTiers();
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
    if (selectedCompany) {
      loadContacts(selectedCompany.company_id);
    }
  }, [selectedCompany]);

  // Auto-search with debounce
  useEffect(() => {
    if (!productSearch.trim()) {
      setSearchResults([]);
      setShowProductDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearch]);

  async function loadCompanies() {
    try {
      const response = await fetch('/api/admin/companies/all');
      const data = await response.json();
      setCompanies(data.companies || []);
      setFilteredCompanies((data.companies || []).slice(0, 20));
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  }

  async function loadContacts(companyId: string) {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts`);
      const data = await response.json();
      setContacts(data.contacts || []);
      if (data.contacts?.length > 0) {
        setSelectedContact(data.contacts[0]);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }

  async function loadPricingTiers() {
    try {
      const response = await fetch('/api/admin/pricing-tiers');
      const data = await response.json();
      setToolTiers(data.tool || []);
    } catch (err) {
      console.error('Failed to load pricing tiers:', err);
    }
  }

  async function searchProducts() {
    if (!productSearch.trim()) return;

    setSearching(true);
    try {
      // Only search for tools
      const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productSearch)}&types=tool`);
      const data = await response.json();
      setSearchResults(data.products || []);
      setShowProductDropdown(true);
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setSearching(false);
    }
  }

  function addLineItem(product: Product) {
    const existing = lineItems.find(li => li.product_code === product.product_code);
    if (existing) {
      updateQuantity(product.product_code, existing.quantity + 1);
      setProductSearch('');
      setSearchResults([]);
      setShowProductDropdown(false);
      return;
    }

    const newItem: QuoteLineItem = {
      product_code: product.product_code,
      description: product.description,
      quantity: 1,
      unit_price: product.price,
      product_type: 'tool',
      category: product.category,
      image_url: product.image_url,
    };

    setLineItems([...lineItems, newItem]);
    setProductSearch('');
    setSearchResults([]);
    setShowProductDropdown(false);
  }

  function updateQuantity(productCode: string, quantity: number) {
    if (quantity < 1) {
      removeLineItem(productCode);
      return;
    }
    setLineItems(lineItems.map(li =>
      li.product_code === productCode ? { ...li, quantity } : li
    ));
  }

  function removeLineItem(productCode: string) {
    setLineItems(lineItems.filter(li => li.product_code !== productCode));
  }

  function calculateTotals() {
    const subtotal = lineItems.reduce((sum, li) => sum + (li.unit_price * li.quantity), 0);
    const totalDiscount = (subtotal * blanketDiscount) / 100;
    const total = subtotal - totalDiscount;
    return { subtotal, totalDiscount, total };
  }

  async function generateQuote() {
    if (!selectedCompany || !selectedContact || lineItems.length === 0) {
      alert('Please select company, contact, and add products');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/admin/quotes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompany.company_id,
          contact_id: selectedContact.contact_id,
          line_items: lineItems.map(li => ({
            ...li,
            discount_percent: blanketDiscount, // Apply blanket discount to all
          })),
          quote_type: 'tool_static', // Mark as static tool quote
        }),
      });

      const data = await response.json();
      if (data.url) {
        setQuoteUrl(data.url);
      } else {
        alert('Failed to generate quote: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error generating quote');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const { subtotal, totalDiscount, total } = calculateTotals();
  const toolQty = lineItems.reduce((sum, li) => sum + li.quantity, 0);
  const currentTier = [...toolTiers].reverse().find(t => toolQty >= t.min_quantity);
  const maxDiscount = currentTier?.discount_percent || 0;

  return (
    <div className={`${inter.className} min-h-screen bg-[#fafafa]`}>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-[800] text-[#0a0a0a] tracking-[-0.04em] mb-2">
            Tools Quote Builder
          </h1>
          <p className="text-[15px] text-[#666] font-[400] tracking-[-0.01em]">
            Sales-controlled quotes with tier guidance • Generates static quotes for customers
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Company Selection */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[32px] h-[32px] rounded-full bg-[#0a0a0a] flex items-center justify-center">
                  <span className="text-[14px] font-[700] text-white">1</span>
                </div>
                <h2 className="text-[18px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                  Select Company
                </h2>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(e.target.value);
                    setShowCompanyDropdown(true);
                    if (!e.target.value) {
                      setSelectedCompany(null);
                      setSelectedContact(null);
                    }
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  placeholder="Search company name..."
                  className="w-full px-4 py-3 border border-[#e8e8e8] rounded-[14px] text-[15px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent"
                />

                {showCompanyDropdown && filteredCompanies.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-[#e8e8e8] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-[300px] overflow-y-auto">
                    {filteredCompanies.map((company) => (
                      <button
                        key={company.company_id}
                        onClick={() => {
                          setSelectedCompany(company);
                          setCompanySearch(company.company_name);
                          setShowCompanyDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#fafafa] border-b border-[#e8e8e8] last:border-b-0 transition-colors"
                      >
                        <div className="text-[15px] font-[600] text-[#0a0a0a]">{company.company_name}</div>
                        <div className="text-[13px] text-[#666] mt-0.5">{company.company_id} • {company.country || 'UK'}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCompany && (
                <div className="mt-4 p-3 bg-[#fafafa] rounded-[14px] border border-[#e8e8e8]">
                  <div className="text-[13px] text-[#666] font-[500]">Selected</div>
                  <div className="text-[15px] font-[600] text-[#0a0a0a] mt-1">{selectedCompany.company_name}</div>
                </div>
              )}
            </div>

            {/* Contact Selection */}
            {selectedCompany && (
              <div className="bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[32px] h-[32px] rounded-full bg-[#0a0a0a] flex items-center justify-center">
                    <span className="text-[14px] font-[700] text-white">2</span>
                  </div>
                  <h2 className="text-[18px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                    Select Contact
                  </h2>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-[15px] text-[#666] font-[400]">No contacts found</div>
                ) : (
                  <select
                    value={selectedContact?.contact_id || ''}
                    onChange={(e) => {
                      const contact = contacts.find(c => c.contact_id === e.target.value);
                      setSelectedContact(contact || null);
                    }}
                    className="w-full px-4 py-3 border border-[#e8e8e8] rounded-[14px] text-[15px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent"
                  >
                    {contacts.map((contact) => (
                      <option key={contact.contact_id} value={contact.contact_id}>
                        {contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim()} ({contact.email})
                      </option>
                    ))}
                  </select>
                )}

                {selectedContact && (
                  <div className="mt-4 p-3 bg-[#fafafa] rounded-[14px] border border-[#e8e8e8]">
                    <div className="text-[13px] text-[#666] font-[500]">Selected</div>
                    <div className="text-[15px] font-[600] text-[#0a0a0a] mt-1">
                      {selectedContact.full_name || `${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim()}
                    </div>
                    <div className="text-[13px] text-[#666] mt-0.5">{selectedContact.email}</div>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Guidance & Summary */}
            {lineItems.length > 0 && (
              <div className="bg-[#0a0a0a] rounded-[20px] p-6 text-white sticky top-6">
                <h3 className="text-[18px] font-[700] tracking-[-0.02em] mb-4">Pricing Control</h3>

                {/* Tier Guidance */}
                <div className="mb-6 p-4 bg-white/10 rounded-[14px]">
                  <div className="text-[13px] text-white/70 font-[500] mb-2">Volume Discount Guidance</div>
                  <div className="text-[20px] font-[800] text-white mb-1">
                    {toolQty} tool{toolQty !== 1 ? 's' : ''} = Max {maxDiscount}% off
                  </div>
                  <div className="text-[13px] text-white/70">
                    £{subtotal.toFixed(2)} → £{(subtotal * (1 - maxDiscount / 100)).toFixed(2)}
                  </div>
                </div>

                {/* Discount Control */}
                <div className="mb-6">
                  <label className="text-[13px] text-white/70 font-[500] block mb-2">
                    Apply Blanket Discount (0-{maxDiscount}%)
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="range"
                      min="0"
                      max={maxDiscount}
                      step="0.5"
                      value={blanketDiscount}
                      onChange={(e) => setBlanketDiscount(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max={maxDiscount}
                      step="0.5"
                      value={blanketDiscount}
                      onChange={(e) => setBlanketDiscount(Math.min(maxDiscount, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded-[8px] text-center text-white font-[600]"
                    />
                    <span className="text-[14px] font-[600]">%</span>
                  </div>
                  <div className="text-[12px] text-white/70">
                    Applied equally to all {toolQty} tools
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6 pt-6 border-t border-white/20">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/70 font-[400]">Subtotal</span>
                    <span className="font-[600]">£{subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-[15px]">
                      <span className="text-white/70 font-[400]">Discount ({blanketDiscount}%)</span>
                      <span className="font-[600] text-green-400">-£{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/20 my-3"></div>
                  <div className="flex justify-between text-[20px]">
                    <span className="font-[700]">Total</span>
                    <span className="font-[800]">£{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={generateQuote}
                  disabled={!selectedCompany || !selectedContact || lineItems.length === 0 || generating}
                  className="w-full py-3 bg-white text-[#0a0a0a] rounded-[14px] text-[15px] font-[700] tracking-[-0.01em] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : 'Generate Static Quote'}
                </button>
              </div>
            )}
          </div>

          {/* Right Main Area */}
          <div className="col-span-8 space-y-6">
            {/* Product Search */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[32px] h-[32px] rounded-full bg-[#0a0a0a] flex items-center justify-center">
                  <span className="text-[14px] font-[700] text-white">3</span>
                </div>
                <h2 className="text-[18px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                  Add Tools
                </h2>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowProductDropdown(true)}
                  placeholder="Start typing to search tools..."
                  className="w-full px-4 py-3 border border-[#e8e8e8] rounded-[14px] text-[15px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent"
                />
                {searching && (
                  <div className="absolute right-3 top-3 text-[13px] text-[#666]">Searching...</div>
                )}

                {showProductDropdown && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-[#e8e8e8] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-[400px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.product_code}
                        onClick={() => addLineItem(product)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-[#fafafa] border-b border-[#e8e8e8] last:border-b-0 transition-colors text-left"
                      >
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.description}
                            className="w-12 h-12 object-cover rounded-[8px]"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-[15px] font-[600] text-[#0a0a0a]">{product.description}</div>
                          <div className="text-[13px] text-[#666]">
                            {product.product_code} • £{product.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-[#0a0a0a] text-white rounded-[8px] text-[13px] font-[600]">
                          Add
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quote Line Items */}
            {lineItems.length > 0 && (
              <div className="bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[32px] h-[32px] rounded-full bg-[#0a0a0a] flex items-center justify-center">
                    <span className="text-[14px] font-[700] text-white">4</span>
                  </div>
                  <h2 className="text-[18px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                    Quote Items
                  </h2>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item) => {
                    const itemSubtotal = item.unit_price * item.quantity;
                    const itemDiscount = (itemSubtotal * blanketDiscount) / 100;
                    const itemTotal = itemSubtotal - itemDiscount;

                    return (
                      <div
                        key={item.product_code}
                        className="flex items-center gap-4 p-4 border border-[#e8e8e8] rounded-[14px]"
                      >
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.description}
                            className="w-16 h-16 object-cover rounded-[8px]"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-[15px] font-[600] text-[#0a0a0a] mb-1">{item.description}</div>
                          <div className="text-[13px] text-[#666] mb-2">
                            {item.product_code} • £{item.unit_price.toFixed(2)}/unit
                            {blanketDiscount > 0 && (
                              <span className="ml-2 text-green-600 font-[600]">
                                ({blanketDiscount}% off)
                              </span>
                            )}
                          </div>
                          <div>
                            <label className="text-[12px] text-[#666] font-[500] block mb-1">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product_code, parseInt(e.target.value) || 1)}
                              className="w-24 px-3 py-1.5 border border-[#e8e8e8] rounded-[8px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[18px] font-[700] text-[#0a0a0a] mb-2">
                            £{itemTotal.toFixed(2)}
                          </div>
                          {blanketDiscount > 0 && (
                            <div className="text-[13px] text-gray-500 line-through mb-2">
                              £{itemSubtotal.toFixed(2)}
                            </div>
                          )}
                          <button
                            onClick={() => removeLineItem(item.product_code)}
                            className="text-[13px] text-red-600 hover:text-red-700 font-[600]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Quote URL */}
        {quoteUrl && (
          <div className="mt-6 bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="text-[18px] font-[700] text-[#0a0a0a] tracking-[-0.02em] mb-4">Static Quote Generated</h3>
            <div className="bg-blue-50 p-4 rounded-[14px] border border-blue-200 mb-4">
              <p className="text-[14px] text-blue-800 mb-2">
                ✓ Customer will see fixed prices (no quantity adjustments)
              </p>
              <a
                href={quoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] text-blue-600 hover:text-blue-700 font-[500] break-all"
              >
                {quoteUrl}
              </a>
            </div>
            <div className="flex gap-3">
              <a
                href={quoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#0a0a0a] text-white rounded-[14px] text-[15px] font-[700] hover:bg-[#222] transition-colors"
              >
                👁️ Preview as Customer
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(quoteUrl);
                  alert('Link copied to clipboard!');
                }}
                className="px-6 py-3 border-2 border-[#0a0a0a] text-[#0a0a0a] rounded-[14px] text-[15px] font-[700] hover:bg-[#fafafa] transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
