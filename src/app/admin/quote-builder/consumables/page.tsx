/**
 * Consumables Quote Builder
 * Creates quotes with either STATIC (locked) or INTERACTIVE (tiered) pricing
 * Supports both fixed pricing quotes and volume discount quotes
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  account_owner?: string;
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
  type: string;
  pricing_tier?: string | null;
}

interface QuoteLineItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  product_type: 'consumable';
  category?: string;
  image_url?: string;
  pricing_tier?: string | null;
}

interface PricingTier {
  tier_name: string;
  min_quantity: number;
  discount_percent?: number;
  unit_price?: number;
}

export default function ConsumablesQuoteBuilderPage() {
  const searchParams = useSearchParams();
  const companyIdParam = searchParams.get('company_id');

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

  const [allConsumables, setAllConsumables] = useState<Product[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);

  const [standardTiers, setStandardTiers] = useState<PricingTier[]>([]);
  const [premiumTiers, setPremiumTiers] = useState<PricingTier[]>([]);

  const [quoteUrl, setQuoteUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isTestToken, setIsTestToken] = useState(false);
  const [quoteId, setQuoteId] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [quoteType, setQuoteType] = useState<'interactive' | 'static'>('interactive');

  useEffect(() => {
    loadCompanies();
    loadPricingTiers();
    loadAllConsumables();
  }, []);

  // Pre-select company if company_id is in URL
  useEffect(() => {
    if (companyIdParam && companies.length > 0) {
      const company = companies.find(c => c.company_id === companyIdParam);
      if (company) {
        setSelectedCompany(company);
        setShowCompanyDropdown(false);
      }
    }
  }, [companyIdParam, companies]);

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

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productSearch)}&types=consumable`);
        const data = await response.json();
        setSearchResults(data.products || []);
        setShowProductDropdown(true);
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        setSearching(false);
      }
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
      setStandardTiers(data.standard || []);
      setPremiumTiers(data.premium || []);
    } catch (err) {
      console.error('Failed to load pricing tiers:', err);
    }
  }

  async function loadAllConsumables() {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/admin/products/list?type=consumable&limit=500&sort=category');
      const data = await response.json();
      setAllConsumables(data.products || []);
    } catch (err) {
      console.error('Failed to load consumables:', err);
    } finally {
      setLoadingProducts(false);
    }
  }

  // Group consumables by category
  const consumablesByCategory = allConsumables.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const categoryNames = Object.keys(consumablesByCategory).sort();

  function toggleCategory(category: string) {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  }

  async function searchProducts() {
    if (!productSearch.trim()) return;

    setSearching(true);
    try {
      // Only search for consumables
      const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productSearch)}&types=consumable`);
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
      discount_percent: 0,
      product_type: 'consumable',
      category: product.category,
      image_url: product.image_url,
      pricing_tier: product.pricing_tier,
    };

    setLineItems([...lineItems, newItem]);
    setProductSearch('');
    setSearchResults([]);
    setShowProductDropdown(false);
  }

  function updateQuantity(productCode: string, quantity: number) {
    // Allow quantity 0 for "curated" quotes (show product but don't include in total)
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
    let subtotal = 0;
    let totalDiscount = 0;

    // Only include items with quantity > 0 in total calculation
    const itemsWithQty = lineItems.filter(li => li.quantity > 0);

    // Separate items by their pricing_tier (per-product rule)
    const standardItems = itemsWithQty.filter(li => li.pricing_tier === 'standard');
    const premiumItems = itemsWithQty.filter(li => li.pricing_tier === 'premium');
    const otherItems = itemsWithQty.filter(li => !li.pricing_tier || (li.pricing_tier !== 'standard' && li.pricing_tier !== 'premium'));

    // STANDARD tier: Total quantity across all standard items determines unit price
    if (standardItems.length > 0) {
      const totalQty = standardItems.reduce((sum, li) => sum + li.quantity, 0);
      const tier = [...standardTiers].reverse().find(t => totalQty >= t.min_quantity);

      standardItems.forEach(li => {
        const tierPrice = tier?.unit_price || li.unit_price;
        const itemSubtotal = tierPrice * li.quantity;
        const itemDiscount = (itemSubtotal * li.discount_percent) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      });
    }

    // PREMIUM tier: Per-SKU quantity determines discount percentage
    if (premiumItems.length > 0) {
      premiumItems.forEach(li => {
        const tier = [...premiumTiers].reverse().find(t => li.quantity >= t.min_quantity);
        const tierDiscount = tier?.discount_percent || 0;
        const combinedDiscount = Math.min(100, tierDiscount + li.discount_percent);
        const itemSubtotal = li.unit_price * li.quantity;
        const itemDiscount = (itemSubtotal * combinedDiscount) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      });
    }

    // OTHER products: No tiered pricing, use base price only
    if (otherItems.length > 0) {
      otherItems.forEach(li => {
        const itemSubtotal = li.unit_price * li.quantity;
        const itemDiscount = (itemSubtotal * li.discount_percent) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      });
    }

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
          line_items: lineItems,
          quote_type: quoteType, // 'static' or 'interactive'
          is_test: isTestToken, // Test tokens bypass address collection
        }),
      });

      const data = await response.json();
      if (data.url) {
        setQuoteUrl(data.url);
        if (data.quote_id) {
          setQuoteId(data.quote_id);
        }
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

  async function sendQuoteEmail() {
    if (!selectedCompany || !selectedContact || !quoteId || !quoteUrl) {
      alert('Missing required information for sending email');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/admin/quote/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompany.company_id,
          contact_id: selectedContact.contact_id,
          quote_id: quoteId,
          quote_url: quoteUrl,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Quote email sent successfully to ${selectedContact.email}!`);
      } else {
        alert('Failed to send email: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error sending email');
      console.error(err);
    } finally {
      setSendingEmail(false);
    }
  }

  const { subtotal, totalDiscount, total } = calculateTotals();
  const consumableQty = lineItems.reduce((sum, li) => sum + li.quantity, 0);

  return (
    <div className={`${inter.className} min-h-screen bg-[#fafafa]`}>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-[800] text-[#0a0a0a] tracking-[-0.04em] mb-2">
            Consumables Quote Builder
          </h1>
          <p className="text-[15px] text-[#666] font-[400] tracking-[-0.01em]">
            Create quotes with static (locked) or interactive (tiered) pricing modes
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
                        <div className="flex items-center justify-between">
                          <div className="text-[15px] font-[600] text-[#0a0a0a]">{company.company_name}</div>
                          {company.account_owner && (
                            <span className="px-2 py-0.5 text-[11px] font-[600] bg-blue-100 text-blue-700 rounded-md uppercase">
                              {company.account_owner}
                            </span>
                          )}
                        </div>
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

            {/* Summary Sidebar */}
            {lineItems.length > 0 && (
              <div className="bg-[#0a0a0a] rounded-[20px] p-6 text-white sticky top-6">
                <h3 className="text-[18px] font-[700] tracking-[-0.02em] mb-4">Quote Summary</h3>

                {/* Quote Type Toggle */}
                <div className="mb-6 pb-6 border-b border-white/20">
                  <div className="text-[13px] text-white/70 font-[500] mb-3">Quote Type</div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/20 rounded-[10px] cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="quote-type"
                        value="interactive"
                        checked={quoteType === 'interactive'}
                        onChange={() => setQuoteType('interactive')}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-[14px] font-[600] text-white">Interactive Quote</div>
                        <div className="text-[12px] text-white/60">Prices recalculate with tiered discounts</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/20 rounded-[10px] cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="quote-type"
                        value="static"
                        checked={quoteType === 'static'}
                        onChange={() => setQuoteType('static')}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-[14px] font-[600] text-white">Static Quote</div>
                        <div className="text-[12px] text-white/60">Fixed prices, customer can adjust quantities</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/70 font-[400]">Items</span>
                    <span className="font-[600]">{lineItems.length}</span>
                  </div>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/70 font-[400]">Quantity</span>
                    <span className="font-[600]">{consumableQty}</span>
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


                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="test-token"
                    checked={isTestToken}
                    onChange={(e) => setIsTestToken(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="test-token" className="text-sm text-white/70">
                    Test link (internal preview only)
                  </label>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={generateQuote}
                    disabled={!selectedCompany || !selectedContact || lineItems.length === 0 || generating}
                    className="w-full py-3 bg-white text-[#0a0a0a] rounded-[14px] text-[15px] font-[700] tracking-[-0.01em] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? 'Generating...' : '🔗 Generate Test Link'}
                  </button>

                  {quoteUrl && !isTestToken && (
                    <button
                      onClick={sendQuoteEmail}
                      disabled={sendingEmail}
                      className="w-full py-3 bg-green-500 text-white rounded-[14px] text-[15px] font-[700] tracking-[-0.01em] hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingEmail ? 'Sending...' : '📧 Send Quote Email'}
                    </button>
                  )}

                  {isTestToken && quoteUrl && (
                    <div className="text-[12px] text-white/60 text-center">
                      Test links are for internal preview only - not sent to customers
                    </div>
                  )}
                </div>
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
                  Add Consumables
                </h2>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowProductDropdown(true)}
                  placeholder="Start typing to search consumables..."
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
                            {product.product_code} • £{(product.price || 0).toFixed(2)}
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

              {/* Product Browser by Category */}
              <div className="mt-6 pt-6 border-t border-[#e8e8e8]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-[600] text-[#0a0a0a]">Browse by Category</h3>
                  {categoryNames.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedCategories(new Set(categoryNames))}
                        className="text-[13px] text-[#666] hover:text-[#0a0a0a]"
                      >
                        Expand All
                      </button>
                      <span className="text-[#e8e8e8]">|</span>
                      <button
                        onClick={() => setExpandedCategories(new Set())}
                        className="text-[13px] text-[#666] hover:text-[#0a0a0a]"
                      >
                        Collapse All
                      </button>
                    </div>
                  )}
                </div>

                {loadingProducts ? (
                  <div className="text-center py-8 text-[#666]">Loading products...</div>
                ) : categoryNames.length === 0 ? (
                  <div className="text-center py-8 text-[#666]">No consumables found</div>
                ) : (
                  <div className="space-y-2">
                    {categoryNames.map((category) => {
                      const products = consumablesByCategory[category];
                      const isExpanded = expandedCategories.has(category);

                      return (
                        <div key={category} className="border border-[#e8e8e8] rounded-[14px] overflow-hidden">
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategory(category)}
                            className="w-full px-4 py-3 bg-[#fafafa] hover:bg-[#f0f0f0] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                className={`w-4 h-4 text-[#666] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-[15px] font-[600] text-[#0a0a0a]">{category}</span>
                            </div>
                            <span className="text-[13px] text-[#666]">{products.length} items</span>
                          </button>

                          {/* Category Products */}
                          {isExpanded && (
                            <div className="p-3 space-y-2">
                              {products.map((product) => (
                                <div
                                  key={product.product_code}
                                  className="flex items-center gap-3 p-3 border border-[#e8e8e8] rounded-[10px] hover:bg-[#fafafa] transition-colors"
                                >
                                  {product.image_url && (
                                    <img
                                      src={product.image_url}
                                      alt={product.description}
                                      className="w-12 h-12 object-cover rounded-[8px]"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[14px] font-[600] text-[#0a0a0a] truncate">
                                      {product.description}
                                    </div>
                                    <div className="text-[12px] text-[#666] mt-0.5">
                                      {product.product_code} • £{(product.price || 0).toFixed(2)}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => addLineItem(product)}
                                    className="px-3 py-1.5 bg-[#0a0a0a] text-white rounded-[8px] text-[13px] font-[600] hover:bg-[#222] transition-colors whitespace-nowrap"
                                  >
                                    Add
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                          {item.product_code} • £{item.unit_price.toFixed(2)}/unit
                        </div>
                        <div className="flex gap-3">
                          <div>
                            <label className="text-[12px] text-[#666] font-[500] block mb-1">Quantity</label>
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product_code, parseInt(e.target.value) || 0)}
                              className="w-24 px-3 py-1.5 border border-[#e8e8e8] rounded-[8px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
                            />
                          </div>
                          <div>
                            <label className="text-[12px] text-[#666] font-[500] block mb-1">Extra Discount %</label>
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
            <h3 className="text-[18px] font-[700] text-[#0a0a0a] tracking-[-0.02em] mb-4">
              {quoteType === 'interactive' ? 'Interactive Quote Generated' : 'Static Quote Generated'}
            </h3>

            {isTestToken ? (
              <div className="bg-yellow-50 p-4 rounded-[14px] border border-yellow-200 mb-4">
                <p className="text-[14px] text-yellow-800 mb-2">
                  ⚠️ Test Link - For internal preview only (not stored in database)
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
            ) : (
              <div className="bg-green-50 p-4 rounded-[14px] border border-green-200 mb-4">
                <p className="text-[14px] text-green-800 mb-2">
                  ✓ {quoteType === 'interactive'
                    ? 'Customer can adjust quantities and see live pricing updates'
                    : 'Customer can adjust quantities but prices remain locked'}
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
            )}

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
                📋 Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
