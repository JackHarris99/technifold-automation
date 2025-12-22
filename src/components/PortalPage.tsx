'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CompanyPayload, CartItem, ReorderItem } from '@/types';
import { ReorderTab } from './ReorderTab';
import { ToolTab } from './ToolTab';
import { CartBar } from './CartBar';
import { InvoiceRequestModal } from './InvoiceRequestModal';

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

interface PortalPageProps {
  payload: CompanyPayload;
  contact?: {
    contact_id: string;
    full_name: string;
    email: string;
  };
  token: string; // HMAC token for API authentication
}

export function PortalPage({ payload, contact, token }: PortalPageProps) {
  const [activeTab, setActiveTab] = useState<string>('reorder');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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
      {/* Header */}
      <header className="bg-[#0a0a0a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <div className="flex items-center">
                <div className="relative w-36 h-10">
                  <Image
                    src="/technifold-logo-white.svg"
                    alt="Technifold"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="h-8 w-px bg-[#333]"></div>
              <div>
                <h1 className="text-lg font-bold text-white">{payload.company_name}</h1>
                <p className="text-xs text-[#ccc]">Consumables Reorder Portal</p>
              </div>
            </div>
            {contact && (
              <div className="text-right hidden sm:block">
                <p className="text-sm text-[#ccc]">Welcome back,</p>
                <p className="text-sm font-medium text-white">{contact.full_name}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Sidebar Navigation */}
          <nav className="w-72 bg-white border-r border-[#e8e8e8] overflow-y-auto shadow-sm flex-shrink-0">
          <div className="p-5">
            <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider mb-4">
              Browse Products
            </h2>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#16a34a] text-white shadow-md'
                      : 'hover:bg-[#f5f5f5] text-[#0a0a0a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon === 'clock' ? (
                      <svg className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-[#999]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-[#999]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${activeTab === tab.id ? 'text-white' : ''}`}>
                        {tab.label}
                      </div>
                      {tab.code && (
                        <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-[#ccc]' : 'text-[#999]'}`}>
                          {tab.code}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Help Box */}
          <div className="p-5 border-t border-[#e8e8e8]">
            <div className="bg-[#f5f5f5] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#0a0a0a] mb-2">Need Help?</h3>
              <p className="text-xs text-[#666] mb-3">Our team is here to assist with your order.</p>
              <a href="tel:+441455554491" className="text-sm text-[#16a34a] font-medium hover:text-[#15803d]">
                +44 (0)1455 554491
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24">
          <div className="max-w-5xl mx-auto p-6">
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
        </main>
        </div>
      </div>

      {/* Cart Bar */}
      <CartBar
        itemCount={getCartQuantity()}
        totalPrice={getTotalPrice()}
        cart={cart}
        onCheckout={handleRequestInvoice}
        totalSavings={pricingPreview?.total_savings}
        shipping={pricingPreview?.shipping}
        vatAmount={pricingPreview?.vat_amount}
        total={pricingPreview?.total}
        pricingLineItems={pricingPreview?.line_items}
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