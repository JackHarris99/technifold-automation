'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CartItem } from '@/types';
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

  // Handler for when address is successfully saved
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
      price: item.unit_price || 0, // Handle null prices
      quantity: item.quantity,
      category: item.category,
      image_url: item.image_url,
    }));
    setCart(initialCart);
  }, [lineItems]);

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
        console.error('[QuotePortal] Failed to fetch pricing:', error);
      } finally {
        setLoadingPreview(false);
      }
    };

    const timeoutId = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timeoutId);
  }, [cart, token]);

  const updateQuantity = (consumableCode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove from cart
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

  const removeFromCart = (consumableCode: string) => {
    setCart(prev => prev.filter(item => item.consumable_code !== consumableCode));
  };

  const clearCart = () => {
    setCart([]);
  };

  const expiryDate = quote.expires_at ? new Date(quote.expires_at) : null;
  const isExpired = expiryDate && expiryDate < new Date();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Technifold" width={140} height={32} />
              <div className="h-6 w-px bg-[#d1d5db]"></div>
              <div>
                <div className="text-[14px] font-[600] text-[#111827]">{company.company_name}</div>
                {contact && (
                  <div className="text-[12px] text-[#6b7280]">{contact.full_name}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[14px] font-[600] text-[#111827]">Quote #{quote.quote_id.slice(0, 8)}</div>
              {expiryDate && (
                <div className={`text-[12px] ${isExpired ? 'text-red-600' : 'text-[#6b7280]'}`}>
                  {isExpired ? 'Expired' : `Expires ${expiryDate.toLocaleDateString()}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Quote Info */}
          <div className="col-span-8">
            <div className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
              <h1 className="text-[24px] font-[700] text-[#0a0a0a] mb-2">
                Your Custom Quote
              </h1>
              <p className="text-[14px] text-[#6b7280] mb-6">
                Review your quote items and quantities. When ready, proceed to checkout to complete your order.
              </p>

              {isExpired && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-semibold text-red-800">Quote Expired</div>
                  <div className="text-sm text-red-600 mt-1">
                    This quote has expired. Please contact us for an updated quote.
                  </div>
                </div>
              )}

              {quote.notes && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-semibold text-blue-800">Notes from Sales Team</div>
                  <div className="text-sm text-blue-700 mt-1">{quote.notes}</div>
                </div>
              )}

              <div className="space-y-4">
                {cart.map(item => (
                  <div
                    key={item.consumable_code}
                    className="flex items-center gap-4 p-4 border border-[#e5e7eb] rounded-[14px] hover:border-[#d1d5db] transition-colors"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.description}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-[600] text-[#111827]">{item.description}</div>
                      <div className="text-[12px] text-[#6b7280] mt-1">
                        {item.consumable_code}
                        {item.category && ` • ${item.category}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.consumable_code, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-lg font-[600] text-[#374151] transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.consumable_code, parseInt(e.target.value) || 1)}
                          className="w-16 text-center border border-[#d1d5db] rounded-lg py-1 font-[600] text-[#111827]"
                        />
                        <button
                          onClick={() => updateQuantity(item.consumable_code, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-lg font-[600] text-[#374151] transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[16px] font-[700] text-[#111827] w-24 text-right">
                        £{((item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length === 0 && (
                <div className="text-center py-12 text-[#9ca3af]">
                  <div className="text-[48px] mb-2">📦</div>
                  <div className="text-[14px] font-[500]">No items in quote</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Cart Bar */}
          <div className="col-span-4">
            <CartBar
              cart={cart}
              pricingPreview={pricingPreview}
              loadingPreview={loadingPreview}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={() => setIsInvoiceModalOpen(true)}
              onClearCart={clearCart}
            />
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
    </div>
  );
}
