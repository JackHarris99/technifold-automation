'use client';

import { useState } from 'react';

interface Product {
  product_code: string;
  description: string;
  price: number | null;
  type: string;
  category: string | null;
  active: boolean;
}

interface DistributorPricing {
  pricing_id: string;
  product_code: string;
  standard_price: number | null;
  currency: string;
  active: boolean;
}

interface DistributorPricingClientProps {
  products: Product[];
  distributorPricing: DistributorPricing[];
}

export default function DistributorPricingClient({
  products,
  distributorPricing,
}: DistributorPricingClientProps) {
  // Create map of existing pricing
  const pricingMap = new Map(distributorPricing.map(dp => [dp.product_code, dp]));

  const [editingPrices, setEditingPrices] = useState<Map<string, number | null>>(new Map());
  const [saving, setSaving] = useState(false);

  const handlePriceChange = (productCode: string, priceStr: string) => {
    const priceValue = priceStr === '' ? null : parseFloat(priceStr);

    if (priceValue === null || isNaN(priceValue)) {
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
        standard_price: price,
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

      alert(`Successfully saved ${data.updated} product${data.updated !== 1 ? 's' : ''}`);

      // Refresh page to get updated data
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving prices:', error);
      alert(`Failed to save prices: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getDisplayPrice = (productCode: string): string => {
    const editing = editingPrices.get(productCode);
    if (editing !== undefined && editing !== null) {
      return editing.toString();
    }

    const existing = pricingMap.get(productCode);
    if (!existing) return '';

    const price = existing.standard_price;
    return price !== null ? price.toString() : '';
  };

  const activeProducts = products.filter(p => p.active);

  return (
    <>
      {/* Pricing Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Distributor Pricing ({activeProducts.length} products)
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
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Base Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 bg-blue-50">
                  Distributor Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeProducts.map((product) => {
                const distributorPrice = getDisplayPrice(product.product_code);

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
                      {product.price != null ? `£${product.price.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 bg-blue-50">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-500">£</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={distributorPrice}
                          onChange={(e) => handlePriceChange(product.product_code, e.target.value)}
                          placeholder="Use base"
                          className="w-28 px-3 py-1.5 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <li>Leave a price blank to use the base product price</li>
          <li>These prices apply to all distributors in the portal</li>
          <li>Changes are saved when you click the Save button</li>
          <li>All prices are in GBP (£)</li>
        </ul>
      </div>
    </>
  );
}
