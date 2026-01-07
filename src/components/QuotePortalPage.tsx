'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CartItem } from '@/types';
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
  city: string;
  country: string;
}

interface QuotePortalPageProps {
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

export function QuotePortalPage({ quote, lineItems, company, contact, token, isTest }: QuotePortalPageProps) {
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
        } else if (!isTest) {
          setShowAddressModal(true);
        }
      } catch (error) {
        console.error('[QuotePortal] Failed to fetch shipping address:', error);
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
      console.error('[QuotePortal] Failed to refetch shipping address:', error);
    }
  };

  // Pre-populate cart with quote items on mount
  useEffect(() => {
    const initialCart: CartItem[] = lineItems.map(item => ({
      consumable_code: item.product_code,
      description: item.description,
      price: item.unit_price || 0,
      quantity: item.quantity,
      category: item.category,
      image_url: item.image_url,
    }));
    setCart(initialCart);
  }, [lineItems]);

  // Fetch pricing preview when cart changes (ONLY for consumables, not tools)
  useEffect(() => {
    if (cart.length === 0) {
      setPricingPreview(null);
      return;
    }

    // For TOOLS quotes, calculate pricing directly from cart (no tiered pricing)
    if (quote.quote_type === 'tool_static') {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setPricingPreview({
        line_items: cart.map(item => ({
          product_code: item.consumable_code,
          description: item.description,
          quantity: item.quantity,
          base_price: item.price || 0,
          unit_price: item.price || 0,
          line_total: (item.price || 0) * item.quantity,
          discount_applied: null,
          image_url: item.image_url || null,
          currency: 'GBP',
        })),
        subtotal,
        total: subtotal, // Tools don't have VAT/shipping calculated here
        total_savings: 0,
        currency: 'GBP',
        validation_errors: [],
      });
      return;
    }

    // For CONSUMABLES quotes, fetch tiered pricing from API
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
        console.error('[QuotePortal] Failed to fetch pricing:', error);
      } finally {
        setLoadingPreview(false);
      }
    };

    const timeoutId = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timeoutId);
  }, [cart, token, quote.quote_type]);

  const updateQuantity = (consumableCode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.consumable_code !== consumableCode));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.consumable_code === consumableCode
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const expiryDate = quote.expires_at ? new Date(quote.expires_at) : null;
  const isExpired = expiryDate && expiryDate < new Date();

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
        {/* Top Branding Bar - 3 Logos */}
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
                  {company.company_name}
                </h1>
                <p className="text-[19px] text-[#666] font-[400] tracking-[-0.01em]">
                  Your custom quote - Quote #{quote.quote_id.slice(0, 8)}
                </p>
              </div>
              {contact && (
                <div className="text-right">
                  <p className="text-[14px] text-[#999] font-[500]">Quote for,</p>
                  <p className="text-[21px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">{contact.full_name}</p>
                  <p className="text-[14px] text-[#666] mt-1">{contact.email}</p>
                  {expiryDate && (
                    <p className={`text-[14px] mt-2 font-[600] ${isExpired ? 'text-red-600' : 'text-[#16a34a]'}`}>
                      {isExpired ? 'Expired' : `Valid until ${expiryDate.toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isExpired && (
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-[20px]">
                <div className="text-[18px] font-[700] text-red-800 mb-2">Quote Expired</div>
                <div className="text-[15px] text-red-600">
                  This quote has expired. Please contact us for an updated quote.
                </div>
              </div>
            )}

            {quote.notes && !isExpired && (
              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-[20px]">
                <div className="text-[16px] font-[700] text-blue-800 mb-2">Notes from our sales team</div>
                <div className="text-[15px] text-blue-700">{quote.notes}</div>
              </div>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="col-span-8 space-y-6">
              <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="space-y-6">
                  {cart.map(item => (
                    <div
                      key={item.consumable_code}
                      className="flex items-start gap-6 p-6 border-2 border-[#e8e8e8] rounded-[16px] hover:border-[#d1d5db] transition-colors"
                    >
                      {/* Product Image */}
                      {item.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.description}
                            className="w-40 h-40 object-cover rounded-[12px]"
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-[22px] font-[700] text-[#0a0a0a] mb-2 tracking-[-0.01em]">
                          {item.description}
                        </h3>
                        <p className="text-[14px] text-[#999] font-mono mb-4">
                          {item.consumable_code}
                          {item.category && ` • ${item.category}`}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-6">
                          <span className="text-[15px] text-[#666] font-[600]">Quantity:</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.consumable_code, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-[10px] font-[700] text-[18px] text-[#374151] transition-colors"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.consumable_code, parseInt(e.target.value) || 1)}
                              className="w-20 text-center border-2 border-[#d1d5db] rounded-[10px] py-2 font-[700] text-[18px] text-[#111827]"
                            />
                            <button
                              onClick={() => updateQuantity(item.consumable_code, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-[10px] font-[700] text-[18px] text-[#374151] transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-[32px] font-[800] text-[#0a0a0a] tracking-[-0.02em]">
                          £{((item.price || 0) * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[14px] text-[#999] mt-1">
                          £{(item.price || 0).toFixed(2)} per unit
                        </div>
                      </div>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className="text-center py-16 text-[#9ca3af]">
                      <div className="text-[64px] mb-4">📦</div>
                      <div className="text-[18px] font-[600]">No items in quote</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Pricing Summary */}
            <div className="col-span-4">
              <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] sticky top-6">
                <div className="text-[12px] font-[700] text-[#666] uppercase tracking-[0.05em] mb-6">Your Quote</div>

                {cart.length > 0 && pricingPreview && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[15px] text-[#999] font-[500]">Subtotal</span>
                        <span className="font-[600] text-[16px]">£{(pricingPreview.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {pricingPreview.shipping !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-[15px] text-[#999] font-[500]">Shipping</span>
                          <span className="font-[600] text-[16px]">
                            {pricingPreview.shipping === 0 ? 'FREE' : `£${(pricingPreview.shipping || 0).toFixed(2)}`}
                          </span>
                        </div>
                      )}
                      {pricingPreview.vat_amount !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-[15px] text-[#999] font-[500]">VAT</span>
                          <span className="font-[600] text-[16px]">£{(pricingPreview.vat_amount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {pricingPreview.total !== undefined && (
                        <div className="flex justify-between items-center pt-4 border-t border-[#2a2a2a]">
                          <span className="text-[17px] font-[700]">Total</span>
                          <span className="font-[800] text-[28px] tracking-[-0.02em] text-[#16a34a]">£{(pricingPreview.total || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {pricingPreview.total_savings !== undefined && pricingPreview.total_savings > 0 && (
                        <div className="mt-4 p-4 bg-[#16a34a]/10 rounded-[12px] border border-[#16a34a]/20">
                          <div className="text-[13px] text-[#16a34a] font-[600]">
                            Saving £{pricingPreview.total_savings.toFixed(2)} with tiered pricing!
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setIsInvoiceModalOpen(true)}
                      disabled={cart.length === 0 || isExpired}
                      className="w-full mt-6 py-4 bg-[#16a34a] text-white rounded-[14px] font-[700] text-[15px] tracking-[-0.01em] hover:bg-[#15803d] transition-all shadow-[0_4px_12px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Request Invoice ({cart.length} items)
                    </button>
                  </div>
                )}

                {cart.length === 0 && (
                  <div className="text-center py-8 text-[#9ca3af]">
                    <p className="text-sm">No items in quote</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Request Modal */}
      <InvoiceRequestModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        cart={cart}
        pricingPreview={pricingPreview}
        token={token}
        companyName={company.company_name}
        contactName={contact?.full_name}
        shippingAddress={shippingAddress}
      />

      {/* Address Collection Modal */}
      <PortalAddressCollectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        companyId={company.company_id}
        companyName={company.company_name}
        token={token}
        onSuccess={handleAddressSaved}
      />
    </>
  );
}
