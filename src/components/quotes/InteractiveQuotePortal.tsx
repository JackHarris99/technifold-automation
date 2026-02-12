/**
 * Interactive Quote Portal
 * Customer-facing portal for interactive quotes with TIERED PRICING
 * Layout matches PortalPage for consistent branding
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { InvoiceRequestModal } from '../InvoiceRequestModal';
import PortalAddressCollectionModal from '../portals/PortalAddressCollectionModal';

interface LineItem {
  product_code: string;
  description: string;
  quantity: number;
  base_price: number;
  unit_price: number;
  line_total: number;
  discount_applied: string | null;
  image_url: string | null;
}

interface PricingPreview {
  line_items: LineItem[];
  subtotal: number;
  vat_amount: number;
  vat_rate: number;
  shipping_amount: number;
  total: number;
  total_savings: number;
  currency: string;
}

interface InteractiveQuotePortalProps {
  quote: any;
  lineItems: any[];
  company: {
    company_id: string;
    company_name: string;
    billing_address_line_1?: string;
    billing_address_line_2?: string;
    billing_city?: string;
    billing_state_province?: string;
    billing_postal_code?: string;
    billing_country?: string;
    vat_number?: string;
  };
  contact: {
    contact_id: string;
    full_name: string;
    email: string;
  } | null;
  token: string;
  isTest: boolean;
  readOnly?: boolean;
  previewMode?: 'admin' | 'original';
}

export function InteractiveQuotePortal({
  quote,
  lineItems,
  company,
  contact,
  token,
  isTest,
  readOnly = false,
  previewMode,
}: InteractiveQuotePortalProps) {
  const [itemQuantities, setItemQuantities] = useState<Map<string, number>>(new Map());
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [standardTiers, setStandardTiers] = useState<any[]>([]);
  const [premiumTiers, setPremiumTiers] = useState<any[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Detect product type from line items
  const productType = lineItems[0]?.product_type || 'consumable';
  const isToolQuote = productType === 'tool';

  // Fetch shipping addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.success && data.addresses) {
          setShippingAddresses(data.addresses);

          // Set default address as selected
          const defaultAddress = data.addresses.find((addr: any) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.address_id);
          } else if (data.addresses.length > 0) {
            setSelectedAddressId(data.addresses[0].address_id);
          }
        }
      } catch (error) {
        console.error('[InteractiveQuotePortal] Failed to fetch shipping addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [token]);

  // Load pricing tiers on mount (for consumable quotes)
  useEffect(() => {
    if (!isToolQuote) {
      async function loadTiers() {
        try {
          const response = await fetch('/api/admin/pricing-tiers');
          const data = await response.json();
          setStandardTiers(data.standard || []);
          setPremiumTiers(data.premium || []);
        } catch (err) {
          console.error('[InteractiveQuotePortal] Failed to load pricing tiers:', err);
        }
      }
      loadTiers();
    }
  }, [isToolQuote]);

  // Pre-populate quantities from quote items on mount
  useEffect(() => {
    const quantityMap = new Map();
    lineItems.forEach(item => {
      quantityMap.set(item.product_code, item.quantity);
    });
    setItemQuantities(quantityMap);
  }, [lineItems]);

  // Fetch pricing preview when quantities change
  useEffect(() => {
    const itemsWithQty = Array.from(itemQuantities.entries())
      .filter(([_, qty]) => qty > 0)
      .map(([product_code, quantity]) => ({ product_code, quantity }));

    if (itemsWithQty.length === 0) {
      setPricingPreview(null);
      return;
    }

    const fetchPricing = async () => {
      setLoadingPreview(true);
      try {
        const response = await fetch('/api/portal/quote-pricing-interactive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, items: itemsWithQty }),
        });

        const data = await response.json();
        if (data.success) {
          setPricingPreview(data.preview);
        }
      } catch (error) {
        console.error('[InteractiveQuotePortal] Failed to fetch pricing:', error);
      } finally {
        setLoadingPreview(false);
      }
    };

    const timeoutId = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timeoutId);
  }, [itemQuantities, token]);

  const updateQuantity = (productCode: string, quantity: number) => {
    setItemQuantities(prev => {
      const newMap = new Map(prev);
      if (quantity <= 0) {
        newMap.delete(productCode);
      } else {
        newMap.set(productCode, quantity);
      }
      return newMap;
    });
  };

  const getTotalQuantity = () => {
    return Array.from(itemQuantities.values()).reduce((sum, qty) => sum + qty, 0);
  };

  // Get pricing info for a product from preview
  const getPricingInfo = (productCode: string) => {
    if (!pricingPreview) return null;
    const lineItem = pricingPreview.line_items.find(item => item.product_code === productCode);
    if (!lineItem) return null;
    return {
      basePrice: lineItem.base_price,
      discountedPrice: lineItem.unit_price,
      hasDiscount: lineItem.base_price > lineItem.unit_price,
      savingsPerUnit: lineItem.base_price - lineItem.unit_price,
      discountLabel: lineItem.discount_applied
    };
  };

  // Refetch addresses after adding a new one
  const handleAddressSaved = async () => {
    setShowAddressModal(false);
    try {
      const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      if (data.success && data.addresses) {
        setShippingAddresses(data.addresses);
        // Select the newly added address (should be default)
        const defaultAddress = data.addresses.find((addr: any) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.address_id);
        }
      }
    } catch (error) {
      console.error('[InteractiveQuotePortal] Failed to refetch shipping addresses:', error);
    }
  };

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
        {/* Preview Mode Banners */}
        {readOnly && previewMode === 'admin' && (
          <div className="bg-blue-600 text-white py-3 px-4 text-center font-[600]">
            🔍 ADMIN PREVIEW MODE - This is how the customer will see the quote
          </div>
        )}
        {readOnly && previewMode === 'original' && (
          <div className="bg-purple-600 text-white py-3 px-4 text-center font-[600]">
            📄 ORIGINAL QUOTE - What was sent to the customer
          </div>
        )}
        {isTest && !readOnly && (
          <div className="bg-yellow-500 text-white py-2 px-4 text-center font-[600]">
            ⚠️ TEST MODE - This is an internal preview link
          </div>
        )}

        {/* Top Branding Bar */}
        <div className="bg-white border-b border-[#e8e8e8]">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-8">
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                  alt="Technifold"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technicrease.png"
                  alt="Technicrease"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/creasestream.png"
                  alt="Creasestream"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-12">
          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="col-span-7 space-y-4">
              {/* Customer Information Card */}
              <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
                <div className="mb-6">
                  <h1 className="text-[28px] font-[600] text-[#1e40af] mb-1 tracking-[-0.02em] leading-[1.2]">
                    {company.company_name}
                  </h1>
                  <p className="text-[13px] text-[#334155] font-[400]">
                    {isToolQuote ? 'Professional tooling quotation with volume pricing' : 'Precision consumables quotation with intelligent tiered pricing'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Contact Info */}
                  <div>
                    <div className="text-[11px] font-[600] text-[#475569] mb-2 uppercase tracking-wider">Contact</div>
                    {contact ? (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <div className="text-[13px] text-[#1e293b] font-[600]">{contact.full_name}</div>
                        <div className="text-[12px] text-[#334155] mt-0.5">{contact.email}</div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <p className="text-[12px] text-[#475569] italic">No contact assigned</p>
                      </div>
                    )}
                  </div>

                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider">Billing Address</div>
                      {!readOnly && (
                        <button onClick={() => setShowAddressModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">Edit</button>
                      )}
                    </div>
                    {company.billing_address_line_1 ? (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <div className="text-[12px] font-[500] text-[#1e293b]">{company.billing_address_line_1}</div>
                        {company.billing_address_line_2 && <div className="text-[11px] text-[#334155]">{company.billing_address_line_2}</div>}
                        <div className="text-[11px] text-[#334155]">{company.billing_city}{company.billing_state_province ? `, ${company.billing_state_province}` : ''}</div>
                        <div className="text-[11px] text-[#334155]">{company.billing_postal_code}</div>
                        <div className="text-[12px] font-[500] text-[#1e293b] mt-1">{company.billing_country}</div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <p className="text-[11px] text-red-600 italic">No billing address - <button onClick={() => setShowAddressModal(true)} className="underline font-[600]">Add now</button></p>
                      </div>
                    )}
                  </div>

                  {/* Delivery Addresses */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider">Delivery Addresses</div>
                      {!readOnly && (
                        <button onClick={() => setShowAddressModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">+ Add</button>
                      )}
                    </div>

                    {loadingAddresses ? (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <p className="text-[12px] text-[#475569] italic">Loading...</p>
                      </div>
                    ) : shippingAddresses.length > 0 ? (
                      <div className="space-y-2">
                        {shippingAddresses.map((addr) => (
                          <div
                            key={addr.address_id}
                            onClick={() => !readOnly && setSelectedAddressId(addr.address_id)}
                            className={`p-2 rounded-[10px] border transition-all cursor-pointer ${
                              selectedAddressId === addr.address_id
                                ? 'border-[#1e40af] bg-blue-50'
                                : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-[#cbd5e1]'
                            }`}
                          >
                            {addr.label && (
                              <div className="text-[11px] font-[600] text-[#1e293b] mb-0.5">
                                {addr.label}
                                {addr.is_default && <span className="ml-1 text-[9px] text-blue-600">(Default)</span>}
                              </div>
                            )}
                            <div className="text-[10px] text-[#334155]">
                              {addr.address_line_1}
                              {addr.address_line_2 && `, ${addr.address_line_2}`}
                            </div>
                            <div className="text-[10px] text-[#334155]">
                              {addr.city}{addr.state_province ? `, ${addr.state_province}` : ''} {addr.postal_code}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                        <p className="text-[11px] text-[#475569] italic">Address confirmed at checkout</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote Items Section */}
              <div className="bg-white rounded-[16px] shadow-sm border-2 border-blue-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-[#e8e8e8]">
                  <h2 className="text-[17px] font-[600] text-[#1e40af] tracking-[-0.01em]">Quote Items</h2>
                  <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''} quoted</p>
                </div>

                <div className="px-8 pb-8 pt-4 space-y-4">
                  {lineItems.map((item) => {
                    const currentQty = itemQuantities.get(item.product_code) || 0;
                    const pricing = getPricingInfo(item.product_code);

                    return (
                      <div key={item.product_code} className={`flex items-center gap-4 p-4 rounded-[12px] transition-colors ${
                        isToolQuote
                          ? 'border-2 border-blue-200 hover:border-blue-300 bg-blue-50/30'
                          : item.pricing_tier === 'standard'
                          ? 'border-2 border-green-200 hover:border-green-300 bg-green-50/30'
                          : item.pricing_tier === 'premium'
                          ? 'border-2 border-purple-200 hover:border-purple-300 bg-purple-50/30'
                          : 'border border-[#e8e8e8] hover:border-[#16a34a]'
                      }`}>
                        <div className="relative w-20 h-20 bg-[#f9fafb] rounded-[8px] flex-shrink-0 overflow-hidden">
                          <Image
                            src={item.image_url || '/product-placeholder.svg'}
                            alt={item.description}
                            fill
                            className="object-contain p-2"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/product-placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-[600] text-[15px] text-[#0a0a0a]">{item.description}</div>
                            {isToolQuote && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-[600] rounded-[4px] uppercase tracking-wide">
                                Tool
                              </span>
                            )}
                            {!isToolQuote && item.pricing_tier === 'standard' && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-[600] rounded-[4px] uppercase tracking-wide">
                                Standard
                              </span>
                            )}
                            {!isToolQuote && item.pricing_tier === 'premium' && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-[600] rounded-[4px] uppercase tracking-wide">
                                Premium
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-[#1e293b] mt-1">
                            {item.product_code}
                          </div>
                          <div className="mt-2">
                            <div className="text-[13px] text-[#334155] mb-1">Price per unit</div>
                            <div className="flex items-center gap-2">
                              <div className="text-[18px] font-[700] text-[#0a0a0a]">
                                £{pricing?.discountedPrice?.toFixed(2) || item.unit_price.toFixed(2)}
                              </div>
                              {pricing?.hasDiscount && (
                                <div className="text-[14px] text-[#999] line-through">
                                  £{pricing.basePrice.toFixed(2)}
                                </div>
                              )}
                            </div>
                            {pricing?.hasDiscount && (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-[8px] mt-2">
                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[12px] font-[600] text-green-700">
                                  Saving £{pricing.savingsPerUnit.toFixed(2)}/unit • {pricing.discountLabel || 'Volume discount'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-3">
                            <label className="text-[13px] text-[#1e293b] font-[500]">Qty:</label>
                            {readOnly ? (
                              <div className="w-20 px-3 py-2 text-center font-[600]">{currentQty}</div>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max={item.pricing_tier === 'standard' ? 15 : item.pricing_tier === 'premium' ? 10 : undefined}
                                value={currentQty}
                                onChange={(e) => updateQuantity(item.product_code, parseInt(e.target.value) || 0)}
                                className={`w-20 px-3 py-2 border rounded-[8px] text-center font-[600] focus:ring-2 outline-none ${
                                  (item.pricing_tier === 'standard' && currentQty > 15) || (item.pricing_tier === 'premium' && currentQty > 10)
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-[#e8e8e8] focus:ring-[#16a34a] focus:border-[#16a34a]'
                                }`}
                              />
                            )}
                          </div>
                          {!readOnly && item.pricing_tier === 'standard' && (
                            <span className="text-[11px] text-[#64748b]">Max 15</span>
                          )}
                          {!readOnly && item.pricing_tier === 'premium' && (
                            <span className="text-[11px] text-[#64748b]">Max 10</span>
                          )}
                          {!readOnly && ((item.pricing_tier === 'standard' && currentQty > 15) || (item.pricing_tier === 'premium' && currentQty > 10)) && (
                            <span className="text-[11px] text-red-600 font-[600]">Exceeds limit</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-5">
              <div className="sticky top-6 space-y-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

                {/* TOOL QUOTES: Blue pricing guide and cart */}
                {isToolQuote && (() => {
                  const toolItems = Array.from(itemQuantities.entries())
                    .filter(([code, qty]) => qty > 0);

                  const totalToolQty = toolItems.reduce((sum, [_, qty]) => sum + qty, 0);

                  // Tool volume discount tiers
                  const getToolDiscount = (qty: number) => {
                    if (qty >= 5) return 40;
                    if (qty >= 4) return 30;
                    if (qty >= 3) return 20;
                    if (qty >= 2) return 10;
                    return 0;
                  };

                  return (
                    <>
                      {/* Tool Volume Pricing Guide */}
                      <div className="bg-gradient-to-br from-[#eff6ff] to-white rounded-[16px] p-5 shadow-sm border-2 border-[#3b82f6]/20">
                        <div className="mb-3">
                          <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Tool Volume Pricing</h3>
                          <p className="text-[12px] text-[#334155] mt-1">All tools combine for volume discounts</p>
                        </div>

                        {totalToolQty > 0 && (
                          <div className="p-3 bg-white rounded-[10px] border border-[#e8e8e8] mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] font-[600] text-[#0a0a0a]">{totalToolQty} total tools</span>
                              <span className="text-[15px] font-[800] text-[#3b82f6]">{getToolDiscount(totalToolQty)}% off</span>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-[10px] font-[600] text-[#334155] uppercase tracking-wider mb-2">Discount Guide</h4>
                          <div className="space-y-1.5">
                            {[
                              { min: 1, max: 1, discount: 0, label: 'Base price' },
                              { min: 2, max: 2, discount: 10, label: '10% off' },
                              { min: 3, max: 3, discount: 20, label: '20% off' },
                              { min: 4, max: 4, discount: 30, label: '30% off' },
                              { min: 5, max: 999, discount: 40, label: '40% off' },
                            ].map((tier, idx) => (
                              <div key={idx} className={`flex items-center justify-between p-2 rounded-[8px] border transition-all ${
                                totalToolQty >= tier.min && totalToolQty <= tier.max
                                  ? 'bg-[#3b82f6] text-white border-[#3b82f6]'
                                  : 'bg-white text-[#334155] border-[#e8e8e8]'
                              }`}>
                                <span className="text-[11px]">
                                  {tier.max === 999 ? `${tier.min}+` : tier.min === tier.max ? `${tier.min}` : `${tier.min}-${tier.max}`} tool{tier.max > 1 || tier.max === 999 ? 's' : ''}
                                </span>
                                <span className="text-[12px] font-[700]">{tier.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Selected Tools Cart */}
                      {toolItems.length > 0 && (
                        <div className="bg-white rounded-[16px] p-5 shadow-sm border-2 border-blue-200">
                          <div className="mb-4">
                            <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Selected Tools</h3>
                            <p className="text-[11px] text-[#334155] mt-1">{toolItems.length} tool{toolItems.length !== 1 ? 's' : ''} selected</p>
                          </div>

                          <div className="space-y-3">
                            {toolItems.map(([code, qty]) => {
                              const item = lineItems.find(i => i.product_code === code);
                              const previewItem = pricingPreview?.line_items.find(li => li.product_code === code);
                              const lineTotal = previewItem ? previewItem.unit_price * qty : (item?.unit_price || 0) * qty;

                              return (
                                <div key={code} className="p-3 bg-blue-50/50 rounded-[10px] border border-blue-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[11px] font-mono text-[#1e293b] mb-0.5">{code}</div>
                                      <div className="text-[13px] font-[600] text-[#0a0a0a] leading-tight">{item?.description}</div>
                                    </div>
                                    {!readOnly && (
                                      <button
                                        onClick={() => updateQuantity(code, 0)}
                                        className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                                        title="Remove"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 mt-2">
                                    {!readOnly && (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => updateQuantity(code, Math.max(0, qty - 1))}
                                          className="w-6 h-6 rounded-[6px] bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-gray-50"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                          </svg>
                                        </button>
                                        <input
                                          type="number"
                                          min="0"
                                          value={qty}
                                          onChange={(e) => updateQuantity(code, parseInt(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 border border-[#e8e8e8] rounded-[6px] text-center text-[13px] font-[600]"
                                        />
                                        <button
                                          onClick={() => updateQuantity(code, qty + 1)}
                                          className="w-6 h-6 rounded-[6px] bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-gray-50"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                          </svg>
                                        </button>
                                      </div>
                                    )}
                                    {readOnly && (
                                      <div className="text-[13px] font-[600] text-[#0a0a0a]">Qty: {qty}</div>
                                    )}
                                    <div className="flex-1 text-right">
                                      <div className="text-[11px] text-[#334155]">
                                        {previewItem && previewItem.unit_price !== previewItem.base_price && (
                                          <span className="line-through mr-1">£{previewItem.base_price.toFixed(2)}</span>
                                        )}
                                        <span className="font-[600] text-[#3b82f6]">£{(previewItem?.unit_price || item?.unit_price || 0).toFixed(2)}</span>
                                        <span className="text-[#475569]"> /unit</span>
                                      </div>
                                      <div className="text-[14px] font-[700] text-[#0a0a0a] mt-0.5">£{lineTotal.toFixed(2)}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* CONSUMABLE QUOTES: Standard and Premium pricing guides */}
                {!isToolQuote && standardTiers.length > 0 && (() => {
                  const allStandardItems = Array.from(itemQuantities.entries())
                    .filter(([code, qty]) => {
                      const item = lineItems.find(i => i.product_code === code);
                      return item?.pricing_tier === 'standard' && qty > 0;
                    });

                  const standardTotalQty = allStandardItems.reduce((sum, [_, qty]) => sum + qty, 0);
                  const tiersForDisplay = standardTiers.map((tier, idx) => ({
                    min: tier.min_quantity,
                    max: tier.max_quantity || Infinity,
                    price: tier.unit_price || 0,
                    label: `Tier ${idx + 1}`
                  }));

                  const currentTier = tiersForDisplay.find(t => standardTotalQty >= t.min && standardTotalQty <= t.max);

                  return (
                    <div className="bg-gradient-to-br from-[#ecfdf5] to-white rounded-[16px] p-5 shadow-sm border-2 border-[#16a34a]/20">
                      <div className="mb-3">
                        <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Standard Volume Pricing</h3>
                        <p className="text-[12px] text-[#334155] mt-1">All standard items combine for tier pricing</p>
                      </div>

                      {standardTotalQty > 0 && (
                        <div className="p-3 bg-white rounded-[10px] border border-[#e8e8e8] mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-[600] text-[#0a0a0a]">{standardTotalQty} total units</span>
                            <span className="text-[15px] font-[800] text-[#16a34a]">£{currentTier?.price || 33}/unit</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[10px] font-[600] text-[#334155] uppercase tracking-wider mb-2">Tier Guide</h4>
                        <div className="grid grid-cols-4 gap-1">
                          {tiersForDisplay.map((tier, idx) => (
                            <div key={idx} className={`text-center p-1 rounded-[4px] transition-all ${currentTier?.label === tier.label && standardTotalQty > 0 ? 'bg-[#16a34a] text-white' : 'bg-[#f5f5f5] text-[#1e293b]'}`}>
                              <div className="text-[8px] font-[600] opacity-80">{tier.label}</div>
                              <div className="text-[11px] font-[800] mt-0.5">£{tier.price}</div>
                              <div className="text-[7px] opacity-70 mt-0.5">{tier.max === Infinity ? `${tier.min}+` : `${tier.min}-${tier.max}`}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Standard Selected Products */}
                {!isToolQuote && (() => {
                  const standardItems = Array.from(itemQuantities.entries())
                    .filter(([code, qty]) => {
                      const item = lineItems.find(i => i.product_code === code);
                      return item?.pricing_tier === 'standard' && qty > 0;
                    });

                  if (standardItems.length === 0) return null;

                  const standardProducts = standardItems.map(([code, qty]) => {
                    const item = lineItems.find(i => i.product_code === code);
                    const previewItem = pricingPreview?.line_items.find(li => li.product_code === code);

                    return {
                      product_code: code,
                      description: item?.description || code,
                      quantity: qty,
                      base_price: previewItem?.base_price || item?.unit_price || 0,
                      unit_price: previewItem?.unit_price || item?.unit_price || 0,
                      discount_applied: previewItem?.discount_applied || null
                    };
                  });

                  return (
                    <div className="bg-white rounded-[16px] p-5 shadow-sm border-2 border-green-200">
                      <div className="mb-4">
                        <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Standard Products</h3>
                        <p className="text-[11px] text-[#334155] mt-1">{standardProducts.length} item{standardProducts.length !== 1 ? 's' : ''} selected</p>
                      </div>

                      <div className="space-y-3">
                        {standardProducts.map((item) => {
                          const currentQty = itemQuantities.get(item.product_code) || 0;
                          const lineTotal = item.unit_price * currentQty;

                          return (
                            <div key={item.product_code} className="p-3 bg-green-50/50 rounded-[10px] border border-green-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-mono text-[#1e293b] mb-0.5">{item.product_code}</div>
                                  <div className="text-[13px] font-[600] text-[#0a0a0a] leading-tight">{item.description}</div>
                                </div>
                                {!readOnly && (
                                  <button
                                    onClick={() => updateQuantity(item.product_code, 0)}
                                    className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                                    title="Remove"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mt-2">
                                {!readOnly && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.product_code, Math.max(0, currentQty - 1))}
                                      className="w-6 h-6 rounded-[6px] bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-gray-50"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                      </svg>
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={currentQty}
                                      onChange={(e) => updateQuantity(item.product_code, parseInt(e.target.value) || 0)}
                                      className="w-16 px-2 py-1 border border-[#e8e8e8] rounded-[6px] text-center text-[13px] font-[600]"
                                    />
                                    <button
                                      onClick={() => updateQuantity(item.product_code, currentQty + 1)}
                                      className="w-6 h-6 rounded-[6px] bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-gray-50"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                                {readOnly && (
                                  <div className="text-[13px] font-[600] text-[#0a0a0a]">Qty: {currentQty}</div>
                                )}
                                <div className="flex-1 text-right">
                                  <div className="text-[11px] text-[#334155]">
                                    {item.unit_price !== item.base_price && (
                                      <span className="line-through mr-1">£{item.base_price.toFixed(2)}</span>
                                    )}
                                    <span className="font-[600] text-[#16a34a]">£{item.unit_price.toFixed(2)}</span>
                                    <span className="text-[#475569]"> /unit</span>
                                  </div>
                                  <div className="text-[14px] font-[700] text-[#0a0a0a] mt-0.5">£{lineTotal.toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Premium Pricing Guide */}
                {!isToolQuote && premiumTiers.length > 0 && (
                  <div className="bg-gradient-to-br from-[#faf5ff] to-white rounded-[16px] p-5 shadow-sm border-2 border-[#a855f7]/20">
                    <div className="mb-3">
                      <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Premium Pricing</h3>
                      <p className="text-[12px] text-[#334155] mt-1">Each item priced by its own quantity</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-[600] text-[#334155] uppercase tracking-wider mb-2">Tier Guide</h4>
                      <div className="space-y-1.5">
                        {premiumTiers.map((tier, idx) => {
                          const discount = tier.discount_percent || 0;
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-[8px] border border-[#e8e8e8]">
                              <span className="text-[11px] text-[#334155]">
                                {tier.max_quantity === 999 ? `${tier.min_quantity}+` : `${tier.min_quantity}-${tier.max_quantity}`} units
                              </span>
                              <span className="text-[12px] font-[700] text-[#a855f7]">
                                {discount === 0 ? 'Base price' : `${discount}% off`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium Selected Products */}
                {!isToolQuote && (() => {
                  const premiumItems = Array.from(itemQuantities.entries())
                    .filter(([code, qty]) => {
                      const item = lineItems.find(i => i.product_code === code);
                      return item?.pricing_tier === 'premium' && qty > 0;
                    });

                  if (premiumItems.length === 0) return null;

                  const premiumProducts = premiumItems.map(([code, qty]) => {
                    const item = lineItems.find(i => i.product_code === code);
                    const previewItem = pricingPreview?.line_items.find(li => li.product_code === code);

                    return {
                      product_code: code,
                      description: item?.description || code,
                      quantity: qty,
                      base_price: previewItem?.base_price || item?.unit_price || 0,
                      unit_price: previewItem?.unit_price || item?.unit_price || 0,
                      discount_applied: previewItem?.discount_applied || null
                    };
                  });

                  return (
                    <div className="bg-white rounded-[16px] p-5 shadow-sm border-2 border-purple-200">
                      <div className="mb-4">
                        <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Premium Products</h3>
                        <p className="text-[11px] text-[#334155] mt-1">{premiumProducts.length} item{premiumProducts.length !== 1 ? 's' : ''} selected</p>
                      </div>

                      <div className="space-y-3">
                        {premiumProducts.map((item) => {
                          const currentQty = itemQuantities.get(item.product_code) || 0;
                          const lineTotal = item.unit_price * currentQty;

                          return (
                            <div key={item.product_code} className="p-3 bg-purple-50/50 rounded-[10px] border border-purple-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-mono text-[#1e293b] mb-0.5">{item.product_code}</div>
                                  <div className="text-[13px] font-[600] text-[#0a0a0a] leading-tight">{item.description}</div>
                                </div>
                                {!readOnly && (
                                  <button
                                    onClick={() => updateQuantity(item.product_code, 0)}
                                    className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                                    title="Remove"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mt-2">
                                {!readOnly && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.product_code, Math.max(0, currentQty - 1))}
                                      className="w-6 h-6 rounded-[6px] bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-gray-50"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                      </svg>
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={currentQty}
                                      onChange={(e) => updateQuantity(item.product_code, parseInt(e.target.value) || 0)}
                                      className="w-16 px-2 py-1 border border-[#e8e8e8] rounded-[6px] text-center text-[13px] font-[600]"
                                    />
                                    <button
                                      onClick={() => updateQuantity(item.product_code, currentQty + 1)}
                                      className="w-6 h-6 rounded-[6px] bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-gray-50"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                                {readOnly && (
                                  <div className="text-[13px] font-[600] text-[#0a0a0a]">Qty: {currentQty}</div>
                                )}
                                <div className="flex-1 text-right">
                                  <div className="text-[11px] text-[#334155]">
                                    {item.unit_price !== item.base_price && (
                                      <span className="line-through mr-1">£{item.base_price.toFixed(2)}</span>
                                    )}
                                    <span className="font-[600] text-[#a855f7]">£{item.unit_price.toFixed(2)}</span>
                                    <span className="text-[#475569]"> /unit</span>
                                  </div>
                                  <div className="text-[14px] font-[700] text-[#0a0a0a] mt-0.5">£{lineTotal.toFixed(2)}</div>
                                </div>
                              </div>

                              {item.discount_applied && (
                                <div className="mt-2 text-[10px] font-[600] text-[#a855f7] bg-purple-100 px-2 py-1 rounded-[6px] inline-block">
                                  {item.discount_applied}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Order Summary Card */}
                {pricingPreview && pricingPreview.line_items.length > 0 && (
                  <div className="bg-[#0a0a0a] rounded-[20px] p-8 text-white shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
                    <div className="text-[12px] font-[700] text-[#999] uppercase tracking-[0.05em] mb-6">Order Summary</div>
                    <div className="space-y-4">
                      {/* Total (before discounts) */}
                      <div className="flex justify-between items-center">
                        <span className="text-[15px] text-[#999] font-[500]">Total</span>
                        <span className="font-[600] text-[16px]">£{(pricingPreview.subtotal + pricingPreview.total_savings).toFixed(2)}</span>
                      </div>

                      {/* Discount */}
                      {pricingPreview.total_savings > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-[15px] text-[#16a34a] font-[500]">Discount</span>
                          <span className="font-[600] text-[16px] text-[#16a34a]">-£{pricingPreview.total_savings.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Subtotal (after discounts) */}
                      <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
                        <span className="text-[15px] text-[#999] font-[500]">Subtotal</span>
                        <span className="font-[700] text-[17px] tracking-[-0.01em]">£{pricingPreview.subtotal.toFixed(2)}</span>
                      </div>

                      {/* Shipping */}
                      {pricingPreview.shipping_amount !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-[15px] text-[#999] font-[500]">Shipping</span>
                          <span className="font-[600] text-[16px]">{pricingPreview.shipping_amount === 0 ? 'FREE' : `£${pricingPreview.shipping_amount.toFixed(2)}`}</span>
                        </div>
                      )}

                      {/* VAT */}
                      {pricingPreview.vat_amount !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-[15px] text-[#999] font-[500]">VAT</span>
                          <span className="font-[600] text-[16px]">£{pricingPreview.vat_amount.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Final Total */}
                      {pricingPreview.total !== undefined && (
                        <div className="flex justify-between items-center pt-4 border-t border-[#2a2a2a]">
                          <span className="text-[17px] font-[700]">Final Total</span>
                          <span className="font-[800] text-[28px] tracking-[-0.02em] text-[#16a34a]">£{pricingPreview.total.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {readOnly ? (
                      <div className="w-full mt-6 py-4 bg-gray-700 text-gray-300 rounded-[14px] text-[15px] font-[700] text-center border-2 border-dashed border-gray-600">
                        {previewMode === 'admin' ? 'Customers will see "Request Invoice" button here' : 'Quote Accepted - Invoice Sent'}
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsInvoiceModalOpen(true)}
                        disabled={getTotalQuantity() === 0}
                        className="w-full mt-6 py-4 bg-[#16a34a] text-white rounded-[14px] font-[700] text-[15px] tracking-[-0.01em] hover:bg-[#15803d] transition-all shadow-[0_4px_12px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Request Invoice ({getTotalQuantity()} items)
                      </button>
                    )}
                  </div>
                )}

                {/* Need Help Card */}
                <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
                  <div className="text-[12px] font-[700] text-[#334155] uppercase tracking-[0.05em] mb-4">Need Help?</div>
                  <p className="text-[14px] text-[#334155] mb-4">Our team is ready to assist with your order.</p>
                  <a href="tel:+441455554491" className="text-[15px] text-[#16a34a] font-[600] hover:text-[#15803d]">+44 (0)1455 554491</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PortalAddressCollectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        companyId={company.company_id}
        companyName={company.company_name}
        token={token}
        onSuccess={handleAddressSaved}
      />

      <InvoiceRequestModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        cart={Array.from(itemQuantities.entries())
          .filter(([_, qty]) => qty > 0)
          .map(([product_code, quantity]) => {
            const item = lineItems.find(i => i.product_code === product_code);
            return {
              consumable_code: product_code,
              description: item?.description || product_code,
              price: item?.unit_price || 0,
              quantity
            };
          })}
        companyId={company.company_id}
        contactId={contact?.contact_id}
        onSuccess={(orderId) => {
          console.log('[InteractiveQuotePortal] Invoice created:', orderId);
        }}
        token={token}
        pricingPreview={pricingPreview}
        quoteType="interactive"
        selectedAddressId={selectedAddressId}
      />
    </>
  );
}
