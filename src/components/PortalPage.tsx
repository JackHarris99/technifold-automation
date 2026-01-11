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

interface PortalPageProps {
  payload: CompanyPayload;
  contact?: {
    contact_id: string;
    full_name: string;
    email: string;
  };
  token: string;
  isTest?: boolean;
}

interface PricingTier {
  min_quantity: number;
  max_quantity?: number;
  unit_price?: number;
  discount_percent?: number;
}

export function PortalPage({ payload, contact, token, isTest }: PortalPageProps) {
  // Track quantities for all items
  const [itemQuantities, setItemQuantities] = useState<Map<string, number>>(new Map());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['reorder']));
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [standardTiers, setStandardTiers] = useState<PricingTier[]>([]);
  const [premiumTiers, setPremiumTiers] = useState<PricingTier[]>([]);

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

  // Fetch shipping address on mount
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.success && data.address) {
          setShippingAddress(data.address);
        } else {
          if (!isTest) {
            setShowAddressModal(true);
          }
        }
      } catch (error) {
        console.error('[PortalPage] Failed to fetch shipping address:', error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [token, isTest]);

  const handleAddressSaved = async () => {
    setShowAddressModal(false);
    try {
      const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      if (data.success && data.address) {
        setShippingAddress(data.address);
      }
    } catch (error) {
      console.error('[PortalPage] Failed to refetch shipping address:', error);
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
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[56px] font-[800] text-[#0a0a0a] mb-3 tracking-[-0.04em] leading-[1.1]">
                {payload.company_name}
              </h1>
              <p className="text-[19px] text-[#666] font-[400] tracking-[-0.01em]">
                Precision consumables ordering with intelligent tiered pricing
              </p>
            </div>
            {contact && (
              <div className="text-right">
                <p className="text-[14px] text-[#999] font-[500]">Welcome back,</p>
                <p className="text-[21px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">{contact.full_name}</p>
                <p className="text-[14px] text-[#666] mt-1">{contact.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-8 space-y-6">
            {/* Previously Ordered Section */}
            {payload.reorder_items && payload.reorder_items.length > 0 && (
              <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
                <button
                  onClick={() => toggleSection('reorder')}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors rounded-t-[20px]"
                >
                  <div>
                    <h2 className="text-[22px] font-[700] text-[#0a0a0a] tracking-tight">Previously Ordered</h2>
                    <p className="text-[14px] text-[#666] mt-1">{payload.reorder_items.length} items</p>
                  </div>
                  <svg
                    className={`w-6 h-6 text-[#666] transition-transform ${expandedSections.has('reorder') ? 'rotate-180' : ''}`}
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
                        <div key={item.consumable_code} className="flex items-center gap-4 p-4 border border-[#e8e8e8] rounded-[12px] hover:border-[#16a34a] transition-colors">
                          <div className="relative w-20 h-20 bg-[#f9fafb] rounded-[8px] flex-shrink-0 overflow-hidden">
                            <Image
                              src={item.image_url || `/product_images/${item.consumable_code}.jpg`}
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
                            <div className="font-[600] text-[15px] text-[#0a0a0a]">{item.description}</div>
                            <div className="text-[13px] text-[#666] mt-1">
                              {item.consumable_code}
                              {item.last_purchased && (
                                <span className="ml-2">• Last ordered: {new Date(item.last_purchased).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="mt-2">
                              <div className="text-[13px] text-[#666] mb-1">Price per unit</div>
                              {(() => {
                                const pricing = getPricingInfo(item.consumable_code);
                                const basePrice = item.price || 0;

                                return (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div className="text-[18px] font-[700] text-[#0a0a0a]">
                                        £{pricing?.discountedPrice?.toFixed(2) || basePrice.toFixed(2)}
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
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[13px] text-[#666] font-[500]">Qty:</label>
                            <input
                              type="number"
                              min="0"
                              value={currentQty}
                              onChange={(e) => updateQuantity(item.consumable_code, parseInt(e.target.value) || 0)}
                              className="w-20 px-3 py-2 border border-[#e8e8e8] rounded-[8px] text-center font-[600] focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] outline-none"
                            />
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
              <div key={toolTab.tool_code} className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
                <button
                  onClick={() => toggleSection(toolTab.tool_code)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors rounded-t-[20px]"
                >
                  <div>
                    <h2 className="text-[22px] font-[700] text-[#0a0a0a] tracking-tight">
                      {toolTab.tool_desc || toolTab.tool_code}
                      {toolTab.quantity && toolTab.quantity > 1 && (
                        <span className="text-[#666] font-[500]"> (x{toolTab.quantity})</span>
                      )}
                    </h2>
                    <p className="text-[14px] text-[#666] mt-1">
                      {toolTab.items.length} consumable{toolTab.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <svg
                    className={`w-6 h-6 text-[#666] transition-transform ${expandedSections.has(toolTab.tool_code) ? 'rotate-180' : ''}`}
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
                        <div key={item.consumable_code} className="flex items-center gap-4 p-4 border border-[#e8e8e8] rounded-[12px] hover:border-[#16a34a] transition-colors">
                          <div className="relative w-20 h-20 bg-[#f9fafb] rounded-[8px] flex-shrink-0 overflow-hidden">
                            <Image
                              src={(item as any).image_url || `/product_images/${item.consumable_code}.jpg`}
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
                            <div className="font-[600] text-[15px] text-[#0a0a0a]">{item.description}</div>
                            <div className="text-[13px] text-[#666] mt-1">
                              {item.consumable_code}
                              {item.category && <span className="ml-2">• {item.category}</span>}
                              {item.last_purchased && (
                                <span className="ml-2">• Last ordered: {new Date(item.last_purchased).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="mt-2">
                              <div className="text-[13px] text-[#666] mb-1">Price per unit</div>
                              {(() => {
                                const pricing = getPricingInfo(item.consumable_code);
                                const basePrice = item.price || 0;

                                return (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div className="text-[18px] font-[700] text-[#0a0a0a]">
                                        £{pricing?.discountedPrice?.toFixed(2) || basePrice.toFixed(2)}
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
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[13px] text-[#666] font-[500]">Qty:</label>
                            <input
                              type="number"
                              min="0"
                              value={currentQty}
                              onChange={(e) => updateQuantity(item.consumable_code, parseInt(e.target.value) || 0)}
                              className="w-20 px-3 py-2 border border-[#e8e8e8] rounded-[8px] text-center font-[600] focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] sticky top-6 z-30">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em]">Company Details</div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-[17px] font-[700] text-[#0a0a0a] mb-1 tracking-[-0.01em]">{payload.company_name}</div>
                  <div className="text-[13px] text-[#999] font-mono">{payload.company_id}</div>
                </div>
                <div className="pt-5 border-t border-[#e8e8e8]">
                  <div className="text-[13px] font-[600] text-[#0a0a0a] mb-3">Contact</div>
                  {contact && (
                    <div className="space-y-1">
                      <div className="text-[14px] text-[#0a0a0a] font-[500]">{contact.full_name}</div>
                      <div className="text-[13px] text-[#666]">{contact.email}</div>
                    </div>
                  )}
                </div>
                <div className="pt-5 border-t border-[#e8e8e8]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-[600] text-[#0a0a0a]">Delivery Address</div>
                    {shippingAddress && (
                      <button onClick={() => setShowAddressModal(true)} className="text-[12px] text-blue-600 hover:text-blue-700 font-[600]">Edit</button>
                    )}
                  </div>
                  {loadingAddress ? (
                    <div className="p-4 bg-[#f9fafb] rounded-[12px] border border-[#e8e8e8]">
                      <p className="text-[13px] text-[#999] italic">Loading...</p>
                    </div>
                  ) : shippingAddress ? (
                    <div className="text-[13px] text-[#666] leading-relaxed">
                      <div className="p-4 bg-[#f9fafb] rounded-[12px] border border-[#e8e8e8]">
                        <div className="font-[500] text-[#0a0a0a]">{shippingAddress.address_line_1}</div>
                        {shippingAddress.address_line_2 && <div>{shippingAddress.address_line_2}</div>}
                        <div>{shippingAddress.city}{shippingAddress.state_province ? `, ${shippingAddress.state_province}` : ''}</div>
                        <div>{shippingAddress.postal_code}</div>
                        <div className="font-[500] mt-1">{shippingAddress.country}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[13px] text-[#666] leading-relaxed">
                      <div className="p-4 bg-[#f9fafb] rounded-[12px] border border-[#e8e8e8]">
                        <p className="text-[13px] text-[#999] italic">Address information will be confirmed during checkout</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Tiers - Sticky */}
            {pricingPreview && !loadingPreview && pricingPreview.line_items.length > 0 && standardTiers.length > 0 && (() => {
              const standardItems = pricingPreview.line_items.filter(item => item.discount_applied?.includes('total units'));
              const standardTotalQty = standardItems.reduce((sum, item) => sum + item.quantity, 0);

              const tiersForDisplay = standardTiers.map((tier, idx) => ({
                min: tier.min_quantity,
                max: tier.max_quantity || Infinity,
                price: tier.unit_price || 0,
                label: `Tier ${idx + 1}`
              }));

              const hasStandardItems = standardItems.length > 0;

              if (!hasStandardItems) return null;

              const currentTier = tiersForDisplay.find(t => standardTotalQty >= t.min && standardTotalQty <= t.max);
              const nextTier = tiersForDisplay.find(t => t.min > standardTotalQty);
              const progress = currentTier ? ((standardTotalQty - currentTier.min) / (currentTier.max - currentTier.min + 1)) * 100 : 0;
              const unitsToNext = nextTier ? nextTier.min - standardTotalQty : 0;
              const potentialSavings = nextTier ? (currentTier!.price - nextTier.price) * standardTotalQty : 0;

              return (
                <div className="bg-gradient-to-br from-[#ecfdf5] to-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border-2 border-[#16a34a]/20 sticky top-[380px] z-20">
                  <div className="mb-4">
                    <h3 className="text-[18px] font-[700] text-[#0a0a0a] tracking-tight">Volume Pricing</h3>
                    <p className="text-[13px] text-[#666] mt-1 font-[500]">Order more, save more!</p>
                  </div>

                  <div className="mb-4 p-4 bg-white rounded-[12px] border border-[#e8e8e8]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-[600] text-[#0a0a0a]">Current: {currentTier?.label || 'Tier 1'}</span>
                      <span className="text-[16px] font-[800] text-[#16a34a]">£{currentTier?.price || 33}/unit</span>
                    </div>
                    <div className="text-[12px] text-[#666] mb-2">{standardTotalQty} total units</div>
                    <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                  </div>

                  {nextTier && (
                    <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] rounded-[12px] p-4 mb-4 text-white shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-[700]">Add {unitsToNext} more to unlock {nextTier.label}!</div>
                          <div className="text-[12px] opacity-90 mt-1">Save £{potentialSavings.toFixed(2)} at £{nextTier.price}/unit</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[11px] font-[600] text-[#666] uppercase tracking-wider mb-2">All Tiers</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {tiersForDisplay.map((tier, idx) => (
                        <div key={idx} className={`text-center p-2 rounded-[8px] transition-all ${currentTier?.label === tier.label ? 'bg-[#16a34a] text-white shadow-md' : 'bg-[#f5f5f5] text-[#666]'}`}>
                          <div className="text-[10px] font-[600] opacity-80">{tier.label}</div>
                          <div className="text-[14px] font-[800] mt-0.5">£{tier.price}</div>
                          <div className="text-[9px] opacity-70 mt-0.5">{tier.max === Infinity ? `${tier.min}+` : `${tier.min}-${tier.max}`}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {pricingPreview && pricingPreview.line_items.length > 0 && (
              <div className="bg-[#0a0a0a] rounded-[20px] p-8 text-white sticky top-[660px] shadow-[0_16px_48px_rgba(0,0,0,0.24)] z-10">
                <div className="text-[12px] font-[700] text-[#999] uppercase tracking-[0.05em] mb-6">Order Summary</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
                    <span className="text-[15px] text-[#999] font-[500]">Subtotal</span>
                    <span className="font-[700] text-[17px] tracking-[-0.01em]">£{pricingPreview.subtotal.toFixed(2)}</span>
                  </div>
                  {pricingPreview.shipping !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-[#999] font-[500]">Shipping</span>
                      <span className="font-[600] text-[16px]">{pricingPreview.shipping === 0 ? 'FREE' : `£${pricingPreview.shipping.toFixed(2)}`}</span>
                    </div>
                  )}
                  {pricingPreview.vat_amount !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-[#999] font-[500]">VAT</span>
                      <span className="font-[600] text-[16px]">£{pricingPreview.vat_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {pricingPreview.total !== undefined && (
                    <div className="flex justify-between items-center pt-4 border-t border-[#2a2a2a]">
                      <span className="text-[17px] font-[700]">Total</span>
                      <span className="font-[800] text-[28px] tracking-[-0.02em] text-[#16a34a]">£{pricingPreview.total.toFixed(2)}</span>
                    </div>
                  )}
                  {pricingPreview.total_savings > 0 && (
                    <div className="mt-4 p-4 bg-[#16a34a]/10 rounded-[12px] border border-[#16a34a]/20">
                      <div className="text-[13px] text-[#16a34a] font-[600]">You're saving £{pricingPreview.total_savings.toFixed(2)} with tiered pricing!</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRequestInvoice}
                  disabled={getTotalQuantity() === 0}
                  className="w-full mt-6 py-4 bg-[#16a34a] text-white rounded-[14px] font-[700] text-[15px] tracking-[-0.01em] hover:bg-[#15803d] transition-all shadow-[0_4px_12px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Invoice ({getTotalQuantity()} items)
                </button>
              </div>
            )}

            <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
              <div className="text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em] mb-4">Need Help?</div>
              <p className="text-[14px] text-[#666] mb-4">Our team is ready to assist with your order.</p>
              <a href="tel:+441455554491" className="text-[15px] text-[#16a34a] font-[600] hover:text-[#15803d]">+44 (0)1455 554491</a>
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
      />
    </div>
    </>
  );
}
