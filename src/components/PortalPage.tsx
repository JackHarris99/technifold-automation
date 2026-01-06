'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CompanyPayload, CartItem, ReorderItem } from '@/types';
import { ReorderTab } from './ReorderTab';
import { ToolTab } from './ToolTab';
import { CartBar } from './CartBar';
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
  token: string; // HMAC token for API authentication
  isTest?: boolean; // Test tokens bypass address collection
}

export function PortalPage({ payload, contact, token, isTest }: PortalPageProps) {
  const [activeTab, setActiveTab] = useState<string>('reorder');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Fetch shipping address on mount
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.success && data.address) {
          setShippingAddress(data.address);
        } else {
          // No address exists - show modal to collect it (unless this is a test token)
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

  // Handler for when address is successfully saved
  const handleAddressSaved = async () => {
    setShowAddressModal(false);

    // Refetch the address
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

  // Fetch pricing preview when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      setPricingPreview(null);
      return;
    }

    const fetchPricing = async () => {
      setLoadingPreview(true);
      try {
        const response = await fetch('/api/portal/pricing-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            items: cart.map(item => ({
              product_code: item.consumable_code,
              quantity: item.quantity,
            })),
          }),
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

    // Debounce pricing fetch
    const timeoutId = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timeoutId);
  }, [cart, token]);

  const addToCart = (item: ReorderItem, quantity: number) => {
    if (quantity <= 0) return;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        cartItem => cartItem.consumable_code === item.consumable_code
      );

      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity = quantity;
        return newCart;
      } else {
        return [...prevCart, {
          consumable_code: item.consumable_code,
          description: item.description,
          price: item.price,
          quantity
        }];
      }
    });
  };

  const removeFromCart = (consumableCode: string) => {
    setCart(prevCart => prevCart.filter(item => item.consumable_code !== consumableCode));
  };

  const getTotalPrice = () => {
    // Use tiered pricing if available, otherwise base pricing
    if (pricingPreview && pricingPreview.line_items.length > 0) {
      return pricingPreview.subtotal;
    }
    return cart.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const getCartQuantity = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleRequestInvoice = () => {
    if (cart.length === 0) return;
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSuccess = (orderId: string) => {
    console.log('[PortalPage] Invoice created successfully:', orderId);
    // Clear cart after successful invoice request
    setCart([]);
    setIsInvoiceModalOpen(false);
    // Show success message - invoice sent to email
  };

  const tabs = [
    { id: 'reorder', label: 'Previously Ordered', code: '', icon: 'clock' },
    ...(payload.by_tool_tabs || []).map(tab => ({
      id: tab.tool_code,
      label: tab.quantity && tab.quantity > 1
        ? `${tab.tool_desc || tab.tool_code} (x${tab.quantity})`
        : (tab.tool_desc || tab.tool_code),
      code: tab.tool_code,
      icon: 'tool'
    }))
  ];

  return (
    <>
      {/* Premium Font */}
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

          {/* Category Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-[14px] font-[600] text-[15px] tracking-[-0.01em] whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0a0a0a] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                    : 'bg-white text-[#666] hover:bg-[#f5f5f5] border border-[#e8e8e8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-8 space-y-6">
            {activeTab === 'reorder' ? (
              <ReorderTab
                items={payload.reorder_items}
                cart={cart}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
              />
            ) : (
              (() => {
                const toolTab = payload.by_tool_tabs.find(tab => tab.tool_code === activeTab);
                return toolTab ? (
                  <ToolTab
                    toolTab={toolTab}
                    cart={cart}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                  />
                ) : null;
              })()
            )}

            {/* Tiered Pricing Guide */}
            {pricingPreview && !loadingPreview && pricingPreview.line_items.length > 0 && (() => {
              const standardItems = pricingPreview.line_items.filter(item => item.discount_applied?.includes('total units'));
              const standardTotalQty = standardItems.reduce((sum, item) => sum + item.quantity, 0);

              const standardTiers = [
                { min: 1, max: 3, price: 33, label: 'Tier 1' },
                { min: 4, max: 7, price: 29, label: 'Tier 2' },
                { min: 8, max: 11, price: 25, label: 'Tier 3' },
                { min: 12, max: 19, price: 21, label: 'Tier 4' },
                { min: 20, max: Infinity, price: 17, label: 'Tier 5' },
              ];

              const premiumItems = pricingPreview.line_items.filter(item => item.discount_applied && !item.discount_applied.includes('total units'));

              const hasStandardItems = standardItems.length > 0;
              const hasPremiumItems = premiumItems.length > 0;

              if (!hasStandardItems && !hasPremiumItems) return null;

              return (
                <div className="mt-10 space-y-6">
                  {/* STANDARD TIER PRICING */}
                  {hasStandardItems && (() => {
                    const currentTier = standardTiers.find(t => standardTotalQty >= t.min && standardTotalQty <= t.max);
                    const nextTier = standardTiers.find(t => t.min > standardTotalQty);

                    const progress = currentTier
                      ? ((standardTotalQty - currentTier.min) / (currentTier.max - currentTier.min + 1)) * 100
                      : 0;

                    const unitsToNext = nextTier ? nextTier.min - standardTotalQty : 0;
                    const potentialSavings = nextTier
                      ? (currentTier!.price - nextTier.price) * standardTotalQty
                      : 0;

                    return (
                      <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <h3 className="text-[22px] font-[700] text-[#0a0a0a] tracking-tight">Standard Tier Pricing</h3>
                            <p className="text-[14px] text-[#666] mt-1 font-[400]">
                              Combined total: {standardTotalQty} units
                            </p>
                          </div>
                          {pricingPreview.total_savings > 0 && (
                            <div className="text-right">
                              <div className="text-[14px] text-[#666] font-[500]">Total Savings</div>
                              <div className="text-[28px] font-[800] text-[#16a34a]">
                                £{pricingPreview.total_savings.toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tier Progress */}
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[14px] font-[600] text-[#0a0a0a]">
                              {currentTier?.label || 'Tier 1'} - £{currentTier?.price || 33}/unit
                            </span>
                            <span className="text-[14px] font-[500] text-[#666]">
                              {Math.min(progress, 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-3 bg-[#f0f0f0] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Next Tier Unlock */}
                        {nextTier && (
                          <div className="bg-gradient-to-r from-[#ecfdf5] to-[#d1fae5] rounded-[12px] p-4 border border-[#a7f3d0]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#16a34a] rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="text-[14px] font-[700] text-[#0a0a0a]">
                                  Add {unitsToNext} more {unitsToNext === 1 ? 'unit' : 'units'} to unlock {nextTier.label}
                                </div>
                                <div className="text-[13px] text-[#166534] mt-0.5 font-[500]">
                                  Get £{nextTier.price}/unit pricing - Save an additional £{potentialSavings.toFixed(2)}!
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* All Tiers Reference */}
                        <div className="mt-6 pt-6 border-t border-[#e8e8e8]">
                          <h4 className="text-[12px] font-[600] text-[#666] uppercase tracking-wider mb-3">All Pricing Tiers</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {standardTiers.filter(t => t.max !== Infinity).map((tier, idx) => (
                              <div
                                key={idx}
                                className={`text-center p-2 rounded-[8px] transition-all ${
                                  currentTier?.label === tier.label
                                    ? 'bg-[#16a34a] text-white'
                                    : 'bg-[#f5f5f5] text-[#666]'
                                }`}
                              >
                                <div className="text-[11px] font-[600] opacity-80">{tier.label}</div>
                                <div className="text-[16px] font-[800] mt-0.5">£{tier.price}</div>
                                <div className="text-[10px] opacity-70 mt-0.5">{tier.min}-{tier.max} units</div>
                              </div>
                            ))}
                            <div className={`text-center p-2 rounded-[8px] transition-all ${
                              currentTier?.label === 'Tier 5' ? 'bg-[#16a34a] text-white' : 'bg-[#f5f5f5] text-[#666]'
                            }`}>
                              <div className="text-[11px] font-[600] opacity-80">Tier 5</div>
                              <div className="text-[16px] font-[800] mt-0.5">£17</div>
                              <div className="text-[10px] opacity-70 mt-0.5">20+ units</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* PREMIUM TIER PRICING */}
                  {hasPremiumItems && (
                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
                      <h3 className="text-[22px] font-[700] text-[#0a0a0a] tracking-tight mb-5">Premium Product Discounts</h3>
                      <div className="space-y-3">
                        {premiumItems.map((item) => (
                          <div key={item.product_code} className="flex items-center justify-between p-4 bg-[#f5f5f5] rounded-[12px]">
                            <div className="flex-1">
                              <div className="font-[600] text-[14px] text-[#0a0a0a]">{item.description}</div>
                              <div className="text-[12px] text-[#666] font-mono mt-1">{item.product_code}</div>
                            </div>
                            <div className="text-right">
                              {item.discount_applied && (
                                <div className="inline-flex items-center px-3 py-1.5 bg-[#16a34a] text-white text-[12px] font-[600] rounded-[6px] mb-1">
                                  {item.discount_applied}
                                </div>
                              )}
                              <div className="text-[14px] text-[#999] line-through">£{item.base_price.toFixed(2)}</div>
                              <div className="text-[18px] font-[700] text-[#0a0a0a]">£{item.unit_price.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em]">Company Details</div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-[17px] font-[700] text-[#0a0a0a] mb-1 tracking-[-0.01em]">{payload.company_name}</div>
                  <div className="text-[13px] text-[#999] font-mono">
                    {payload.company_id}
                  </div>
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
                  </div>
                  {loadingAddress ? (
                    <div className="p-4 bg-[#f9fafb] rounded-[12px] border border-[#e8e8e8]">
                      <p className="text-[13px] text-[#999] italic">Loading...</p>
                    </div>
                  ) : shippingAddress ? (
                    <div className="text-[13px] text-[#666] leading-relaxed">
                      <div className="p-4 bg-[#f9fafb] rounded-[12px] border border-[#e8e8e8]">
                        <div className="font-[500] text-[#0a0a0a]">{shippingAddress.address_line_1}</div>
                        {shippingAddress.address_line_2 && (
                          <div>{shippingAddress.address_line_2}</div>
                        )}
                        <div>{shippingAddress.city}{shippingAddress.state_province ? `, ${shippingAddress.state_province}` : ''}</div>
                        <div>{shippingAddress.postal_code}</div>
                        <div className="font-[500] mt-1">{shippingAddress.country}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[13px] text-[#666] leading-relaxed">
                      <div className="p-4 bg-[#f9fafb] rounded-[12px] border border-[#e8e8e8]">
                        <p className="text-[13px] text-[#999] italic">
                          Address information will be confirmed during checkout
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {pricingPreview && pricingPreview.line_items.length > 0 && (
              <div className="bg-[#0a0a0a] rounded-[20px] p-8 text-white sticky top-[200px] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
                <div className="text-[12px] font-[700] text-[#999] uppercase tracking-[0.05em] mb-6">Order Summary</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
                    <span className="text-[15px] text-[#999] font-[500]">Subtotal</span>
                    <span className="font-[700] text-[17px] tracking-[-0.01em]">£{pricingPreview.subtotal.toFixed(2)}</span>
                  </div>
                  {pricingPreview.shipping !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-[#999] font-[500]">Shipping</span>
                      <span className="font-[600] text-[16px]">
                        {pricingPreview.shipping === 0 ? 'FREE' : `£${pricingPreview.shipping.toFixed(2)}`}
                      </span>
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
                      <div className="text-[13px] text-[#16a34a] font-[600]">
                        You're saving £{pricingPreview.total_savings.toFixed(2)} with tiered pricing!
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRequestInvoice}
                  disabled={getCartQuantity() === 0}
                  className="w-full mt-6 py-4 bg-[#16a34a] text-white rounded-[14px] font-[700] text-[15px] tracking-[-0.01em] hover:bg-[#15803d] transition-all shadow-[0_4px_12px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Invoice ({getCartQuantity()} items)
                </button>
              </div>
            )}

            {/* Help Card */}
            <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
              <div className="text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em] mb-4">Need Help?</div>
              <p className="text-[14px] text-[#666] mb-4">Our team is ready to assist with your order.</p>
              <a href="tel:+441455554491" className="text-[15px] text-[#16a34a] font-[600] hover:text-[#15803d]">
                +44 (0)1455 554491
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Address Collection Modal (shown on first visit if no address) */}
      <PortalAddressCollectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        companyId={payload.company_id}
        companyName={payload.company_name}
        token={token}
        onSuccess={handleAddressSaved}
      />

      {/* Invoice Request Modal */}
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