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
  tier: string;
}

export default function DistributorDashboard({
  distributor,
  invoices,
  products,
  tier,
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
  const [activeTab, setActiveTab] = useState<'tools' | 'consumables'>('tools');
  const [pricingPreview, setPricingPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  // Fetch pricing preview whenever cart or selected address changes
  useEffect(() => {
    const fetchPricingPreview = async () => {
      if (cart.size === 0) {
        setPricingPreview(null);
        return;
      }

      setLoadingPreview(true);
      try {
        const items = Array.from(cart.entries()).map(([product_code, quantity]) => ({
          product_code,
          quantity,
        }));

        const response = await fetch('/api/distributor/pricing-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            shipping_address_id: selectedAddressId,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setPricingPreview(data.preview);
        }
      } catch (error) {
        console.error('Failed to fetch pricing preview:', error);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPricingPreview();
  }, [cart, selectedAddressId]);

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

  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!selectedAddressId) {
      alert('Please select a shipping address before placing your order.');
      return;
    }

    // CRITICAL: Verify billing address exists before submitting
    if (!billingAddress || !billingAddress.billing_address_line_1) {
      alert('Your company must have a billing address before placing orders. Please contact support.');
      return;
    }

    // CRITICAL: Verify selected shipping address is complete
    const selectedAddress = shippingAddresses.find(addr => addr.address_id === selectedAddressId);
    if (!selectedAddress || !selectedAddress.address_line_1 || !selectedAddress.city || !selectedAddress.postal_code || !selectedAddress.country) {
      alert('The selected shipping address is incomplete. Please update it with all required fields.');
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const response = await fetch('/api/distributor/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product_code: item.product.product_code,
            description: item.product.description,
            quantity: item.quantity,
            unit_price: item.product.price,
          })),
          shipping_address_id: selectedAddressId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create order');
      }

      alert('Order placed successfully! Invoice has been sent via email.');
      router.refresh();
      setCart(new Map());
      setPricingPreview(null);
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert(`Failed to submit order: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderProductCard = (product: Product) => {
    const currentQty = cart.get(product.product_code) || 0;

    return (
      <div
        key={product.product_code}
        className="flex items-center gap-4 p-4 rounded-[12px] border-2 border-blue-200 hover:border-blue-400 transition-all bg-white"
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(product.product_code, Math.max(0, currentQty - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-bold transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min="0"
            value={currentQty}
            onChange={(e) => updateQuantity(product.product_code, parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-2 border border-[#e8e8e8] rounded-[8px] text-center font-[600] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            onClick={() => updateQuantity(product.product_code, currentQty + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-bold transition-colors"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column - Product Catalog */}
      <div className="col-span-7 space-y-4">
        {/* Company Branding */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
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

        {/* Product Tabs */}
        <div className="bg-white rounded-[16px] shadow-sm border-2 border-blue-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-[#e8e8e8]">
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-6 py-4 text-[16px] font-[600] tracking-[-0.01em] transition-colors ${
                activeTab === 'tools'
                  ? 'text-[#1e40af] bg-gradient-to-r from-blue-50/50 to-transparent border-b-2 border-[#1e40af]'
                  : 'text-[#64748b] hover:text-[#1e40af] hover:bg-blue-50/30'
              }`}
            >
              Tools
              <span className="ml-2 text-[12px] text-[#64748b]">
                ({Object.values(groupedProducts.tools).flat().length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('consumables')}
              className={`flex-1 px-6 py-4 text-[16px] font-[600] tracking-[-0.01em] transition-colors ${
                activeTab === 'consumables'
                  ? 'text-[#1e40af] bg-gradient-to-r from-blue-50/50 to-transparent border-b-2 border-[#1e40af]'
                  : 'text-[#64748b] hover:text-[#1e40af] hover:bg-blue-50/30'
              }`}
            >
              Consumables
              <span className="ml-2 text-[12px] text-[#64748b]">
                ({Object.values(groupedProducts.consumables).flat().length})
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tools' && Object.keys(groupedProducts.tools).length > 0 && (
              <div className="space-y-6">
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
            )}

            {activeTab === 'tools' && Object.keys(groupedProducts.tools).length === 0 && (
              <div className="text-center py-12">
                <p className="text-[14px] text-[#64748b]">No tools available</p>
              </div>
            )}

            {activeTab === 'consumables' && Object.keys(groupedProducts.consumables).length > 0 && (
              <div className="space-y-6">
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
            )}

            {activeTab === 'consumables' && Object.keys(groupedProducts.consumables).length === 0 && (
              <div className="text-center py-12">
                <p className="text-[14px] text-[#64748b]">No consumables available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Cart & Invoices */}
      <div className="col-span-5 space-y-6">
        {/* Cart Summary */}
        <div className="bg-[#0a0a0a] rounded-[20px] p-8 text-white shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
          <div className="mb-6">
            <h2 className="text-[20px] font-[700] tracking-[-0.01em]">Order Summary</h2>
            <p className="text-[13px] text-gray-400 mt-1 font-[500]">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-gray-400 font-[400]">No items in cart</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.product.product_code}
                    className="p-3 bg-white/5 rounded-[10px] border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-[600] text-white leading-tight">
                          {item.product.description}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          {item.product.product_code}
                        </div>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.product.product_code, 0)}
                        className="ml-2 text-red-400 hover:text-red-300 flex-shrink-0"
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
                      <div className="text-[11px] text-gray-400 font-[500]">
                        {item.quantity} × £{item.product.price.toFixed(2)}
                      </div>
                      <div className="text-[14px] font-[700] text-white">
                        £{(item.quantity * item.product.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-white/10 pt-4">
                {loadingPreview ? (
                  <div className="text-center py-4 text-gray-400 text-sm">Calculating...</div>
                ) : pricingPreview ? (
                  <div className="space-y-3 mb-4">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-[#999] font-[500]">Subtotal</span>
                      <span className="font-[700] text-[17px] tracking-[-0.01em]">£{pricingPreview.subtotal.toFixed(2)}</span>
                    </div>

                    {/* Shipping */}
                    {pricingPreview.shipping !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-[15px] text-[#999] font-[500]">Shipping</span>
                        <span className="font-[600] text-[16px]">{pricingPreview.shipping === 0 ? 'FREE' : `£${pricingPreview.shipping.toFixed(2)}`}</span>
                      </div>
                    )}

                    {/* VAT */}
                    {pricingPreview.vat_amount !== undefined && (
                      <div className="flex justify-between items-center pb-3 border-b border-[#2a2a2a]">
                        <span className="text-[15px] text-[#999] font-[500]">
                          VAT {pricingPreview.vat_rate > 0 && `(${(pricingPreview.vat_rate * 100).toFixed(0)}%)`}
                          {pricingPreview.vat_exempt_reason && ` - ${pricingPreview.vat_exempt_reason}`}
                        </span>
                        <span className="font-[600] text-[16px]">£{pricingPreview.vat_amount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Final Total */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[17px] font-[700] text-white">Total</span>
                      <span className="text-[28px] font-[800] text-[#16a34a] tracking-[-0.02em]">
                        £{pricingPreview.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[15px] font-[700] text-white">Subtotal</div>
                    <div className="text-[28px] font-[800] text-[#16a34a] tracking-[-0.02em]">
                      £{subtotal.toFixed(2)}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || cartItems.length === 0 || !selectedAddressId}
                  className="w-full py-4 bg-[#16a34a] text-white rounded-[10px] font-[700] text-[15px] tracking-[-0.01em] hover:bg-[#15803d] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting Order...' : 'Place Order'}
                </button>
              </div>
            </>
          )}
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
        onSuccess={handleAddressSaved}
      />

      {/* Order Confirmation Modal */}
      {showConfirmModal && pricingPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">Confirm Order</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                You're about to place an order for <strong>{cartItems.length} item(s)</strong>.
              </p>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">£{pricingPreview.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{pricingPreview.shipping === 0 ? 'FREE' : `£${pricingPreview.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT</span>
                  <span className="font-medium">£{pricingPreview.vat_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-green-600">£{pricingPreview.total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                A Stripe invoice will be created and sent to your email. Payment terms: Net 30 days.
              </p>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
