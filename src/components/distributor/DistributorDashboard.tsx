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
  price: number; // Distributor's price (discounted)
  base_price: number; // Recommended end user price (full price)
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

interface Order {
  order_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  reviewed_at: string | null;
}

interface BackOrderItem {
  item_id: string;
  product_code: string;
  description: string;
  quantity: number;
  predicted_delivery_date: string | null;
  back_order_notes: string | null;
}

interface DistributorDashboardProps {
  distributor: {
    company_id: string;
    company_name: string;
  };
  invoices: Invoice[];
  orders: Order[];
  backOrderItems: BackOrderItem[];
  products: Product[];
  tier: string;
}

export default function DistributorDashboard({
  distributor,
  invoices,
  orders,
  backOrderItems,
  products,
  tier,
}: DistributorDashboardProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [billingAddress, setBillingAddress] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'consumables'>('tools');
  const [pricingPreview, setPricingPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [orderResult, setOrderResult] = useState<{ order_id: string } | null>(null);
  const [poNumber, setPoNumber] = useState('');

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
  // Get all unique categories for the active tab
  const availableCategories = useMemo(() => {
    const currentProducts = products.filter(p => p.type === activeTab.slice(0, -1)); // 'tools' -> 'tool'
    const categories = new Set(currentProducts.map(p => p.category || 'Uncategorized'));
    return Array.from(categories).sort();
  }, [products, activeTab]);

  // Filtered products based on tab, categories, and search
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.type === activeTab.slice(0, -1)); // 'tools' -> 'tool'

    // Filter by selected categories
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(p => {
        const category = p.category || 'Uncategorized';
        return selectedCategories.has(category);
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.description.toLowerCase().includes(term) ||
        p.product_code.toLowerCase().includes(term) ||
        (p.category || 'Uncategorized').toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [products, activeTab, selectedCategories, searchTerm]);

  const updateQuantity = (productCode: string, quantity: number) => {
    const newCart = new Map(cart);
    if (quantity <= 0) {
      newCart.delete(productCode);
    } else {
      newCart.set(productCode, quantity);
    }
    setCart(newCart);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const clearAllCategories = () => {
    setSelectedCategories(new Set());
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
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    // Address validation removed - addresses are optional
    // Order goes to pending_review and admin can add/verify addresses during approval
    // This allows distributors to submit orders without complete address information

    // Submit order directly (no confirmation modal)
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
          po_number: poNumber || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create order');
      }

      // Show success modal
      setOrderResult({ order_id: data.order_id });
      setCart(new Map());
      setPricingPreview(null);
      setSubmitting(false);
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert(`Failed to submit order: ${error.message}`);
      setSubmitting(false);
    }
  };

  const renderProductCard = (product: Product) => {
    const currentQty = cart.get(product.product_code) || 0;

    return (
      <div
        key={product.product_code}
        className="flex flex-col p-2 rounded-lg border border-gray-200 hover:border-blue-400 transition-all bg-white"
      >
        <div className="relative w-full h-20 bg-gray-50 rounded mb-2 overflow-hidden">
          <Image
            src={product.image_url || '/product-placeholder.svg'}
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
        <div className="flex-1 mb-2">
          <div className="font-semibold text-xs text-gray-900 line-clamp-2 mb-1">{product.description}</div>
          <div className="text-[10px] text-gray-600 font-mono mb-1">{product.product_code}</div>
          <div className="flex items-baseline gap-2">
            <div className="text-sm font-bold text-green-600">£{product.price.toFixed(2)}</div>
            <div className="text-[9px] text-gray-500">RRP £{product.base_price.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateQuantity(product.product_code, Math.max(0, currentQty - 1))}
            className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold"
          >
            −
          </button>
          <input
            type="number"
            min="0"
            value={currentQty}
            onChange={(e) => updateQuantity(product.product_code, parseInt(e.target.value) || 0)}
            className="flex-1 px-1 py-1 border border-gray-300 rounded text-center text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={() => updateQuantity(product.product_code, currentQty + 1)}
            className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left Sidebar - Category Filters */}
      <div className="col-span-2 space-y-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-900">Categories</h3>
            {selectedCategories.size > 0 && (
              <button
                onClick={clearAllCategories}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {availableCategories.map(category => (
              <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 p-1.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700 font-medium">{category}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Column - Product Catalog */}
      <div className="col-span-7 space-y-3">
        {/* Company Branding */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-center gap-4">
            <div className="relative h-8 w-24">
              <Image
                src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                alt="Technifold"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="relative h-8 w-24">
              <Image
                src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technicrease.png"
                alt="Technicrease"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="relative h-8 w-24">
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

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <div className="mt-1 text-[11px] text-gray-600">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'tools'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Tools <span className="text-xs text-gray-500">({products.filter(p => p.type === 'tool').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('consumables')}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'consumables'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Consumables <span className="text-xs text-gray-500">({products.filter(p => p.type === 'consumable').length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  {searchTerm || selectedCategories.size > 0
                    ? 'No products match your filters'
                    : `No ${activeTab} available`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {filteredProducts.map(renderProductCard)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Quote Builder & Summary */}
      <div className="col-span-3 space-y-3">
        {/* Company Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-sm font-bold text-blue-600 mb-1">
            {distributor.company_name}
          </h2>
          <p className="text-[11px] text-gray-600 mb-3">
            Company and delivery information
          </p>

          <div className="space-y-3">
            {/* Billing Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-semibold text-gray-600 uppercase">Billing</div>
                {billingAddress && (
                  <button onClick={() => setShowAddressModal(true)} className="text-[9px] text-blue-600 hover:text-blue-700 font-semibold">Edit</button>
                )}
              </div>
              {loadingAddresses ? (
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[10px] text-gray-600 italic">Loading...</p>
                </div>
              ) : billingAddress && billingAddress.billing_address_line_1 ? (
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-[10px] font-medium text-gray-900">{billingAddress.billing_address_line_1}</div>
                  {billingAddress.billing_address_line_2 && <div className="text-[9px] text-gray-600">{billingAddress.billing_address_line_2}</div>}
                  <div className="text-[9px] text-gray-600">{billingAddress.billing_city}{billingAddress.billing_state_province ? `, ${billingAddress.billing_state_province}` : ''}</div>
                  <div className="text-[9px] text-gray-600">{billingAddress.billing_postal_code}</div>
                  <div className="text-[10px] font-medium text-gray-900 mt-0.5">{billingAddress.billing_country}</div>
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[10px] text-red-600 italic">No billing address - <button onClick={() => setShowAddressModal(true)} className="underline font-semibold">Add</button></p>
                </div>
              )}
            </div>

            {/* Delivery Addresses */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-semibold text-gray-600 uppercase">Delivery</div>
                <button onClick={() => setShowAddressModal(true)} className="text-[9px] text-blue-600 hover:text-blue-700 font-semibold">
                  {shippingAddresses.length > 0 ? 'Add' : 'Add'}
                </button>
              </div>
              {loadingAddresses ? (
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[10px] text-gray-600 italic">Loading...</p>
                </div>
              ) : shippingAddresses.length > 0 ? (
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {shippingAddresses.map((addr) => (
                    <div
                      key={addr.address_id}
                      onClick={() => setSelectedAddressId(addr.address_id)}
                      className={`p-1.5 rounded border cursor-pointer transition-all ${
                        selectedAddressId === addr.address_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <input
                          type="radio"
                          checked={selectedAddressId === addr.address_id}
                          onChange={() => setSelectedAddressId(addr.address_id)}
                          className="mt-0.5 text-blue-600 w-3 h-3"
                        />
                        <div className="flex-1 min-w-0">
                          {addr.label && (
                            <div className="text-[9px] font-semibold text-gray-900 mb-0.5">
                              {addr.label}
                              {addr.is_default && <span className="ml-1 text-[8px] text-blue-600">(Default)</span>}
                            </div>
                          )}
                          <div className="text-[9px] text-gray-600">
                            {addr.address_line_1}{addr.address_line_2 && `, ${addr.address_line_2}`}
                          </div>
                          <div className="text-[9px] text-gray-600">
                            {addr.city}{addr.state_province ? `, ${addr.state_province}` : ''} {addr.postal_code}
                          </div>
                          <div className="text-[9px] font-medium text-gray-900">{addr.country}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-[10px] text-gray-600 italic">Confirmed at checkout</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-200">
            {distributor.role === 'admin' && (
              <a
                href="/distributor/users"
                className="px-2 py-1.5 text-[11px] font-semibold text-gray-700 hover:text-blue-600 text-center transition-colors border border-gray-300 rounded hover:border-blue-600"
              >
                Manage Team
              </a>
            )}
            <form action="/api/distributor/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full px-2 py-1.5 text-[11px] font-semibold text-gray-700 hover:text-blue-600 transition-colors border border-gray-300 rounded hover:border-blue-600"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Selected Products Section */}
        {cartItems.length > 0 && (
          <div className="bg-white rounded-lg p-2.5 shadow-sm border border-blue-200">
            <div className="mb-2">
              <h3 className="text-xs font-bold text-gray-900">Cart</h3>
              <p className="text-[10px] text-gray-600">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.product.product_code} className="p-1.5 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono text-gray-700">{item.product.product_code}</div>
                      <div className="text-[10px] font-semibold text-gray-900 leading-tight line-clamp-2">{item.product.description}</div>
                    </div>
                    <button
                      onClick={() => updateQuantity(item.product.product_code, 0)}
                      className="ml-1 text-red-600 hover:text-red-700 flex-shrink-0"
                      title="Remove"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.product_code, Math.max(0, item.quantity - 1))}
                        className="w-5 h-5 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xs"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.product_code, parseInt(e.target.value) || 0)}
                        className="w-10 px-1 py-0.5 border border-gray-300 rounded text-center text-[10px] font-semibold"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.product_code, item.quantity + 1)}
                        className="w-5 h-5 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xs"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-green-600">£{(item.quantity * item.product.price).toFixed(2)}</div>
                      <div className="text-[9px] text-gray-500">£{item.product.price.toFixed(2)} ea</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary Card (Black) */}
        {pricingPreview && cartItems.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-3 text-white shadow-lg">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Order Summary</div>
            <div className="space-y-2">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-400">Subtotal</span>
                <span className="font-semibold text-sm">£{pricingPreview.subtotal.toFixed(2)}</span>
              </div>

              {/* Shipping */}
              {pricingPreview.shipping !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Shipping</span>
                  <span className="font-semibold text-sm">{pricingPreview.shipping === 0 ? 'FREE' : `£${pricingPreview.shipping.toFixed(2)}`}</span>
                </div>
              )}

              {/* VAT */}
              {pricingPreview.vat_amount !== undefined && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                  <span className="text-[11px] text-gray-400">
                    VAT {pricingPreview.vat_rate > 0 && `(${(pricingPreview.vat_rate * 100).toFixed(0)}%)`}
                  </span>
                  <span className="font-semibold text-sm">£{pricingPreview.vat_amount.toFixed(2)}</span>
                </div>
              )}

              {/* Final Total */}
              {pricingPreview.total !== undefined && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-xl font-bold text-green-500">£{pricingPreview.total.toFixed(2)}</span>
                </div>
              )}

              {/* Address selection is optional - admin will handle during approval */}

              {/* PO Number (Optional) */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-[#666] mb-1">
                  PO Number (Optional)
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="Enter PO number"
                  className="w-full px-3 py-2 border border-[#e8e8e8] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}

        {/* Back-Order Items */}
        {backOrderItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-amber-300">
            <div className="px-2.5 py-2 bg-amber-50 border-b border-amber-200">
              <h2 className="text-xs font-bold text-gray-900">📦 Back Orders</h2>
              <p className="text-[10px] text-gray-600">{backOrderItems.length} item{backOrderItems.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="p-2 space-y-1.5 max-h-[200px] overflow-y-auto">
              {backOrderItems.map((item) => (
                <div
                  key={item.item_id}
                  className="p-1.5 bg-amber-50 rounded border border-amber-200"
                >
                  <div className="text-[10px] font-semibold text-gray-900">{item.description}</div>
                  <div className="text-[9px] text-gray-600 font-mono">{item.product_code}</div>
                  <div className="text-[9px] text-gray-700 mt-0.5">Qty: <span className="font-semibold">{item.quantity}</span></div>
                  {item.predicted_delivery_date && (
                    <div className="text-[9px] text-amber-700 font-semibold mt-0.5">
                      Est: {new Date(item.predicted_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                  {item.back_order_notes && (
                    <div className="text-[9px] text-gray-600 mt-0.5 italic line-clamp-2">{item.back_order_notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order & Invoice History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-2.5 py-2 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xs font-bold text-gray-900">Order History</h2>
            <p className="text-[10px] text-gray-600">{orders.length + invoices.length} total</p>
          </div>

          <div className="p-2 max-h-[300px] overflow-y-auto">
            {orders.length === 0 && invoices.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {/* Show orders first (most recent) */}
                {orders.slice(0, 10).map((order) => (
                  <div
                    key={order.order_id}
                    className="p-1.5 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="text-[10px] font-semibold text-gray-900 font-mono truncate">
                            {order.order_id}
                          </div>
                          <div className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${
                            order.status === 'pending_review'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'partially_fulfilled'
                              ? 'bg-amber-100 text-amber-800'
                              : order.status === 'fully_fulfilled'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'pending_review'
                              ? 'Under Review'
                              : order.status === 'partially_fulfilled'
                              ? 'Partially Fulfilled'
                              : order.status === 'fully_fulfilled'
                              ? 'Fulfilled'
                              : order.status}
                          </div>
                        </div>
                        <div className="text-[9px] text-gray-600 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-900 text-right">
                        £{order.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Then show invoices */}
                {invoices.slice(0, 10).map((invoice) => (
                  <div
                    key={invoice.invoice_id}
                    className="p-1.5 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="text-[10px] font-semibold text-gray-900 font-mono truncate">
                            {invoice.invoice_number}
                          </div>
                          {invoice.status && (
                            <div className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${
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
                        <div className="text-[9px] text-gray-600 mt-0.5">
                          {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-900 text-right">
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

      {/* Order Success Modal */}
      {orderResult && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#e8e8e8]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0a0a0a]">
                    Order Submitted!
                  </h3>
                  <p className="text-sm text-[#666] mt-0.5">
                    Order ID: <span className="font-mono font-semibold text-[#1e40af]">{orderResult.order_id}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 text-sm text-blue-800">
                    <strong className="font-semibold">What happens next?</strong>
                    <ul className="mt-2 space-y-1.5 list-disc list-inside">
                      <li>We'll review stock availability for your order</li>
                      <li>You'll receive a Stripe invoice via email (Net 30 terms)</li>
                      <li>Any back-ordered items will be noted with predicted delivery dates</li>
                      <li>Your order ships once payment is received</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="text-center mb-6">
                <p className="text-sm text-[#666]">
                  A confirmation email has been sent with your order details.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setOrderResult(null);
                  router.refresh();
                }}
                className="w-full bg-[#16a34a] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#15803d] transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
