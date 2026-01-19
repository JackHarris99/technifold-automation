'use client';

import { useState, useMemo } from 'react';

interface Product {
  product_code: string;
  description: string;
  type: string;
  category: string | null;
  pricing_tier: string | null;
  price: number | null;
  active: boolean;
}

interface BulkPricingTierClientProps {
  products: Product[];
}

export default function BulkPricingTierClient({ products }: BulkPricingTierClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [filterTier, setFilterTier] = useState<string>('all');

  // Filter products by search term and tier filter
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          p.product_code.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      // Tier filter
      if (filterTier !== 'all') {
        if (filterTier === 'none' && p.pricing_tier) return false;
        if (filterTier === 'standard' && p.pricing_tier !== 'standard') return false;
        if (filterTier === 'premium' && p.pricing_tier !== 'premium') return false;
      }

      return true;
    });
  }, [products, searchTerm, filterTier]);

  const handleToggleProduct = (productCode: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productCode)) {
      newSelected.delete(productCode);
    } else {
      newSelected.add(productCode);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.product_code)));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedProducts.size === 0) {
      alert('Please select at least one product');
      return;
    }

    if (!selectedTier && selectedTier !== '') {
      alert('Please select a pricing tier');
      return;
    }

    const confirmMessage = `Update ${selectedProducts.size} product(s) to "${
      selectedTier === '' ? 'No Tier' :
      selectedTier === 'standard' ? 'Standard Tier' :
      'Premium Tier'
    }"?`;

    if (!confirm(confirmMessage)) return;

    setUpdating(true);

    try {
      const response = await fetch('/api/admin/products/bulk-update-pricing-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_codes: Array.from(selectedProducts),
          pricing_tier: selectedTier === '' ? null : selectedTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update products');
      }

      alert(`✓ Successfully updated ${data.updated_count} product(s)`);
      window.location.reload();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">No Tier</span>;
    }
    if (tier === 'standard') {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Standard</span>;
    }
    if (tier === 'premium') {
      return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">Premium</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">{tier}</span>;
  };

  const tierCounts = useMemo(() => {
    return {
      none: products.filter(p => !p.pricing_tier).length,
      standard: products.filter(p => p.pricing_tier === 'standard').length,
      premium: products.filter(p => p.pricing_tier === 'premium').length,
    };
  }, [products]);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">No Tier</div>
          <div className="text-2xl font-bold text-gray-900">{tierCounts.none}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Standard Tier</div>
          <div className="text-2xl font-bold text-blue-600">{tierCounts.standard}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Premium Tier</div>
          <div className="text-2xl font-bold text-purple-600">{tierCounts.premium}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, description, or category..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tier</label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tiers ({products.length})</option>
              <option value="none">No Tier ({tierCounts.none})</option>
              <option value="standard">Standard Tier ({tierCounts.standard})</option>
              <option value="premium">Premium Tier ({tierCounts.premium})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-900">
              {selectedProducts.size} product(s) selected
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select new tier...</option>
                <option value="">No Tier (Standard Pricing)</option>
                <option value="standard">Standard Tier (Volume unit price)</option>
                <option value="premium">Premium Tier (Volume % discount)</option>
              </select>
              <button
                onClick={handleBulkUpdate}
                disabled={updating || !selectedTier === undefined}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {updating ? 'Updating...' : 'Update Selected'}
              </button>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Code</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Current Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.product_code} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.product_code)}
                        onChange={() => handleToggleProduct(product.product_code)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-900">{product.product_code}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{product.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{product.category || '-'}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">
                      {product.price != null ? `£${product.price.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {getTierBadge(product.pricing_tier)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} consumables
          </div>
        )}
      </div>
    </>
  );
}
