/**
 * Distributor Dashboard Component
 * Professional product catalog with images, categories, and cart
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PortalAddressCollectionModal from '../portals/PortalAddressCollectionModal';

interface Product {
  product_code: string;
  description: string;
  price: number;
  category: string | null;
  type: string;
  currency: string;
  image_url: string | null;
}

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  status: string | null;
}

interface DistributorDashboardProps {
  distributor: {
    company_id: string;
    company_name: string;
  };
  invoices: Invoice[];
  products: Product[];
}

export default function DistributorDashboard({
  distributor,
  invoices,
  products,
}: DistributorDashboardProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [billingAddress, setBillingAddress] = useState<any>(null);

  // Fetch shipping addresses and billing on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        // Fetch shipping addresses
        const shippingResponse = await fetch(`/api/distributor/shipping-addresses`);
        const shippingData = await shippingResponse.json();
        if (shippingData.success && shippingData.addresses) {
          setShippingAddresses(shippingData.addresses);
          const defaultAddress = shippingData.addresses.find((addr: any) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.address_id);
          }
        }

        // Fetch billing address from company
        const billingResponse = await fetch(`/api/distributor/company-details`);
        const billingData = await billingResponse.json();
        if (billingData.success && billingData.company) {
          setBillingAddress(billingData.company);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  // Group products by type and category
  const groupedProducts = useMemo(() => {
    const tools: Record<string, Product[]> = {};
    const consumables: Record<string, Product[]> = {};

    products.forEach((product) => {
      const category = product.category || 'Uncategorized';

      if (product.type === 'tool') {
        if (!tools[category]) tools[category] = [];
        tools[category].push(product);
      } else {
        if (!consumables[category]) consumables[category] = [];
        consumables[category].push(product);
      }
    });

    return { tools, consumables };
  }, [products]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    return products
      .filter(p =>
        p.description.toLowerCase().includes(term) ||
        p.product_code.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      )
      .slice(0, 10);
  }, [searchTerm, products]);

  const updateQuantity = (productCode: string, quantity: number) => {
    const newCart = new Map(cart);
    if (quantity <= 0) {
      newCart.delete(productCode);
    } else {
      newCart.set(productCode, quantity);
    }
    setCart(newCart);
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

  const cartItems = Array.from(cart.entries())
    .map(([code, qty]) => {
      const product = products.find((p) => p.product_code === code);
      return product ? { product, quantity: qty } : null;
    })
    .filter((item): item is { product: Product; quantity: number } => item !== null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleAddressSaved = async () => {
    setShowAddressModal(false);
    try {
      // Refetch shipping addresses
      const shippingResponse = await fetch(`/api/distributor/shipping-addresses`);
      const shippingData = await shippingResponse.json();
      if (shippingData.success && shippingData.addresses) {
        setShippingAddresses(shippingData.addresses);
        const defaultAddress = shippingData.addresses.find((addr: any) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.address_id);
        }
      }

      // Refetch billing address
      const billingResponse = await fetch(`/api/distributor/company-details`);
      const billingData = await billingResponse.json();
      if (billingData.success && billingData.company) {
        setBillingAddress(billingData.company);
      }
    } catch (error) {
      console.error('Failed to refetch addresses:', error);
    }
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/distributor/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product_code: item.product.product_code,
            quantity: item.quantity,
            unit_price: item.product.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      router.refresh();
      setCart(new Map());
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderProductCard = (product: Product) => {
    const currentQty = cart.get(product.product_code) || 0;

    return (
      <div
        key={product.product_code}
        className="flex items-center gap-4 p-4 rounded-[12px] border border-[#e8e8e8] hover:border-[#1e40af] transition-all bg-white"
      >
        <div className="relative w-20 h-20 bg-[#f9fafb] rounded-[8px] flex-shrink-0 overflow-hidden">
          <Image
            src={product.image_url || `/product_images/${product.product_code}.jpg`}
            alt={product.description}
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
          <div className="font-[600] text-[15px] text-[#0a0a0a]">{product.description}</div>
          <div className="text-[13px] text-[#1e293b] mt-1">{product.product_code}</div>
          <div className="mt-2">
            <div className="text-[18px] font-[700] text-[#0a0a0a]">
              £{product.price.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[13px] text-[#1e293b] font-[500]">Qty:</label>
          <input
            type="number"
            min="0"
            value={currentQty}
            onChange={(e) => updateQuantity(product.product_code, parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-2 border border-[#e8e8e8] rounded-[8px] text-center font-[600] focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] outline-none"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column - Product Catalog */}
      <div className="col-span-7 space-y-4">
        {/* Address Collection */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <div className="mb-6">
            <h2 className="text-[20px] font-[600] text-[#1e40af] mb-1 tracking-[-0.01em]">
              {distributor.company_name}
            </h2>
            <p className="text-[13px] text-[#334155] font-[400]">
              Company and delivery information
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Billing Address */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider">Billing Address</div>
                {billingAddress && (
                  <button onClick={() => setShowAddressModal(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-[600]">Edit</button>
                )}
              </div>
              {loadingAddresses ? (
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
              {loadingAddresses ? (
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

        {/* Search */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6 relative">
          <input
            type="text"
            placeholder="Search products by name, code, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0a0a0a] font-[500] focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all"
          />

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-[calc(100%+0.5rem)] left-6 right-6 bg-white rounded-[12px] border-2 border-blue-200 shadow-lg z-50 max-h-[400px] overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.product_code}
                  onClick={() => {
                    updateQuantity(product.product_code, (cart.get(product.product_code) || 0) + 1);
                    setSearchTerm('');
                    setShowSearchDropdown(false);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-[#e8e8e8] last:border-0"
                >
                  <div className="relative w-12 h-12 bg-[#f9fafb] rounded-[6px] flex-shrink-0 overflow-hidden">
                    <Image
                      src={product.image_url || `/product_images/${product.product_code}.jpg`}
                      alt={product.description}
                      fill
                      className="object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/product-placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-[600] text-[#0a0a0a] truncate">{product.description}</div>
                    <div className="text-[11px] text-[#475569] font-mono">{product.product_code}</div>
                  </div>
                  <div className="text-[14px] font-[700] text-[#0a0a0a]">£{product.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tools Sections */}
        {Object.keys(groupedProducts.tools).length > 0 && (
          <div className="bg-white rounded-[16px] shadow-sm border-2 border-blue-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-[#e8e8e8]">
              <h2 className="text-[20px] font-[600] text-[#1e40af] tracking-[-0.01em]">Tools</h2>
              <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
                {Object.values(groupedProducts.tools).flat().length} products
              </p>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(groupedProducts.tools).map(([category, categoryProducts]) => (
                <div key={category}>
                  <button
                    onClick={() => toggleSection(`tool-${category}`)}
                    className="w-full flex items-center justify-between mb-3 text-left"
                  >
                    <h3 className="text-[16px] font-[600] text-[#0a0a0a]">{category}</h3>
                    <svg
                      className={`w-5 h-5 text-[#3b82f6] transition-transform ${expandedSections.has(`tool-${category}`) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.has(`tool-${category}`) && (
                    <div className="space-y-3">
                      {categoryProducts.map(renderProductCard)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consumables Sections */}
        {Object.keys(groupedProducts.consumables).length > 0 && (
          <div className="bg-white rounded-[16px] shadow-sm border-2 border-blue-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-[#e8e8e8]">
              <h2 className="text-[20px] font-[600] text-[#1e40af] tracking-[-0.01em]">Consumables</h2>
              <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
                {Object.values(groupedProducts.consumables).flat().length} products
              </p>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(groupedProducts.consumables).map(([category, categoryProducts]) => (
                <div key={category}>
                  <button
                    onClick={() => toggleSection(`consumable-${category}`)}
                    className="w-full flex items-center justify-between mb-3 text-left"
                  >
                    <h3 className="text-[16px] font-[600] text-[#0a0a0a]">{category}</h3>
                    <svg
                      className={`w-5 h-5 text-[#3b82f6] transition-transform ${expandedSections.has(`consumable-${category}`) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.has(`consumable-${category}`) && (
                    <div className="space-y-3">
                      {categoryProducts.map(renderProductCard)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Cart & Invoices */}
      <div className="col-span-5 space-y-6">
        {/* Cart Summary */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50/50 to-transparent border-b border-[#e8e8e8]">
            <h2 className="text-[17px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">Order Summary</h2>
            <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px] text-[#475569] font-[400]">No items in cart</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.product_code}
                      className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-[600] text-[#0a0a0a] leading-tight">
                            {item.product.description}
                          </div>
                          <div className="text-[11px] text-[#475569] font-mono mt-0.5">
                            {item.product.product_code}
                          </div>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.product.product_code, 0)}
                          className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-[#475569] font-[500]">
                          {item.quantity} × £{item.product.price.toFixed(2)}
                        </div>
                        <div className="text-[14px] font-[700] text-[#0a0a0a]">
                          £{(item.quantity * item.product.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-[#e8e8e8] pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[15px] font-[700] text-[#0a0a0a]">Subtotal</div>
                    <div className="text-[24px] font-[800] text-[#15803d] tracking-[-0.02em]">
                      £{subtotal.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || cartItems.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white rounded-[10px] font-[600] text-[14px] tracking-[-0.01em] hover:from-[#14532d] hover:to-[#15803d] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting Order...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50/50 to-transparent border-b border-[#e8e8e8]">
            <h2 className="text-[17px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">Recent Orders</h2>
            <p className="text-[12px] text-[#334155] mt-0.5 font-[500]">
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="p-6 max-h-[400px] overflow-y-auto">
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px] text-[#475569] font-[400]">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.slice(0, 10).map((invoice) => (
                  <div
                    key={invoice.invoice_id}
                    className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-[13px] font-[600] text-[#0a0a0a] font-mono">
                            {invoice.invoice_number}
                          </div>
                          {invoice.status && (
                            <div className={`px-2 py-0.5 rounded-[6px] text-[9px] font-[700] uppercase tracking-wide ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] text-[#475569] font-[500] mt-0.5">
                          {new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="text-[15px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">
                        £{invoice.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <PortalAddressCollectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        companyId={distributor.company_id}
        companyName={distributor.company_name}
        token=""
        onSuccess={handleAddressSaved}
      />
    </div>
  );
}
