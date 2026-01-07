/**
 * Interactive Quote Portal
 * Customer-facing portal for interactive quotes with TIERED PRICING
 * Customers can adjust quantities and prices recalculate based on volume discounts
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { InvoiceRequestModal } from '../InvoiceRequestModal';

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
  };
  contact: {
    contact_id: string;
    full_name: string;
    email: string;
  } | null;
  token: string;
  isTest: boolean;
}

export function InteractiveQuotePortal({ quote, lineItems, company, contact, token, isTest }: InteractiveQuotePortalProps) {
  const [cart, setCart] = useState<any[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Detect product type from line items
  const productType = lineItems[0]?.product_type || 'consumable';
  const isToolQuote = productType === 'tool';

  // Pre-populate cart with quote items on mount
  useEffect(() => {
    const initialCart = lineItems.map(item => ({
      consumable_code: item.product_code,
      description: item.description,
      quantity: item.quantity,
      price: item.unit_price,
      category: item.category || '',
      image_url: item.image_url || null,
    }));
    setCart(initialCart);
  }, [lineItems]);

  // Fetch pricing when cart changes (recalculates with tiered rules)
  // Only include items with quantity > 0
  useEffect(() => {
    const activeItems = cart.filter(item => item.quantity > 0);

    if (activeItems.length === 0) {
      setPricingPreview(null);
      return;
    }

    const fetchPricing = async () => {
      setLoadingPreview(true);
      try {
        const response = await fetch('/api/portal/quote-pricing-interactive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            items: activeItems.map(item => ({
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
        console.error('[InteractiveQuotePortal] Failed to fetch pricing:', error);
      } finally {
        setLoadingPreview(false);
      }
    };

    const timeoutId = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timeoutId);
  }, [cart, token]);

  const updateQuantity = (productCode: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    // Keep items at 0 quantity instead of removing them
    setCart(cart.map(item =>
      item.consumable_code === productCode
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Test Mode Banner */}
      {isTest && (
        <div className="bg-yellow-500 text-white py-2 px-4 text-center font-[600]">
          ⚠️ TEST MODE - This is an internal preview link
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-6 py-12 relative">
        {/* Pricing Tier Guide - Sticky in top right */}
        <div className="fixed top-6 right-6 bg-white rounded-[16px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-2 border-blue-200 max-w-[280px] z-40">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-[14px] font-[800] text-[#0a0a0a]">
              {isToolQuote ? 'Tool Volume Discounts' : 'Consumable Pricing'}
            </h3>
          </div>

          {isToolQuote ? (
            // Tool pricing tiers
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">1 tool</span>
                  <span className="font-[600] text-[#0a0a0a]">Full price</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">2 tools</span>
                  <span className="font-[700] text-green-600">10% off</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">3 tools</span>
                  <span className="font-[700] text-green-600">20% off</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">4 tools</span>
                  <span className="font-[700] text-green-600">30% off</span>
                </div>
                <div className="flex justify-between items-center text-[13px] bg-green-50 -mx-2 px-2 py-1.5 rounded-[8px]">
                  <span className="text-[#666] font-[600]">5+ tools</span>
                  <span className="font-[800] text-green-700">40% off</span>
                </div>
              </div>
              <p className="text-[11px] text-[#999] mt-3 italic">
                Discounts apply across all tools in your order
              </p>
            </>
          ) : (
            // Consumable pricing guidance
            <>
              <div className="space-y-3">
                <div className="bg-blue-50 -mx-2 px-2 py-2 rounded-[8px]">
                  <div className="text-[13px] font-[700] text-[#0a0a0a] mb-1">Standard Pricing</div>
                  <div className="text-[12px] text-[#666]">
                    Volume-based discounts on total quantity
                  </div>
                </div>
                <div className="bg-purple-50 -mx-2 px-2 py-2 rounded-[8px]">
                  <div className="text-[13px] font-[700] text-[#0a0a0a] mb-1">Premium Pricing</div>
                  <div className="text-[12px] text-[#666]">
                    Per-item discounts based on individual quantities
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#999] mt-3 italic">
                Prices adjust automatically as you change quantities
              </p>
            </>
          )}
        </div>

        {/* Header with logos */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="relative h-10 w-32">
            <Image
              src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
              alt="Technifold"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative h-10 w-32">
            <Image
              src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technicrease.png"
              alt="Technicrease"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative h-10 w-32">
            <Image
              src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/creasestream.png"
              alt="Creasestream"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Company Name */}
        <h1 className="text-[56px] font-[800] text-[#0a0a0a] mb-3 tracking-[-0.04em] leading-[1.1] text-center">
          {company.company_name}
        </h1>

        {/* Interactive Quote Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-[12px]">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-[14px] font-[600] text-green-800">
              Volume Pricing - Buy more, save more
            </span>
          </div>
        </div>

        {/* Total Savings Badge */}
        {pricingPreview && pricingPreview.total_savings > 0 && (
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 bg-yellow-50 border-2 border-yellow-200 rounded-[12px]">
              <span className="text-[16px] font-[700] text-yellow-800">
                💰 You're saving £{pricingPreview.total_savings.toFixed(2)} with volume discounts
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Product List */}
          <div className="col-span-1 md:col-span-8 space-y-4">
            {cart.map((item) => {
              const previewItem = pricingPreview?.line_items.find(li => li.product_code === item.consumable_code);
              const basePrice = previewItem?.base_price || item.price;
              const discountedPrice = previewItem?.unit_price || item.price;
              const lineTotal = previewItem?.line_total || (discountedPrice * item.quantity);
              const hasDiscount = basePrice > discountedPrice;
              const savingsPerUnit = basePrice - discountedPrice;
              const isRemoved = item.quantity === 0;

              return (
                <div
                  key={item.consumable_code}
                  className={`bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] flex gap-6 ${isRemoved ? 'opacity-50' : ''}`}
                >
                  {item.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.description}
                        className="w-40 h-40 object-cover rounded-[12px]"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-[20px] font-[700] text-[#0a0a0a] mb-2">{item.description}</h3>
                    <p className="text-[14px] text-[#666] mb-4">{item.consumable_code}</p>

                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <div className="text-[13px] text-[#666] mb-1">Quantity</div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.consumable_code, item.quantity - 1)}
                            className="w-8 h-8 rounded-[8px] bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items-center justify-center text-[18px] font-[600]"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.consumable_code, parseInt(e.target.value) || 0)}
                            className="w-16 px-3 py-2 border border-[#e8e8e8] rounded-[8px] text-center text-[15px] font-[600]"
                            min="0"
                          />
                          <button
                            onClick={() => updateQuantity(item.consumable_code, item.quantity + 1)}
                            className="w-8 h-8 rounded-[8px] bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items-center justify-center text-[18px] font-[600]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="text-[13px] text-[#666] mb-1">Price per unit</div>
                        <div className="flex items-center gap-2">
                          <div className="text-[18px] font-[700] text-[#0a0a0a]">
                            £{discountedPrice.toFixed(2)}
                          </div>
                          {hasDiscount && (
                            <div className="text-[14px] text-[#999] line-through">
                              £{basePrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasDiscount && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-[8px]">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[13px] font-[600] text-green-700">
                          Saving £{savingsPerUnit.toFixed(2)}/unit • {previewItem?.discount_applied || 'Volume discount'}
                        </span>
                      </div>
                    )}

                    {!hasDiscount && (
                      <div className="text-[14px] text-[#666] font-[500]">
                        💡 Increase quantity to unlock volume discounts
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="text-[24px] font-[800] text-[#0a0a0a]">
                      £{lineTotal.toFixed(2)}
                    </div>
                    {isRemoved ? (
                      <button
                        onClick={() => updateQuantity(item.consumable_code, 1)}
                        className="text-[14px] text-green-600 hover:text-green-700 font-[600]"
                      >
                        Add Back
                      </button>
                    ) : (
                      <button
                        onClick={() => updateQuantity(item.consumable_code, 0)}
                        className="text-[14px] text-red-600 hover:text-red-700 font-[600]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Sidebar */}
          <div className="col-span-1 md:col-span-4">
            <div className="sticky top-6 bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
              <h2 className="text-[20px] font-[800] text-[#0a0a0a] mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {(() => {
                  const subtotal = pricingPreview?.subtotal || 0;
                  const totalSavings = pricingPreview?.total_savings || 0;
                  const originalTotal = subtotal + totalSavings;

                  return (
                    <>
                      <div className="flex justify-between text-[15px]">
                        <span className="text-[#666]">Total</span>
                        <span className="font-[600]">£{originalTotal.toFixed(2)}</span>
                      </div>

                      {totalSavings > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-green-600">Volume Savings</span>
                          <span className="font-[600] text-green-600">-£{totalSavings.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[15px]">
                        <span className="text-[#666]">Subtotal</span>
                        <span className="font-[600]">£{subtotal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between text-[15px]">
                        <span className="text-[#666]">Shipping</span>
                        <span className="font-[600]">
                          {(pricingPreview?.shipping_amount || 0) === 0 ? 'Free' : `£${(pricingPreview?.shipping_amount || 0).toFixed(2)}`}
                        </span>
                      </div>

                      <div className="flex justify-between text-[15px]">
                        <span className="text-[#666]">VAT ({((pricingPreview?.vat_rate || 0) * 100).toFixed(0)}%)</span>
                        <span className="font-[600]">£{(pricingPreview?.vat_amount || 0).toFixed(2)}</span>
                      </div>

                      <div className="h-px bg-[#e8e8e8] my-4"></div>

                      <div className="flex justify-between text-[20px]">
                        <span className="font-[800]">Final Total</span>
                        <span className="font-[800]">£{(pricingPreview?.total || 0).toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                disabled={cart.filter(item => item.quantity > 0).length === 0 || loadingPreview}
                className="w-full py-4 bg-[#16a34a] text-white rounded-[14px] text-[16px] font-[700] hover:bg-[#15803d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Invoice
              </button>

              <p className="text-[12px] text-[#666] mt-4 text-center">
                You'll receive a Stripe invoice via email to complete payment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Request Modal */}
      <InvoiceRequestModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        cart={cart}
        companyId={company.company_id}
        contactId={contact?.contact_id}
        onSuccess={(orderId) => {
          console.log('[InteractiveQuotePortal] Invoice created:', orderId);
        }}
        token={token}
        pricingPreview={pricingPreview}
        quoteType="interactive"
      />
    </div>
  );
}
