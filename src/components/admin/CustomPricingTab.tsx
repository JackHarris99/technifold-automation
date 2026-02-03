/**
 * Custom Pricing Tab
 * Manage product-specific pricing for individual distributors
 */

'use client';

import { useState, useMemo } from 'react';

interface Product {
  product_code: string;
  description: string;
  price: number | null;
  type: string;
  category: string;
  active: boolean;
}

interface CustomPrice {
  product_code: string;
  custom_price: number;
}

interface Props {
  company: {
    company_id: string;
    company_name: string;
    pricing_tier: string;
  };
  products: Product[];
  companyPricing: CustomPrice[];
}

export default function CustomPricingTab({ company, products, companyPricing }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tool' | 'consumable'>('all');
  const [showOnlyCustom, setShowOnlyCustom] = useState(false);
  const [editingPrice, setEditingPrice] = useState<{ product_code: string; price: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Create map of custom pricing
  const customPricingMap = useMemo(() => {
    return new Map(companyPricing.map(p => [p.product_code, p.custom_price]));
  }, [companyPricing]);

  // Get tier multiplier
  const getTierMultiplier = () => {
    if (company.pricing_tier === 'tier_1') return 0.60; // 40% off
    if (company.pricing_tier === 'tier_2') return 0.70; // 30% off
    if (company.pricing_tier === 'tier_3') return 0.80; // 20% off
    return 0.60; // Default to tier 1
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.active);

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.description.toLowerCase().includes(term) ||
        p.product_code.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }

    // Show only custom pricing
    if (showOnlyCustom) {
      filtered = filtered.filter(p => customPricingMap.has(p.product_code));
    }

    return filtered;
  }, [products, typeFilter, searchTerm, showOnlyCustom, customPricingMap]);

  const handleSetCustomPrice = async (productCode: string, customPrice: string) => {
    if (!customPrice || isNaN(parseFloat(customPrice))) {
      alert('Please enter a valid price');
      return;
    }

    setSaving(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/distributors/custom-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.company_id,
          product_code: productCode,
          price: parseFloat(customPrice),
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setResult(`✓ Custom price saved for ${productCode}`);
      setEditingPrice(null);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setResult('✗ Failed to save custom price');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCustomPrice = async (productCode: string) => {
    if (!confirm('Remove custom price? This product will use standard tier pricing.')) return;

    setSaving(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/distributors/custom-pricing', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.company_id,
          product_code: productCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      setResult(`✓ Custom price removed for ${productCode}`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setResult('✗ Failed to remove custom price');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getTierPrice = (basePrice: number | null) => {
    if (!basePrice) return 0;
    return basePrice * getTierMultiplier();
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Custom Pricing</h4>
        <p className="text-sm text-blue-800">
          Set product-specific prices that override the standard {company.pricing_tier === 'tier_1' ? 'Tier 1 (40% off)' : company.pricing_tier === 'tier_2' ? 'Tier 2 (30% off)' : 'Tier 3 (20% off)'} pricing for this distributor.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                typeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('tool')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                typeFilter === 'tool' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => setTypeFilter('consumable')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                typeFilter === 'consumable' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Consumables
            </button>
          </div>

          {/* Show Only Custom */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyCustom}
              onChange={(e) => setShowOnlyCustom(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Custom prices only ({companyPricing.length})
            </span>
          </label>
        </div>
      </div>

      {/* Results Message */}
      {result && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          result.startsWith('✓') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {result}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Base Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Tier Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Custom Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const customPrice = customPricingMap.get(product.product_code);
                  const tierPrice = getTierPrice(product.price);
                  const isEditing = editingPrice?.product_code === product.product_code;

                  return (
                    <tr key={product.product_code} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{product.description}</div>
                        <div className="text-xs text-gray-500">{product.product_code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          product.type === 'tool' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {product.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        £{product.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        £{tierPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingPrice.price}
                            onChange={(e) => setEditingPrice({ ...editingPrice, price: e.target.value })}
                            className="w-24 px-2 py-1 border border-blue-500 rounded text-sm text-right"
                            autoFocus
                          />
                        ) : customPrice ? (
                          <span className="text-sm font-bold text-green-700">
                            £{customPrice.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSetCustomPrice(product.product_code, editingPrice.price)}
                                disabled={saving}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPrice(null)}
                                disabled={saving}
                                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingPrice({ product_code: product.product_code, price: customPrice?.toString() || tierPrice.toFixed(2) })}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                {customPrice ? 'Edit' : 'Set Custom'}
                              </button>
                              {customPrice && (
                                <button
                                  onClick={() => handleRemoveCustomPrice(product.product_code)}
                                  disabled={saving}
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  Remove
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredProducts.length} of {products.filter(p => p.active).length} active products
      </div>
    </div>
  );
}
