'use client';

import { useState } from 'react';

interface Product {
  product_code: string;
  description: string;
  price: number;
  type: string;
  category: string | null;
  active: boolean;
}

interface DistributorPricing {
  pricing_id: string;
  product_code: string;
  tier: string;
  price: number;
  currency: string;
  active: boolean;
}

interface DistributorPricingClientProps {
  products: Product[];
  distributorPricing: DistributorPricing[];
  tiers: string[];
}

export default function DistributorPricingClient({
  products,
  distributorPricing,
  tiers: initialTiers,
}: DistributorPricingClientProps) {
  const [selectedTier, setSelectedTier] = useState(initialTiers[0] || 'standard');
  const [newTierName, setNewTierName] = useState('');
  const [pricingMap, setPricingMap] = useState<Map<string, DistributorPricing>>(
    new Map(distributorPricing.map(dp => [`${dp.tier}-${dp.product_code}`, dp]))
  );
  const [editingPrices, setEditingPrices] = useState<Map<string, number>>(new Map());
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState(initialTiers);

  const handleAddTier = () => {
    const tierName = newTierName.trim().toLowerCase();
    if (!tierName) {
      alert('Please enter a tier name');
      return;
    }
    if (tiers.includes(tierName)) {
      alert('This tier already exists');
      return;
    }
    setTiers([...tiers, tierName]);
    setSelectedTier(tierName);
    setNewTierName('');
  };

  const handlePriceChange = (productCode: string, price: string) => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      editingPrices.delete(productCode);
    } else {
      editingPrices.set(productCode, priceValue);
    }
    setEditingPrices(new Map(editingPrices));
  };

  const handleSavePrices = async () => {
    if (editingPrices.size === 0) {
      alert('No prices to save');
      return;
    }

    setSaving(true);

    try {
      const updates = Array.from(editingPrices.entries()).map(([productCode, price]) => ({
        product_code: productCode,
        tier: selectedTier,
        price,
        currency: 'GBP',
        active: true,
      }));

      const response = await fetch('/api/admin/distributor-pricing/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricing: updates }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save pricing');
      }

      alert(`Successfully saved ${data.updated} price${data.updated !== 1 ? 's' : ''}`);

      // Refresh page to get updated data
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving prices:', error);
      alert(`Failed to save prices: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getPrice = (productCode: string): number | null => {
    const key = `${selectedTier}-${productCode}`;
    return pricingMap.get(key)?.price || null;
  };

  const activeProducts = products.filter(p => p.active);

  return (
    <>
      {/* Tier Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Pricing Tier</h3>

        <div className="flex items-center gap-4 mb-4">
          {tiers.map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTier === tier
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Add New Tier */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <input
            type="text"
            value={newTierName}
            onChange={(e) => setNewTierName(e.target.value)}
            placeholder="New tier name (e.g., platinum)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddTier}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Add Tier
          </button>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedTier} Tier Pricing ({activeProducts.length} products)
          </h3>
          <button
            onClick={handleSavePrices}
            disabled={saving || editingPrices.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : `Save ${editingPrices.size} Change${editingPrices.size !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Code</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Standard Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">{selectedTier} Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeProducts.map((product) => {
                const tierPrice = getPrice(product.product_code);
                const editingPrice = editingPrices.get(product.product_code);
                const displayPrice = editingPrice !== undefined ? editingPrice : (tierPrice || '');

                return (
                  <tr key={product.product_code} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm text-gray-900">{product.product_code}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{product.description}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.type === 'tool'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">
                      £{product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-500">£</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={displayPrice}
                          onChange={(e) => handlePriceChange(product.product_code, e.target.value)}
                          placeholder="Use standard"
                          className="w-32 px-3 py-1.5 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Leave a price blank to use the standard product price for that tier</li>
          <li>Changes are saved individually - you can update multiple prices before saving</li>
          <li>To remove a tier price, clear the field and save</li>
          <li>Prices are in GBP (£)</li>
        </ul>
      </div>
    </>
  );
}
