'use client';

import { useState, useEffect } from 'react';
import PortalAddressCollectionModal from './portals/PortalAddressCollectionModal';

interface QuoteItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  product_type: 'tool' | 'consumable';
  category?: string;
  image_url?: string;
}

interface PricingTier {
  tier_name: string;
  min_quantity: number;
  discount_percent?: number;
  unit_price?: number;
}

interface ShippingAddress {
  address_line_1: string;
  city: string;
  country: string;
}

interface InteractiveQuoteViewerProps {
  initialItems: QuoteItem[];
  pricingMode: 'standard' | 'premium';
  companyName: string;
  companyId: string;
  contactName?: string;
  token: string;
  isTest: boolean;
}

export default function InteractiveQuoteViewer({
  initialItems,
  pricingMode,
  companyName,
  companyId,
  contactName,
  token,
  isTest,
}: InteractiveQuoteViewerProps) {
  const [lineItems, setLineItems] = useState<QuoteItem[]>(initialItems);
  const [standardTiers, setStandardTiers] = useState<PricingTier[]>([]);
  const [premiumTiers, setPremiumTiers] = useState<PricingTier[]>([]);
  const [toolTiers, setToolTiers] = useState<PricingTier[]>([]);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Load pricing tiers on mount
  useEffect(() => {
    async function loadTiers() {
      try {
        const response = await fetch('/api/admin/pricing-tiers');
        const data = await response.json();
        setStandardTiers(data.standard || []);
        setPremiumTiers(data.premium || []);
        setToolTiers(data.tool || []);
      } catch (err) {
        console.error('Failed to load pricing tiers:', err);
      }
    }
    loadTiers();
  }, []);

  // Fetch shipping address on mount
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch(`/api/portal/shipping-address?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.success && data.address) {
          setShippingAddress(data.address);
        } else if (!isTest) {
          // No address exists - show modal to collect it (unless this is a test token)
          setShowAddressModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch shipping address:', error);
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
      console.error('Failed to refetch shipping address:', error);
    }
  };

  function updateQuantity(productCode: string, newQuantity: number) {
    if (newQuantity < 1) return;
    setLineItems(lineItems.map(li =>
      li.product_code === productCode ? { ...li, quantity: newQuantity } : li
    ));
  }

  function calculateTotals() {
    const consumableItems = lineItems.filter(li => li.product_type === 'consumable');
    const toolItems = lineItems.filter(li => li.product_type === 'tool');

    let subtotal = 0;
    let totalDiscount = 0;

    // Calculate consumable pricing with tiers
    if (pricingMode === 'standard') {
      const totalConsumableQty = consumableItems.reduce((sum, li) => sum + li.quantity, 0);
      const tier = [...standardTiers].reverse().find(t => totalConsumableQty >= t.min_quantity);

      consumableItems.forEach(li => {
        const tierPrice = tier?.unit_price || li.unit_price;
        const itemSubtotal = tierPrice * li.quantity;
        const itemDiscount = (itemSubtotal * li.discount_percent) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      });
    } else {
      // Premium tier - per-SKU discounts
      consumableItems.forEach(li => {
        const tier = [...premiumTiers].reverse().find(t => li.quantity >= t.min_quantity);
        const tierDiscount = tier?.discount_percent || 0;
        const combinedDiscount = Math.min(100, tierDiscount + li.discount_percent);
        const itemSubtotal = li.unit_price * li.quantity;
        const itemDiscount = (itemSubtotal * combinedDiscount) / 100;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
      });
    }

    // Tools have tiered volume discounts
    const totalToolQty = toolItems.reduce((sum, li) => sum + li.quantity, 0);
    const toolTier = [...toolTiers].reverse().find(t => totalToolQty >= t.min_quantity);
    const toolTierDiscount = toolTier?.discount_percent || 0;

    toolItems.forEach(li => {
      const itemSubtotal = li.unit_price * li.quantity;
      const combinedDiscount = Math.min(100, toolTierDiscount + li.discount_percent);
      const itemDiscount = (itemSubtotal * combinedDiscount) / 100;
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    });

    const total = subtotal - totalDiscount;

    return { subtotal, totalDiscount, total };
  }

  const { subtotal, totalDiscount, total } = calculateTotals();
  const consumableQty = lineItems.filter(li => li.product_type === 'consumable').reduce((sum, li) => sum + li.quantity, 0);
  const toolQty = lineItems.filter(li => li.product_type === 'tool').reduce((sum, li) => sum + li.quantity, 0);

  const nextConsumableTier = pricingMode === 'standard'
    ? standardTiers.find(t => consumableQty < t.min_quantity)
    : premiumTiers.find(t => consumableQty < t.min_quantity);

  const nextToolTier = toolTiers.find(t => toolQty < t.min_quantity);
  const currentToolTier = [...toolTiers].reverse().find(t => toolQty >= t.min_quantity);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Quote</h1>
              <p className="text-gray-600">{companyName}</p>
              {contactName && <p className="text-gray-700 text-sm">Attn: {contactName}</p>}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700">Valid for 30 days</div>
              <div className="text-sm text-gray-700">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Pricing Tiers Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {currentToolTier && toolQty > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <div className="text-sm font-semibold text-blue-900">Tool Volume Discount</div>
                  <div className="text-lg font-bold text-blue-600">{currentToolTier.discount_percent}% off</div>
                  <div className="text-xs text-blue-700">Applied to all {toolQty} tools</div>
                </div>
              </div>
            )}
            {nextToolTier && toolQty > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-2xl">📈</div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">Next Tool Tier</div>
                  <div className="text-sm text-gray-600">
                    Add {nextToolTier.min_quantity - toolQty} more tool{(nextToolTier.min_quantity - toolQty) > 1 ? 's' : ''} for {nextToolTier.discount_percent}% off
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (toolQty / nextToolTier.min_quantity) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quote Items */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>

            <div className="space-y-4">
              {lineItems.map((item) => {
                const itemSubtotal = item.unit_price * item.quantity;
                let appliedDiscount = item.discount_percent;

                // Add tier discount for tools
                if (item.product_type === 'tool' && currentToolTier) {
                  appliedDiscount = Math.min(100, currentToolTier.discount_percent + item.discount_percent);
                }

                // Add tier discount for consumables
                if (item.product_type === 'consumable') {
                  if (pricingMode === 'standard') {
                    const tier = [...standardTiers].reverse().find(t => consumableQty >= t.min_quantity);
                    // Standard uses unit price from tier, not discount %
                  } else {
                    const tier = [...premiumTiers].reverse().find(t => item.quantity >= t.min_quantity);
                    if (tier) {
                      appliedDiscount = Math.min(100, tier.discount_percent + item.discount_percent);
                    }
                  }
                }

                const discountAmount = (itemSubtotal * appliedDiscount) / 100;
                const itemTotal = itemSubtotal - discountAmount;

                return (
                  <div key={item.product_code} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.description}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.description}</div>
                      <div className="text-sm text-gray-700 mb-2">
                        {item.product_code} • {item.product_type}
                        {appliedDiscount > 0 && (
                          <span className="ml-2 text-green-600 font-semibold">({appliedDiscount.toFixed(0)}% off)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 font-medium">Quantity:</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_code, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product_code, parseInt(e.target.value) || 1)}
                            className="w-20 px-3 py-1 border border-gray-300 rounded text-center font-semibold"
                          />
                          <button
                            onClick={() => updateQuantity(item.product_code, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 font-bold text-gray-700"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm text-gray-700">× £{item.unit_price.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">£{itemTotal.toFixed(2)}</div>
                      {appliedDiscount > 0 && (
                        <div className="text-sm text-gray-700 line-through">£{itemSubtotal.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">£{subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Total Discount</span>
                  <span className="font-semibold text-green-600">-£{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                window.location.href = `/checkout?token=${token}`;
              }}
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
            >
              Accept Quote & Proceed to Checkout
            </button>
            <p className="text-center text-sm text-gray-700 mt-3">
              Adjust quantities above to see live pricing • Valid for 30 days
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-700">
          <p>Tech-ni-Fold Ltd • World-Leading Print Finishing Solutions</p>
        </div>
      </div>

      {/* Address Collection Modal */}
      <PortalAddressCollectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        companyId={companyId}
        companyName={companyName}
        token={token}
        onSuccess={handleAddressSaved}
      />
    </div>
  );
}
