'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CompanyPayload, ReorderItem } from '@/types';
import { InvoiceRequestModal } from './InvoiceRequestModal';
import PortalAddressCollectionModal from './portals/PortalAddressCollectionModal';

interface PricingPreview {
  line_items: Array<{
    product_code: string;
    description: string;
    quantity: number;
    base_price: number;
    unit_price: number;
    line_total: number;
    discount_applied: string | null;
    image_url: string | null;
    currency: string;
  }>;
  subtotal: number;
  shipping?: number;
  vat_amount?: number;
  vat_rate?: number;
  vat_exempt_reason?: string | null;
  total?: number;
  total_savings: number;
  currency: string;
  validation_errors: string[];
}

interface ShippingAddress {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

interface BillingAddress {
  billing_address_line_1: string;
  billing_address_line_2: string;
  billing_city: string;
  billing_state_province: string;
  billing_postal_code: string;
  billing_country: string;
}

interface PortalPageProps {
  payload: CompanyPayload;
  contact?: {
    contact_id: string;
    full_name: string;
    email: string;
  };
  token?: string; // Optional for login-based portal
  isTest?: boolean;
  isLoggedIn?: boolean; // For login-based portal
  userName?: string; // User's first name
}

interface PricingTier {
  min_quantity: number;
  max_quantity?: number;
  unit_price?: number;
  discount_percent?: number;
}

export function PortalPage({ payload, contact, token, isTest, isLoggedIn, userName }: PortalPageProps) {
  // Track quantities for all items
  const [itemQuantities, setItemQuantities] = useState<Map<string, number>>(new Map());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['reorder']));
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState<(ShippingAddress & { address_id: string; is_default: boolean; label?: string })[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [standardTiers, setStandardTiers] = useState<PricingTier[]>([]);
  const [premiumTiers, setPremiumTiers] = useState<PricingTier[]>([]);

  // Helper to get tier 1 (starting) price for an item
  const getTier1Price = (pricingTier: string | undefined): number | null => {
    if (pricingTier === 'standard' && standardTiers.length > 0) {
      return standardTiers[0].unit_price || null;
    }
    if (pricingTier === 'premium' && premiumTiers.length > 0) {
      // Premium tier 1 is base price with 0% discount
      return null; // Will use item.price
    }
    return null;
  };

  // Load pricing tiers on mount
  useEffect(() => {
    async function loadTiers() {
      try {
        const response = await fetch('/api/admin/pricing-tiers');
        const data = await response.json();
        setStandardTiers(data.standard || []);
        setPremiumTiers(data.premium || []);
      } catch (err) {
        console.error('[PortalPage] Failed to load pricing tiers:', err);
      }
    }
    loadTiers();
  }, []);

  // Fetch shipping and billing addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        // Use different API endpoints for logged-in vs token-based portals
        if (isLoggedIn) {
          // Logged-in customer portal - use customer API
          const shippingResponse = await fetch('/api/customer/addresses');
          const shippingData = await shippingResponse.json();

          if (shippingData.addresses && shippingData.addresses.length > 0) {
            setShippingAddresses(shippingData.addresses);

            // Set default address as selected
            const defaultAddress = shippingData.addresses.find((addr: any) => addr.is_default);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.address_id);
            } else {
              // If no default, select the first one
              setSelectedAddressId(shippingData.addresses[0].address_id);
            }
          }
          // Don't force address modal - addresses are optional
          // Admin will collect during order approval if needed

          // For logged-in users, fetch billing address from company details
          // We still need to fetch this because payload doesn't include billing info
          const billingResponse = await fetch(`/api/portal/company-details?token=${encodeURIComponent(token)}`);
          const billingData = await billingResponse.json();

          if (billingData.success && billingData.company) {
            setBillingAddress(billingData.company);
          }
        } else {
          // Token-based portal - use original portal API
          const shippingResponse = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
          const shippingData = await shippingResponse.json();

          if (shippingData.success && shippingData.addresses) {
            setShippingAddresses(shippingData.addresses);

            // Set default address as selected
            const defaultAddress = shippingData.addresses.find((addr: any) => addr.is_default);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.address_id);
            } else if (shippingData.addresses.length > 0) {
              // If no default, select the first one
              setSelectedAddressId(shippingData.addresses[0].address_id);
            }
          }
          // Don't force address modal - addresses are optional
          // Admin will collect during order approval if needed

          // Fetch billing address from company
          const billingResponse = await fetch(`/api/portal/company-details?token=${encodeURIComponent(token)}`);
          const billingData = await billingResponse.json();

          if (billingData.success && billingData.company) {
            setBillingAddress(billingData.company);
          }
        }
      } catch (error) {
        console.error('[PortalPage] Failed to fetch addresses:', error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [token, isTest, isLoggedIn, payload]);

  const handleAddressSaved = async () => {
    setShowAddressModal(false);
    try {
      if (isLoggedIn) {
        // Logged-in customer portal
        const response = await fetch('/api/customer/addresses');
        const data = await response.json();
        if (data.addresses && data.addresses.length > 0) {
          setShippingAddresses(data.addresses);
          // Select the newly added address (likely the default one)
          const defaultAddress = data.addresses.find((addr: any) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.address_id);
          }
        }
      } else {
        // Token-based portal
        const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        if (data.success && data.addresses) {
          setShippingAddresses(data.addresses);
          // Select the newly added address (likely the default one)
          const defaultAddress = data.addresses.find((addr: any) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.address_id);
          }
        }
      }
    } catch (error) {
      console.error('[PortalPage] Failed to refetch shipping addresses:', error);
    }
  };

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
        const response = await fetch('/api/portal/pricing-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, items: itemsWithQty }),
        });

        const data = await response.json();
        if (data.success) {
          setPricingPreview(data.preview);
        }
      } catch (error) {
        console.error('[PortalPage] Failed to fetch pricing:', error);
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

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
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

  const handleRequestInvoice = () => {
    if (getTotalQuantity() === 0) return;
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSuccess = (orderId: string) => {
    console.log('[PortalPage] Invoice created successfully:', orderId);
    setItemQuantities(new Map());
    setIsInvoiceModalOpen(false);
  };

  // Build cart format for invoice modal
  const cart = Array.from(itemQuantities.entries())
    .filter(([_, qty]) => qty > 0)
    .map(([product_code, quantity]) => {
      // Find the item in payload
      let item: ReorderItem | undefined;

      // Check reorder items
      item = payload.reorder_items.find(i => i.consumable_code === product_code);

      // Check tool tabs
      if (!item) {
        for (const toolTab of payload.by_tool_tabs || []) {
          item = toolTab.items.find(i => i.consumable_code === product_code);
          if (item) break;
        }
      }

      return {
        consumable_code: product_code,
        description: item?.description || product_code,
        price: item?.price || 0,
        quantity
      };
    });

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
      {/* Top Branding Bar */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-8 ${isLoggedIn ? '' : 'mx-auto'}`}>
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

            {/* Navigation (logged-in portal only) */}
            {isLoggedIn && (
              <nav className="flex items-center gap-6 ml-8">
                <a
                  href="/customer/portal"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Reorder
                </a>
                <a
                  href="/customer/orders"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Order History
                </a>
                <a
                  href="/customer/addresses"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Addresses
                </a>
                <a
                  href="/customer/account"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Account
                </a>
              </nav>
            )}
            </div>

            {/* User Menu (logged-in portal only) */}
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#666]">Welcome, <strong>{userName}</strong></span>
                <button
                  onClick={async () => {
                    await fetch('/api/customer/auth/logout', { method: 'POST' });
                    window.location.href = '/customer/login';
                  }}
                  className="px-4 py-2 text-sm font-semibold text-[#666] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-12">
        {/* Main Grid - Starts from Top */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-7 space-y-4">
            {/* Customer Information Card */}
            <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
              <div className="mb-6">
                <h1 className="text-[28px] font-[600] text-[#1e40af] mb-1 tracking-[-0.02em] leading-[1.2]">
                  {payload.company_name}
                </h1>
                <p className="text-[13px] text-[#334155] font-[400]">
                  Precision consumables ordering with intelligent tiered pricing
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
                    {billingAddress && (
                      <button onClick={() => setShowAddressModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">Edit</button>
                    )}
                  </div>
                  {loadingAddress ? (
                    <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                      <p className="text-[12px] text-[#475569] italic">Loading...</p>
                    </div>
                  ) : billingAddress && billingAddress.billing_address_line_1 ? (
                    <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                      <div className="text-[12px] font-[500] text-[#1e293b]">{billingAddress.billing_address_line_1}</div>
                      {billingAddress.billing_address_line_2 && <div className="text-[11px] text-[#334155]">{billingAddress.billing_address_line_2}</div>}
                      <div className="text-[11px] text-[#334155]">{billingAddress.billing_city}{billingAddress.billing_state_province ? `, ${billingAddress.billing_state_province}` : ''}</div>
                      <div className="text-[11px] text-[#334155]">{billingAddress.billing_postal_code}</div>
                      <div className="text-[12px] font-[500] text-[#1e293b] mt-1">{billingAddress.billing_country}</div>
                      {billingAddress.vat_number && (
                        <div className="mt-2 pt-2 border-t border-[#e2e8f0]">
                          <div className="text-[10px] font-[600] text-[#475569] uppercase tracking-wider mb-1">VAT Number</div>
                          <div className="text-[12px] font-mono font-[600] text-[#059669]">{billingAddress.vat_number}</div>
                        </div>
                      )}
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
                    <button onClick={() => setShowAddressModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">
                      {shippingAddresses.length > 0 ? 'Add New' : 'Add'}
                    </button>
                  </div>
                  {loadingAddress ? (
                    <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                      <p className="text-[12px] text-[#475569] italic">Loading...</p>
                    </div>
                  ) : shippingAddresses.length > 0 ? (
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                      {shippingAddresses.map((addr) => (
                        <div
                          key={addr.address_id}
                          onClick={() => setSelectedAddressId(addr.address_id)}
                          className={`p-2 rounded-[8px] border cursor-pointer transition-all ${
                            selectedAddressId === addr.address_id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="radio"
                              checked={selectedAddressId === addr.address_id}
                              onChange={() => setSelectedAddressId(addr.address_id)}
                              className="mt-0.5 text-blue-600"
                            />
                            <div className="flex-1 min-w-0">
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
                              <div className="text-[10px] font-[500] text-[#1e293b]">{addr.country}</div>
                            </div>
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
            {/* Previously Ordered Section */}
            {payload.reorder_items && payload.reorder_items.length > 0 && (
              <div className="bg-white rounded-[16px] shadow-sm border-2 border-blue-100 overflow-hidden">
                <button
                  onClick={() => toggleSection('reorder')}
                  className="w-full px-6 py-4 flex items-center justify-between text-left bg-gradient-to-r from-blue-50/50 to-transparent hover:from-blue-50 transition-colors"
                >
                  <div>
                    <h2 className="text-[17px] font-[600] text-[#1e40af] tracking-[-0.01em]">Previously Ordered</h2>
                    <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">{payload.reorder_items.length} items available</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#3b82f6] transition-transform ${expandedSections.has('reorder') ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.has('reorder') && (
                  <div className="px-8 pb-8 pt-4 space-y-4 border-t border-[#e8e8e8]">
                    {payload.reorder_items.map((item) => {
                      const currentQty = itemQuantities.get(item.consumable_code) || 0;

                      return (
                        <div key={item.consumable_code} className={`flex items-center gap-4 p-4 rounded-[12px] transition-colors ${
                          item.pricing_tier === 'standard'
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
                              {item.pricing_tier === 'standard' && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-[600] rounded-[4px] uppercase tracking-wide">
                                  Standard
                                </span>
                              )}
                              {item.pricing_tier === 'premium' && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-[600] rounded-[4px] uppercase tracking-wide">
                                  Premium
                                </span>
                              )}
                            </div>
                            <div className="text-[13px] text-[#1e293b] mt-1">
                              {item.consumable_code}
                            </div>
                            <div className="mt-2">
                              <div className="text-[13px] text-[#334155] mb-1">Price per unit</div>
                              {(() => {
                                const pricing = getPricingInfo(item.consumable_code);
                                const tier1Price = getTier1Price(item.pricing_tier);
                                const hasTieredPricing = item.pricing_tier === 'standard' || item.pricing_tier === 'premium';

                                // For tiered items, don't show price until tier1Price is available
                                if (hasTieredPricing && !tier1Price && !pricing) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <div className="text-[15px] text-[#999] italic">
                                        Calculating...
                                      </div>
                                    </div>
                                  );
                                }

                                // For tiered items, never fall back to base price
                                const displayPrice = hasTieredPricing
                                  ? (pricing?.discountedPrice || tier1Price || 0)
                                  : (pricing?.discountedPrice || item.price || 0);

                                return (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div className="text-[18px] font-[700] text-[#0a0a0a]">
                                        £{displayPrice.toFixed(2)}
                                      </div>
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
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-3">
                              <label className="text-[13px] text-[#1e293b] font-[500]">Qty:</label>
                              <input
                                type="number"
                                min="0"
                                max={item.pricing_tier === 'standard' ? 15 : item.pricing_tier === 'premium' ? 10 : undefined}
                                value={currentQty}
                                onChange={(e) => updateQuantity(item.consumable_code, parseInt(e.target.value) || 0)}
                                className={`w-20 px-3 py-2 border rounded-[8px] text-center font-[600] focus:ring-2 outline-none ${
                                  (item.pricing_tier === 'standard' && currentQty > 15) || (item.pricing_tier === 'premium' && currentQty > 10)
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-[#e8e8e8] focus:ring-[#16a34a] focus:border-[#16a34a]'
                                }`}
                              />
                            </div>
                            {item.pricing_tier === 'standard' && (
                              <span className="text-[11px] text-[#64748b]">Max 15</span>
                            )}
                            {item.pricing_tier === 'premium' && (
                              <span className="text-[11px] text-[#64748b]">Max 10</span>
                            )}
                            {((item.pricing_tier === 'standard' && currentQty > 15) || (item.pricing_tier === 'premium' && currentQty > 10)) && (
                              <span className="text-[11px] text-red-600 font-[600]">Exceeds limit</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tool Sections */}
            {(payload.by_tool_tabs || []).map((toolTab) => (
              <div key={toolTab.tool_code} className="bg-white rounded-[16px] shadow-sm border-2 border-blue-100 overflow-hidden">
                <button
                  onClick={() => toggleSection(toolTab.tool_code)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left bg-gradient-to-r from-blue-50/50 to-transparent hover:from-blue-50 transition-colors"
                >
                  <div>
                    <h2 className="text-[17px] font-[600] text-[#1e40af] tracking-[-0.01em]">
                      {toolTab.tool_desc || toolTab.tool_code}
                      {toolTab.quantity && toolTab.quantity > 1 && (
                        <span className="text-[#334155] font-[500] text-[15px]"> (x{toolTab.quantity})</span>
                      )}
                    </h2>
                    <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
                      {toolTab.items.length} consumable{toolTab.items.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#3b82f6] transition-transform ${expandedSections.has(toolTab.tool_code) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.has(toolTab.tool_code) && (
                  <div className="px-8 pb-8 pt-4 space-y-4 border-t border-[#e8e8e8]">
                    {toolTab.items.map((item) => {
                      const currentQty = itemQuantities.get(item.consumable_code) || 0;

                      return (
                        <div key={item.consumable_code} className={`flex items-center gap-4 p-4 rounded-[12px] transition-colors ${
                          item.pricing_tier === 'standard'
                            ? 'border-2 border-green-200 hover:border-green-300 bg-green-50/30'
                            : item.pricing_tier === 'premium'
                            ? 'border-2 border-purple-200 hover:border-purple-300 bg-purple-50/30'
                            : 'border border-[#e8e8e8] hover:border-[#16a34a]'
                        }`}>
                          <div className="relative w-20 h-20 bg-[#f9fafb] rounded-[8px] flex-shrink-0 overflow-hidden">
                            <Image
                              src={(item as any).image_url || '/product-placeholder.svg'}
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
                              {item.pricing_tier === 'standard' && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-[600] rounded-[4px] uppercase tracking-wide">
                                  Standard
                                </span>
                              )}
                              {item.pricing_tier === 'premium' && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-[600] rounded-[4px] uppercase tracking-wide">
                                  Premium
                                </span>
                              )}
                            </div>
                            <div className="text-[13px] text-[#1e293b] mt-1">
                              {item.consumable_code}
                              {item.category && <span className="ml-2">• {item.category}</span>}
                            </div>
                            <div className="mt-2">
                              <div className="text-[13px] text-[#334155] mb-1">Price per unit</div>
                              {(() => {
                                const pricing = getPricingInfo(item.consumable_code);
                                const tier1Price = getTier1Price(item.pricing_tier);
                                const hasTieredPricing = item.pricing_tier === 'standard' || item.pricing_tier === 'premium';

                                // For tiered items, don't show price until tier1Price is available
                                if (hasTieredPricing && !tier1Price && !pricing) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <div className="text-[15px] text-[#999] italic">
                                        Calculating...
                                      </div>
                                    </div>
                                  );
                                }

                                // For tiered items, never fall back to base price
                                const displayPrice = hasTieredPricing
                                  ? (pricing?.discountedPrice || tier1Price || 0)
                                  : (pricing?.discountedPrice || item.price || 0);

                                return (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div className="text-[18px] font-[700] text-[#0a0a0a]">
                                        £{displayPrice.toFixed(2)}
                                      </div>
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
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-3">
                              <label className="text-[13px] text-[#1e293b] font-[500]">Qty:</label>
                              <input
                                type="number"
                                min="0"
                                max={item.pricing_tier === 'standard' ? 15 : item.pricing_tier === 'premium' ? 10 : undefined}
                                value={currentQty}
                                onChange={(e) => updateQuantity(item.consumable_code, parseInt(e.target.value) || 0)}
                                className={`w-20 px-3 py-2 border rounded-[8px] text-center font-[600] focus:ring-2 outline-none ${
                                  (item.pricing_tier === 'standard' && currentQty > 15) || (item.pricing_tier === 'premium' && currentQty > 10)
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-[#e8e8e8] focus:ring-[#16a34a] focus:border-[#16a34a]'
                                }`}
                              />
                            </div>
                            {item.pricing_tier === 'standard' && (
                              <span className="text-[11px] text-[#64748b]">Max 15</span>
                            )}
                            {item.pricing_tier === 'premium' && (
                              <span className="text-[11px] text-[#64748b]">Max 10</span>
                            )}
                            {((item.pricing_tier === 'standard' && currentQty > 15) || (item.pricing_tier === 'premium' && currentQty > 10)) && (
                              <span className="text-[11px] text-red-600 font-[600]">Exceeds limit</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Sidebar - Single Sticky Container with Internal Scroll */}
          <div className="col-span-5">
            <div className="sticky top-6 space-y-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

            {/* Standard Pricing Guide - Always Visible */}
            {standardTiers.length > 0 && (() => {
              const allStandardItems = Array.from(itemQuantities.entries())
                .filter(([code, qty]) => {
                  const item = [...payload.reorder_items, ...(payload.by_tool_tabs?.flatMap(t => t.items) || [])]
                    .find(i => i.consumable_code === code);
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
            {(() => {
              // Always check itemQuantities Map for standard items
              const standardItems = Array.from(itemQuantities.entries())
                .filter(([code, qty]) => {
                  const item = [...payload.reorder_items, ...(payload.by_tool_tabs?.flatMap(t => t.items) || [])]
                    .find(i => i.consumable_code === code);
                  return item?.pricing_tier === 'standard' && qty > 0;
                });

              if (standardItems.length === 0) return null;

              // Get full product info from pricingPreview API
              const standardProducts = standardItems.map(([code, qty]) => {
                const item = [...payload.reorder_items, ...(payload.by_tool_tabs?.flatMap(t => t.items) || [])]
                  .find(i => i.consumable_code === code);
                const previewItem = pricingPreview?.line_items.find(li => li.product_code === code);
                const hasTieredPricing = item?.pricing_tier === 'standard' || item?.pricing_tier === 'premium';

                return {
                  product_code: code,
                  description: item?.description || code,
                  quantity: qty,
                  base_price: previewItem?.base_price || item?.price || 0,
                  // For tiered items, only use previewItem price (don't fall back to base price)
                  unit_price: hasTieredPricing ? (previewItem?.unit_price || null) : (previewItem?.unit_price || item?.price || 0),
                  discount_applied: previewItem?.discount_applied || null,
                  has_tiered_pricing: hasTieredPricing
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
                      const lineTotal = item.unit_price !== null ? item.unit_price * currentQty : 0;

                      return (
                        <div key={item.product_code} className="p-3 bg-green-50/50 rounded-[10px] border border-green-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-mono text-[#1e293b] mb-0.5">{item.product_code}</div>
                              <div className="text-[13px] font-[600] text-[#0a0a0a] leading-tight">{item.description}</div>
                            </div>
                            <button
                              onClick={() => updateQuantity(item.product_code, 0)}
                              className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center gap-3 mt-2">
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
                            <div className="flex-1 text-right">
                              {item.unit_price !== null ? (
                                <>
                                  <div className="text-[11px] text-[#334155]">
                                    <span className="font-[600] text-[#16a34a]">£{item.unit_price.toFixed(2)}</span>
                                    <span className="text-[#475569]"> /unit</span>
                                  </div>
                                  <div className="text-[14px] font-[700] text-[#0a0a0a] mt-0.5">£{lineTotal.toFixed(2)}</div>
                                </>
                              ) : (
                                <div className="text-[11px] text-[#999] italic">Calculating...</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Premium Pricing Guide - Always Visible */}
            {premiumTiers.length > 0 && (
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
            {(() => {
              // Always check itemQuantities Map for premium items
              const premiumItems = Array.from(itemQuantities.entries())
                .filter(([code, qty]) => {
                  const item = [...payload.reorder_items, ...(payload.by_tool_tabs?.flatMap(t => t.items) || [])]
                    .find(i => i.consumable_code === code);
                  return item?.pricing_tier === 'premium' && qty > 0;
                });

              if (premiumItems.length === 0) return null;

              // Get full product info from pricingPreview if available
              const premiumProducts = premiumItems.map(([code, qty]) => {
                const item = [...payload.reorder_items, ...(payload.by_tool_tabs?.flatMap(t => t.items) || [])]
                  .find(i => i.consumable_code === code);
                const previewItem = pricingPreview?.line_items.find(li => li.product_code === code);

                return {
                  product_code: code,
                  description: item?.description || code,
                  quantity: qty,
                  base_price: previewItem?.base_price || item?.price || 0,
                  // Premium items always need calculated pricing - don't fall back to base price
                  unit_price: previewItem?.unit_price || null,
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
                      const lineTotal = item.unit_price !== null ? item.unit_price * currentQty : 0;

                      return (
                        <div key={item.product_code} className="p-3 bg-purple-50/50 rounded-[10px] border border-purple-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-mono text-[#1e293b] mb-0.5">{item.product_code}</div>
                              <div className="text-[13px] font-[600] text-[#0a0a0a] leading-tight">{item.description}</div>
                            </div>
                            <button
                              onClick={() => updateQuantity(item.product_code, 0)}
                              className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center gap-3 mt-2">
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
                            <div className="flex-1 text-right">
                              {item.unit_price !== null ? (
                                <>
                                  <div className="text-[11px] text-[#334155]">
                                    {item.unit_price !== item.base_price && (
                                      <span className="line-through mr-1">£{item.base_price.toFixed(2)}</span>
                                    )}
                                    <span className="font-[600] text-[#a855f7]">£{item.unit_price.toFixed(2)}</span>
                                    <span className="text-[#475569]"> /unit</span>
                                  </div>
                                  <div className="text-[14px] font-[700] text-[#0a0a0a] mt-0.5">£{lineTotal.toFixed(2)}</div>
                                </>
                              ) : (
                                <div className="text-[11px] text-[#999] italic">Calculating...</div>
                              )}
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
            {getTotalQuantity() > 0 && (
              <div className="bg-[#0a0a0a] rounded-[20px] p-8 text-white shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
                <div className="text-[12px] font-[700] text-[#999] uppercase tracking-[0.05em] mb-6">Order Summary</div>
                {pricingPreview && pricingPreview.line_items.length > 0 ? (
                  <div className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
                      <span className="text-[15px] text-[#999] font-[500]">Subtotal</span>
                      <span className="font-[700] text-[17px] tracking-[-0.01em]">£{pricingPreview.subtotal.toFixed(2)}</span>
                    </div>

                    {/* Predicted Shipping */}
                    {pricingPreview.shipping !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-[15px] text-[#999] font-[500]">Predicted Shipping</span>
                        <span className="font-[600] text-[16px]">{pricingPreview.shipping === 0 ? 'FREE' : `£${pricingPreview.shipping.toFixed(2)}`}</span>
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
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-4 text-[#999]">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm">Calculating pricing...</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleRequestInvoice}
                  disabled={getTotalQuantity() === 0}
                  className="w-full mt-6 py-4 bg-[#16a34a] text-white rounded-[14px] font-[700] text-[15px] tracking-[-0.01em] hover:bg-[#15803d] transition-all shadow-[0_4px_12px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Order ({getTotalQuantity()} items)
                </button>
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

      <PortalAddressCollectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        companyId={payload.company_id}
        companyName={payload.company_name}
        token={token}
        onSuccess={handleAddressSaved}
      />

      <InvoiceRequestModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        cart={cart}
        companyId={payload.company_id}
        contactId={contact?.contact_id}
        onSuccess={handleInvoiceSuccess}
        token={token}
        pricingPreview={pricingPreview}
        selectedAddressId={selectedAddressId}
      />
    </div>
    </>
  );
}
