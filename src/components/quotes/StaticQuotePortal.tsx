/**
 * Static Quote Portal
 * Customer-facing portal for quotes with pre-negotiated pricing
 * Layout matches PortalPage for consistent branding
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { InvoiceRequestModal } from '../InvoiceRequestModal';
import EditBillingAddressModal from '../address/EditBillingAddressModal';
import EditVATNumberModal from '../address/EditVATNumberModal';
import VATNumberDisplay from '../address/VATNumberDisplay';
import AddDeliveryAddressModal from '../address/AddDeliveryAddressModal';
import EditDeliveryAddressModal from '../address/EditDeliveryAddressModal';

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
  readOnly?: boolean;
  previewMode?: 'admin' | 'original';
}

export function StaticQuotePortal({
  quote,
  lineItems,
  company,
  contact,
  token,
  isTest,
  readOnly = false,
  previewMode,
}: StaticQuotePortalProps) {
  const [itemQuantities, setItemQuantities] = useState<Map<string, number>>(new Map());
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // New modal states
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showVATModal, setShowVATModal] = useState(false);
  const [showAddDeliveryModal, setShowAddDeliveryModal] = useState(false);
  const [showEditDeliveryModal, setShowEditDeliveryModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

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
        console.error('[StaticQuotePortal] Failed to fetch shipping addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [token]);

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
        const response = await fetch('/api/portal/quote-pricing-static', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, items: itemsWithQty }),
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

  // Success handlers for new modals
  const handleBillingSaved = async () => {
    setShowBillingModal(false);
    // Billing changes don't require refetch for quotes
  };

  const handleVATSaved = async () => {
    setShowVATModal(false);
    // VAT changes don't require refetch for quotes
  };

  const handleDeliverySaved = async () => {
    setShowAddDeliveryModal(false);
    setShowEditDeliveryModal(false);
    // Refetch delivery addresses
    try {
      const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      if (data.success && data.addresses) {
        setShippingAddresses(data.addresses);
      }
    } catch (error) {
      console.error('[StaticQuotePortal] Failed to refetch delivery addresses:', error);
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
                    {isToolQuote ? 'Tooling quotation' : 'Consumables quotation'}
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
                        <button onClick={() => setShowBillingModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">Edit</button>
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
                        <p className="text-[11px] text-red-600 italic">No billing address - <button onClick={() => setShowBillingModal(true)} className="underline font-[600]">Add now</button></p>
                      </div>
                    )}
                  </div>

                  {/* VAT Number */}
                  {!loadingAddresses && company && (
                    <VATNumberDisplay
                      vatNumber={company.vat_number}
                      onEdit={() => setShowVATModal(true)}
                    />
                  )}

                  {/* Delivery Addresses */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider">Delivery Addresses</div>
                      {!readOnly && (
                        <button onClick={() => setShowAddDeliveryModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">+ Add</button>
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
                            <div className="flex items-start gap-2">
                              <input
                                type="radio"
                                checked={selectedAddressId === addr.address_id}
                                onChange={() => !readOnly && setSelectedAddressId(addr.address_id)}
                                className="mt-0.5 text-blue-600"
                                disabled={readOnly}
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
                              </div>
                              {!readOnly && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAddressId(addr.address_id);
                                    setShowEditDeliveryModal(true);
                                  }}
                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]"
                                >
                                  Edit
                                </button>
                              )}
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
                    const lineTotal = item.unit_price * currentQty;

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
                            <div className="text-[18px] font-[700] text-[#0a0a0a]">
                              £{item.unit_price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-[20px] font-[800] text-[#0a0a0a]">
                            £{lineTotal.toFixed(2)}
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[13px] text-[#1e293b] font-[500]">Qty:</label>
                            {readOnly ? (
                              <div className="w-20 px-3 py-2 text-center font-[600]">{currentQty}</div>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                value={currentQty}
                                onChange={(e) => updateQuantity(item.product_code, parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2 border border-[#e8e8e8] rounded-[8px] text-center font-[600] focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] outline-none"
                              />
                            )}
                          </div>
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

                {/* TOOL QUOTES: Selected Tools Cart */}
                {isToolQuote && (() => {
                  const toolItems = Array.from(itemQuantities.entries())
                    .filter(([code, qty]) => qty > 0);

                  if (toolItems.length === 0) return null;

                  return (
                    <div className="bg-white rounded-[16px] p-5 shadow-sm border-2 border-blue-200">
                      <div className="mb-4">
                        <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Selected Tools</h3>
                        <p className="text-[11px] text-[#334155] mt-1">{toolItems.length} tool{toolItems.length !== 1 ? 's' : ''} selected</p>
                      </div>

                      <div className="space-y-3">
                        {toolItems.map(([code, qty]) => {
                          const item = lineItems.find(i => i.product_code === code);
                          const lineTotal = (item?.unit_price || 0) * qty;

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
                                    <span className="font-[600] text-[#3b82f6]">£{(item?.unit_price || 0).toFixed(2)}</span>
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

                {/* CONSUMABLE QUOTES: Standard Selected Products */}
                {!isToolQuote && (() => {
                  const standardItems = Array.from(itemQuantities.entries())
                    .filter(([code, qty]) => {
                      const item = lineItems.find(i => i.product_code === code);
                      return item?.pricing_tier === 'standard' && qty > 0;
                    });

                  if (standardItems.length === 0) return null;

                  return (
                    <div className="bg-white rounded-[16px] p-5 shadow-sm border-2 border-green-200">
                      <div className="mb-4">
                        <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Standard Products</h3>
                        <p className="text-[11px] text-[#334155] mt-1">{standardItems.length} item{standardItems.length !== 1 ? 's' : ''} selected</p>
                      </div>

                      <div className="space-y-3">
                        {standardItems.map(([code, qty]) => {
                          const item = lineItems.find(i => i.product_code === code);
                          const lineTotal = (item?.unit_price || 0) * qty;

                          return (
                            <div key={code} className="p-3 bg-green-50/50 rounded-[10px] border border-green-200">
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
                                    <span className="font-[600] text-[#16a34a]">£{(item?.unit_price || 0).toFixed(2)}</span>
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

                {/* CONSUMABLE QUOTES: Premium Selected Products */}
                {!isToolQuote && (() => {
                  const premiumItems = Array.from(itemQuantities.entries())
                    .filter(([code, qty]) => {
                      const item = lineItems.find(i => i.product_code === code);
                      return item?.pricing_tier === 'premium' && qty > 0;
                    });

                  if (premiumItems.length === 0) return null;

                  return (
                    <div className="bg-white rounded-[16px] p-5 shadow-sm border-2 border-purple-200">
                      <div className="mb-4">
                        <h3 className="text-[15px] font-[700] text-[#0a0a0a] tracking-tight">Premium Products</h3>
                        <p className="text-[11px] text-[#334155] mt-1">{premiumItems.length} item{premiumItems.length !== 1 ? 's' : ''} selected</p>
                      </div>

                      <div className="space-y-3">
                        {premiumItems.map(([code, qty]) => {
                          const item = lineItems.find(i => i.product_code === code);
                          const lineTotal = (item?.unit_price || 0) * qty;

                          return (
                            <div key={code} className="p-3 bg-purple-50/50 rounded-[10px] border border-purple-200">
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
                                    <span className="font-[600] text-[#a855f7]">£{(item?.unit_price || 0).toFixed(2)}</span>
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

                {/* Order Summary Card */}
                {pricingPreview && pricingPreview.line_items.length > 0 && (
                  <div className="bg-[#0a0a0a] rounded-[20px] p-8 text-white shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
                    <div className="text-[12px] font-[700] text-[#999] uppercase tracking-[0.05em] mb-6">Order Summary</div>
                    <div className="space-y-4">
                      {/* Subtotal */}
                      <div className="flex justify-between items-center">
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
                        <div className="flex justify-between items-center pb-4 border-b border-[#2a2a2a]">
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

      {/* Billing Address Modal */}
      <EditBillingAddressModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        companyId={company.company_id}
        token={token}
        onSuccess={handleBillingSaved}
      />

      {/* VAT Number Modal */}
      <EditVATNumberModal
        isOpen={showVATModal}
        onClose={() => setShowVATModal(false)}
        companyId={company.company_id}
        token={token}
        onSuccess={handleVATSaved}
      />

      {/* Add Delivery Address Modal */}
      <AddDeliveryAddressModal
        isOpen={showAddDeliveryModal}
        onClose={() => setShowAddDeliveryModal(false)}
        companyId={company.company_id}
        token={token}
        onSuccess={handleDeliverySaved}
      />

      {/* Edit Delivery Address Modal */}
      {editingAddressId && (
        <EditDeliveryAddressModal
          isOpen={showEditDeliveryModal}
          onClose={() => setShowEditDeliveryModal(false)}
          addressId={editingAddressId}
          companyId={company.company_id}
          token={token}
          onSuccess={handleDeliverySaved}
        />
      )}

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
          console.log('[StaticQuotePortal] Invoice created:', orderId);
        }}
        token={token}
        pricingPreview={pricingPreview}
        quoteType="static"
        selectedAddressId={selectedAddressId}
      />
    </>
  );
}
