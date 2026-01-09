/**
 * Static Quote Portal
 * Customer-facing portal for static quotes with FIXED PRICING
 * Customers can adjust quantities but unit prices stay locked at quoted amounts
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { InvoiceRequestModal } from '../InvoiceRequestModal';
import AddressCollectionModal from '../portals/AddressCollectionModal';

interface LineItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url: string | null;
}

interface PricingPreview {
  line_items: LineItem[];
  subtotal: number;
  vat_amount: number;
  vat_rate: number;
  shipping_amount: number;
  total: number;
  currency: string;
}

interface StaticQuotePortalProps {
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
  shippingAddress?: {
    address_id: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province?: string;
    postal_code: string;
    country: string;
    is_default: boolean;
  } | null;
}

export function StaticQuotePortal({ quote, lineItems, company, contact, token, isTest, shippingAddress }: StaticQuotePortalProps) {
  const [cart, setCart] = useState<any[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Pre-populate cart with quote items on mount
  useEffect(() => {
    const initialCart = lineItems.map(item => ({
      consumable_code: item.product_code,
      description: item.description,
      quantity: item.quantity,
      price: item.unit_price, // LOCKED price from quote
      category: item.category || '',
      image_url: item.image_url || null,
    }));
    setCart(initialCart);
  }, [lineItems]);

  // Fetch pricing when cart changes (for VAT/shipping only - prices stay locked)
  useEffect(() => {
    if (cart.length === 0) {
      setPricingPreview(null);
      return;
    }

    const fetchPricing = async () => {
      setLoadingPreview(true);
      try {
        const response = await fetch('/api/portal/quote-pricing-static', {
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
        console.error('[StaticQuotePortal] Failed to fetch pricing:', error);
      } finally {
        setLoadingPreview(false);
      }
    };

    const timeoutId = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timeoutId);
  }, [cart, token]);

  const updateQuantity = (productCode: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    if (newQuantity === 0) {
      setCart(cart.filter(item => item.consumable_code !== productCode));
    } else {
      setCart(cart.map(item =>
        item.consumable_code === productCode
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Test Mode Banner */}
      {isTest && (
        <div className="bg-yellow-500 text-white py-2 px-4 text-center font-[600]">
          ⚠️ TEST MODE - This is an internal preview link
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-6 py-12">
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
        <h1 className="text-[56px] font-[800] text-[#0a0a0a] mb-8 tracking-[-0.04em] leading-[1.1] text-center">
          {company.company_name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Product List */}
          <div className="col-span-1 md:col-span-8 space-y-4">
            {cart.map((item) => {
              const previewItem = pricingPreview?.line_items.find(li => li.product_code === item.consumable_code);
              const displayPrice = previewItem?.unit_price || item.price;
              const lineTotal = previewItem?.line_total || (displayPrice * item.quantity);

              return (
                <div
                  key={item.consumable_code}
                  className="bg-white rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] flex gap-6"
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
                        <div className="text-[18px] font-[700] text-[#0a0a0a]">
                          £{displayPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="text-[24px] font-[800] text-[#0a0a0a]">
                      £{lineTotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => updateQuantity(item.consumable_code, 0)}
                      className="text-[14px] text-red-600 hover:text-red-700 font-[600]"
                    >
                      Remove
                    </button>
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
                  // Calculate original total (before any discounts)
                  const originalTotal = pricingPreview?.line_items.reduce((sum, item) => {
                    const originalItem = lineItems.find(li => li.product_code === item.product_code);
                    const originalPrice = originalItem?.unit_price || item.unit_price;
                    return sum + (originalPrice * item.quantity);
                  }, 0) || 0;

                  const subtotal = pricingPreview?.subtotal || 0;
                  const volumeSavings = originalTotal - subtotal;

                  return (
                    <>
                      <div className="flex justify-between text-[15px]">
                        <span className="text-[#666]">Total</span>
                        <span className="font-[600]">£{originalTotal.toFixed(2)}</span>
                      </div>

                      {volumeSavings > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-green-600">Volume Savings</span>
                          <span className="font-[600] text-green-600">-£{volumeSavings.toFixed(2)}</span>
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

              {/* Address Details Section */}
              <div className="mb-6 pb-6 border-t border-gray-200 pt-6">
                <h3 className="text-[16px] font-[700] text-[#0a0a0a] mb-4">Delivery & Billing Details</h3>

                {/* Billing Address */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-[600] text-[#666]">Billing Address</span>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="text-[12px] text-blue-600 hover:text-blue-700 font-[600]"
                    >
                      Edit
                    </button>
                  </div>
                  {company.billing_address_line_1 ? (
                    <div className="text-[13px] text-[#0a0a0a] leading-relaxed">
                      <div>{company.billing_address_line_1}</div>
                      {company.billing_address_line_2 && <div>{company.billing_address_line_2}</div>}
                      <div>{company.billing_city}{company.billing_state_province ? `, ${company.billing_state_province}` : ''}</div>
                      <div>{company.billing_postal_code}</div>
                      <div>{company.billing_country}</div>
                    </div>
                  ) : (
                    <div className="text-[13px] text-red-600 italic">
                      No billing address - <button onClick={() => setShowAddressModal(true)} className="underline font-[600]">Add now</button>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-[600] text-[#666]">Shipping Address</span>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="text-[12px] text-blue-600 hover:text-blue-700 font-[600]"
                    >
                      Edit
                    </button>
                  </div>
                  {shippingAddress ? (
                    <div className="text-[13px] text-[#0a0a0a] leading-relaxed">
                      <div>{shippingAddress.address_line_1}</div>
                      {shippingAddress.address_line_2 && <div>{shippingAddress.address_line_2}</div>}
                      <div>{shippingAddress.city}{shippingAddress.state_province ? `, ${shippingAddress.state_province}` : ''}</div>
                      <div>{shippingAddress.postal_code}</div>
                      <div>{shippingAddress.country}</div>
                    </div>
                  ) : (
                    <div className="text-[13px] text-red-600 italic">
                      No shipping address - <button onClick={() => setShowAddressModal(true)} className="underline font-[600]">Add now</button>
                    </div>
                  )}
                </div>

                {/* VAT Number */}
                {company.vat_number && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-[600] text-[#666]">VAT Number</span>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="text-[12px] text-blue-600 hover:text-blue-700 font-[600]"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-[13px] text-[#0a0a0a]">{company.vat_number}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                disabled={cart.length === 0 || loadingPreview}
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
          console.log('[StaticQuotePortal] Invoice created:', orderId);
        }}
        token={token}
        pricingPreview={pricingPreview}
        quoteType="static"
      />

      {/* Address Collection/Edit Modal */}
      <AddressCollectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        companyId={company.company_id}
        companyName={company.company_name}
        onSuccess={() => {
          setShowAddressModal(false);
          // Refresh the page to show updated addresses
          window.location.reload();
        }}
      />
    </div>
  );
}
