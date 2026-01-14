/**
 * Quote Builder
 * Create professional quotes for tool and consumable sales
 * Supports tiered pricing and generates tokenized customer links
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
  product_type: 'tool' | 'consumable' | 'part';
}

interface QuoteLineItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  product_type: 'tool' | 'consumable';
  category?: string;
  image_url?: string;
}

interface PricingTier {
  tier_name: string;
  min_quantity: number;
  discount_percent?: number;
  unit_price?: number;
}

export default function QuoteBuilderPage() {
  // Step 1: Company & Contact
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Step 2: Product Selection
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  // Step 3: Quote Line Items
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);

  // Step 4: Tiered Pricing
  const [standardTiers, setStandardTiers] = useState<PricingTier[]>([]);
  const [premiumTiers, setPremiumTiers] = useState<PricingTier[]>([]);
  const [toolTiers, setToolTiers] = useState<PricingTier[]>([]);
  const [pricingMode, setPricingMode] = useState<'standard' | 'premium'>('standard');

  // Quote Generation
  const [quoteUrl, setQuoteUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);

  // Edit Mode
  const [editMode, setEditMode] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Load companies on mount and check for edit mode
  useEffect(() => {
    loadCompanies();
    loadPricingTiers();

    // Check if we're in edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const editQuoteId = urlParams.get('edit');
    if (editQuoteId) {
      setEditMode(true);
      setEditingQuoteId(editQuoteId);
      loadQuoteForEditing(editQuoteId);
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

  // Load contacts when company selected
  useEffect(() => {
    if (selectedCompany) {
      loadContacts(selectedCompany.company_id);
    }
  }, [selectedCompany]);

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
      setStandardTiers(data.standard || []);
      setPremiumTiers(data.premium || []);
      setToolTiers(data.tool || []);
    } catch (err) {
      console.error('Failed to load pricing tiers:', err);
    }
  }

  async function loadQuoteForEditing(quoteId: string) {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`);
      const data = await response.json();

      if (data.success && data.quote) {
        const quote = data.quote;

        // Set company
        const company = {
          company_id: quote.company_id,
          company_name: quote.company_name,
        };
        setSelectedCompany(company);

        // Set contact
        if (quote.contact_id) {
          const contact = {
            contact_id: quote.contact_id,
            full_name: quote.contact_name,
            email: quote.contact_email || '',
          };
          setSelectedContact(contact);
        }

        // Set line items
        const items = quote.line_items.map((item: any) => ({
          product_code: item.product_code,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          product_type: item.product_type,
          category: item.category,
          image_url: item.image_url,
        }));
        setLineItems(items);

        // Set pricing mode
        if (quote.pricing_mode) {
          setPricingMode(quote.pricing_mode);
        }

        // Set free shipping
        if (quote.free_shipping) {
          setFreeShipping(true);
        }

        // Load contacts for the company
        await loadContacts(quote.company_id);
      } else {
        alert('Failed to load quote for editing');
      }
    } catch (err) {
      console.error('Failed to load quote:', err);
      alert('Failed to load quote for editing');
    }
  }

  async function searchProducts() {
    if (!productSearch.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productSearch)}&types=tool,consumable`);
      const data = await response.json();
      setSearchResults(data.products || []);
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
      return;
    }

    const newItem: QuoteLineItem = {
      product_code: product.product_code,
      description: product.description,
      quantity: 1,
      unit_price: product.price,
      discount_percent: 0,
      product_type: product.product_type as 'tool' | 'consumable',
      category: product.category,
      image_url: product.image_url,
    };

    setLineItems([...lineItems, newItem]);
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

  function updateDiscount(productCode: string, discount: number) {
    setLineItems(lineItems.map(li =>
      li.product_code === productCode ? { ...li, discount_percent: Math.max(0, Math.min(100, discount)) } : li
    ));
  }

  function removeLineItem(productCode: string) {
    setLineItems(lineItems.filter(li => li.product_code !== productCode));
  }

  function calculateTotals() {
    const consumableItems = lineItems.filter(li => li.product_type === 'consumable');
    const toolItems = lineItems.filter(li => li.product_type === 'tool');

    let subtotal = 0;
    let totalDiscount = 0;

    // Calculate consumable pricing with tiers
    if (pricingMode === 'standard') {
      const totalConsumableQty = consumableItems.reduce((sum, li) => sum + li.quantity, 0);
      const tier = [...standardTiers].reverse().find(t => totalConsumableQty >= t.min_quantity);

      consumableItems.forEach(li => {
        const tierPrice = tier?.unit_price || li.unit_price;
        const itemSubtotal = tierPrice * li.quantity;
        const itemDiscount = (itemSubtotal * li.discount_percent) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      });
    } else {
      // Premium tier - per-SKU discounts
      consumableItems.forEach(li => {
        const tier = [...premiumTiers].reverse().find(t => li.quantity >= t.min_quantity);
        const tierDiscount = tier?.discount_percent || 0;
        const combinedDiscount = Math.min(100, tierDiscount + li.discount_percent);
        const itemSubtotal = li.unit_price * li.quantity;
        const itemDiscount = (itemSubtotal * combinedDiscount) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      });
    }

    // Tools have tiered volume discounts based on total tool quantity
    const totalToolQty = toolItems.reduce((sum, li) => sum + li.quantity, 0);
    const toolTier = [...toolTiers].reverse().find(t => totalToolQty >= t.min_quantity);
    const toolTierDiscount = toolTier?.discount_percent || 0;

    toolItems.forEach(li => {
      const itemSubtotal = li.unit_price * li.quantity;
      // Apply tier discount + any manual discount
      const combinedDiscount = Math.min(100, toolTierDiscount + li.discount_percent);
      const itemDiscount = (itemSubtotal * combinedDiscount) / 100;
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    });

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
      if (editMode && editingQuoteId) {
        // Update existing quote
        const response = await fetch(`/api/admin/quotes/${editingQuoteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            line_items: lineItems,
            pricing_mode: pricingMode,
            free_shipping: freeShipping,
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert('Quote updated successfully!');
          window.location.href = '/admin/quotes';
        } else {
          alert('Failed to update quote: ' + (data.error || 'Unknown error'));
        }
      } else {
        // Create new quote
        const response = await fetch('/api/admin/quotes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: selectedCompany.company_id,
            contact_id: selectedContact.contact_id,
            line_items: lineItems,
            pricing_mode: pricingMode,
            free_shipping: freeShipping,
          }),
        });

        const data = await response.json();
        if (data.url) {
          setQuoteUrl(data.url);
        } else {
          alert('Failed to generate quote: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (err) {
      alert(editMode ? 'Error updating quote' : 'Error generating quote');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const { subtotal, totalDiscount, total } = calculateTotals();
  const consumableQty = lineItems.filter(li => li.product_type === 'consumable').reduce((sum, li) => sum + li.quantity, 0);
  const toolQty = lineItems.filter(li => li.product_type === 'tool').reduce((sum, li) => sum + li.quantity, 0);

  const nextConsumableTier = pricingMode === 'standard'
    ? standardTiers.find(t => consumableQty < t.min_quantity)
    : premiumTiers.find(t => consumableQty < t.min_quantity);

  const nextToolTier = toolTiers.find(t => toolQty < t.min_quantity);

  return (
    <div className={`${inter.className} min-h-screen bg-[#fafafa]`}>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-[800] text-[#0a0a0a] tracking-[-0.04em] mb-2">
            {editMode ? 'Edit Quote' : 'Quote Builder'}
          </h1>
          <p className="text-[15px] text-[#666] font-[400] tracking-[-0.01em]">
            {editMode ? 'Update quote details, line items, and pricing' : 'Create professional quotes for tool and consumable sales'}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Company & Contact Selection */}
          <div className="col-span-4 space-y-6">
            {/* Step 1: Company */}
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

            {/* Step 2: Contact */}
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

            {/* Summary Sidebar */}
            {lineItems.length > 0 && (
              <div className="bg-[#0a0a0a] rounded-[20px] p-6 text-white sticky top-6">
                <h3 className="text-[18px] font-[700] tracking-[-0.02em] mb-4">Quote Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/70 font-[400]">Items</span>
                    <span className="font-[600]">{lineItems.length}</span>
                  </div>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/70 font-[400]">Quantity</span>
                    <span className="font-[600]">{lineItems.reduce((sum, li) => sum + li.quantity, 0)}</span>
                  </div>
                  <div className="h-px bg-white/20 my-3"></div>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/70 font-[400]">Subtotal</span>
                    <span className="font-[600]">£{subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-[15px]">
                      <span className="text-white/70 font-[400]">Discount</span>
                      <span className="font-[600] text-green-400">-£{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/20 my-3"></div>
                  <div className="flex justify-between text-[20px]">
                    <span className="font-[700]">Total</span>
                    <span className="font-[800]">£{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pricing Mode Toggle */}
                <div className="mb-4">
                  <div className="text-[13px] text-white/70 font-[500] mb-2">Pricing Mode</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPricingMode('standard')}
                      className={`flex-1 px-3 py-2 rounded-[10px] text-[13px] font-[600] transition-colors ${
                        pricingMode === 'standard'
                          ? 'bg-white text-[#0a0a0a]'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => setPricingMode('premium')}
                      className={`flex-1 px-3 py-2 rounded-[10px] text-[13px] font-[600] transition-colors ${
                        pricingMode === 'premium'
                          ? 'bg-white text-[#0a0a0a]'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      Premium
                    </button>
                  </div>
                </div>

                {/* Consumable Tier Progress */}
                {nextConsumableTier && consumableQty > 0 && (
                  <div className="mt-4 p-3 bg-white/10 rounded-[14px]">
                    <div className="text-[13px] font-[500] mb-2">Next Consumable Tier</div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, (consumableQty / nextConsumableTier.min_quantity) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-[12px] text-white/70">
                      {nextConsumableTier.min_quantity - consumableQty} more for {nextConsumableTier.tier_name}
                    </div>
                  </div>
                )}

                {/* Tool Tier Progress */}
                {nextToolTier && toolQty > 0 && (
                  <div className="mt-4 p-3 bg-white/10 rounded-[14px]">
                    <div className="text-[13px] font-[500] mb-2">Next Tool Tier</div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, (toolQty / nextToolTier.min_quantity) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-[12px] text-white/70">
                      {nextToolTier.min_quantity - toolQty} more for {nextToolTier.tier_name} ({nextToolTier.discount_percent}% off)
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/20">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={freeShipping}
                      onChange={(e) => setFreeShipping(e.target.checked)}
                      className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-400 focus:ring-2 focus:ring-white/50"
                    />
                    <span className="text-[14px] text-white/90 font-[500] group-hover:text-white transition-colors">
                      Free shipping for this quote
                    </span>
                  </label>
                  <p className="text-[12px] text-white/60 mt-2 ml-7">
                    Override country shipping rules and set shipping to £0
                  </p>
                </div>

                <button
                  onClick={generateQuote}
                  disabled={!selectedCompany || !selectedContact || lineItems.length === 0 || generating}
                  className="w-full mt-6 py-3 bg-white text-[#0a0a0a] rounded-[14px] text-[15px] font-[700] tracking-[-0.01em] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (editMode ? 'Updating...' : 'Generating...') : (editMode ? 'Update Quote' : 'Generate Quote')}
                </button>
              </div>
            )}
          </div>

          {/* Right Main Area - Product Selection & Line Items */}
          <div className="col-span-8 space-y-6">
            {/* EDIT MODE: Show current quote summary */}
            {editMode && (
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
                <h2 className="text-[18px] font-[800] text-yellow-900 tracking-[-0.02em] mb-4">
                  ⚠️ Editing Live Quote
                </h2>
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <span className="text-yellow-700 font-[500]">Company:</span>
                    <span className="ml-2 font-[700] text-yellow-900">{selectedCompany?.company_name}</span>
                  </div>
                  <div>
                    <span className="text-yellow-700 font-[500]">Contact:</span>
                    <span className="ml-2 font-[700] text-yellow-900">{selectedContact?.email}</span>
                  </div>
                  <div>
                    <span className="text-yellow-700 font-[500]">Pricing Mode:</span>
                    <span className="ml-2 font-[700] text-yellow-900 uppercase">{pricingMode}</span>
                  </div>
                  <div>
                    <span className="text-yellow-700 font-[500]">Free Shipping:</span>
                    <span className="ml-2 font-[700] text-yellow-900">{freeShipping ? 'YES ✓' : 'No'}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 rounded-[10px] text-[13px] text-yellow-800">
                  <strong>Changes are live:</strong> When you click "Update Quote", the customer's tokenized link will immediately show the updated items and prices.
                </div>
              </div>
            )}

            {/* EDIT MODE: Show current quote items FIRST */}
            {editMode && lineItems.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-500 rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[20px] font-[800] text-blue-900 tracking-[-0.02em]">
                    ✏️ Current Quote Items - {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
                  </h2>
                  <div className="text-[14px] text-blue-700 font-[600]">
                    Editing Quote: {editingQuoteId?.slice(0, 8)}...
                  </div>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item) => (
                    <div
                      key={item.product_code}
                      className="flex items-center gap-4 p-4 bg-white border-2 border-blue-200 rounded-[14px]"
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
                          {item.product_code} • {item.product_type} • £{item.unit_price.toFixed(2)}/unit
                        </div>
                        <div className="flex gap-3">
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
                          <div>
                            <label className="text-[12px] text-[#666] font-[500] block mb-1">Discount %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={item.discount_percent}
                              onChange={(e) => updateDiscount(item.product_code, parseFloat(e.target.value) || 0)}
                              className="w-24 px-3 py-1.5 border border-[#e8e8e8] rounded-[8px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[18px] font-[700] text-[#0a0a0a] mb-2">
                          £{((item.unit_price * item.quantity) * (1 - item.discount_percent / 100)).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeLineItem(item.product_code)}
                          className="px-4 py-2 bg-red-500 text-white rounded-[8px] text-[13px] font-[600] hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Add Products */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[32px] h-[32px] rounded-full bg-[#0a0a0a] flex items-center justify-center">
                  <span className="text-[14px] font-[700] text-white">3</span>
                </div>
                <h2 className="text-[18px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                  {editMode ? 'Add More Products' : 'Add Products'}
                </h2>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                  placeholder="Search tools or consumables..."
                  className="flex-1 px-4 py-3 border border-[#e8e8e8] rounded-[14px] text-[15px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent"
                />
                <button
                  onClick={searchProducts}
                  disabled={searching}
                  className="px-6 py-3 bg-[#0a0a0a] text-white rounded-[14px] text-[15px] font-[700] hover:bg-[#222] transition-colors disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <div
                      key={product.product_code}
                      className="flex items-center gap-4 p-3 border border-[#e8e8e8] rounded-[14px] hover:bg-[#fafafa] transition-colors"
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
                          {product.product_code} • {product.product_type} • £{product.price.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => addLineItem(product)}
                        className="px-4 py-2 bg-[#0a0a0a] text-white rounded-[10px] text-[13px] font-[600] hover:bg-[#222] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 4: Quote Line Items */}
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
                  {lineItems.map((item) => (
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
                          {item.product_code} • {item.product_type} • £{item.unit_price.toFixed(2)}/unit
                        </div>
                        <div className="flex gap-3">
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
                          <div>
                            <label className="text-[12px] text-[#666] font-[500] block mb-1">Discount %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount_percent}
                              onChange={(e) => updateDiscount(item.product_code, parseFloat(e.target.value) || 0)}
                              className="w-24 px-3 py-1.5 border border-[#e8e8e8] rounded-[8px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[18px] font-[700] text-[#0a0a0a] mb-2">
                          £{((item.unit_price * item.quantity) * (1 - item.discount_percent / 100)).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeLineItem(item.product_code)}
                          className="text-[13px] text-red-600 hover:text-red-700 font-[600]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Quote URL */}
        {quoteUrl && (
          <div className="mt-6 bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="text-[18px] font-[700] text-[#0a0a0a] tracking-[-0.02em] mb-4">Quote Generated</h3>
            <div className="bg-[#fafafa] p-4 rounded-[14px] border border-[#e8e8e8] mb-4">
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
                Open Quote
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
