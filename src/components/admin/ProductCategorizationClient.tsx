/**
 * Product Categorization Client
 * Interactive editor with tabs, category grouping, and images
 */

'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

interface Product {
  product_code: string;
  description: string;
  type: string;
  category: string | null;
  pricing_tier: string | null;
  price: string;
  active: boolean;
  is_marketable: boolean;
  is_reminder_eligible: boolean;
  show_in_distributor_portal: boolean;
  currency: string;
  weight_kg: string | null;
  hs_code: string | null;
  country_of_origin: string | null;
  cost_price: string | null;
  image_url: string | null;
}

interface Props {
  products: Product[];
}

export default function ProductCategorizationClient({ products: initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tool' | 'consumable'>('tool');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [modifiedCodes, setModifiedCodes] = useState<Set<string>>(new Set());

  // Sort and filter state
  const [sortColumn, setSortColumn] = useState<keyof Product>('product_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [marketableFilter, setMarketableFilter] = useState<string>('');
  const [portalFilter, setPortalFilter] = useState<string>('');

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        categorySet.add(p.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [products]);

  // Sort handler
  const handleSort = (column: keyof Product) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => p.type === activeTab);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Column filters
    if (categoryFilter) {
      if (categoryFilter === '__uncategorized__') {
        filtered = filtered.filter((p) => !p.category);
      } else {
        filtered = filtered.filter((p) => p.category === categoryFilter);
      }
    }
    if (tierFilter) {
      if (tierFilter === 'null') {
        filtered = filtered.filter((p) => !p.pricing_tier);
      } else {
        filtered = filtered.filter((p) => p.pricing_tier === tierFilter);
      }
    }
    if (activeFilter) {
      filtered = filtered.filter((p) => p.active === (activeFilter === 'true'));
    }
    if (marketableFilter) {
      filtered = filtered.filter((p) => p.is_marketable === (marketableFilter === 'true'));
    }
    if (portalFilter) {
      filtered = filtered.filter((p) => p.show_in_distributor_portal === (portalFilter === 'true'));
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle null/undefined
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      // Convert to string for comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, activeTab, searchTerm, categoryFilter, tierFilter, activeFilter, marketableFilter, portalFilter, sortColumn, sortDirection]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTierFilter('');
    setActiveFilter('');
    setMarketableFilter('');
    setPortalFilter('');
  };

  // Update a field for a product
  const updateField = (productCode: string, field: keyof Product, value: any) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.product_code === productCode ? { ...p, [field]: value } : p
      )
    );
    setModifiedCodes((prev) => new Set(prev).add(productCode));
  };

  // Save all changes
  const saveChanges = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const modifiedProducts = products.filter((p) =>
        modifiedCodes.has(p.product_code)
      );

      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: modifiedProducts }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      setSaveStatus(`✓ Saved ${modifiedProducts.length} products successfully`);
      setModifiedCodes(new Set());

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('✗ Failed to save changes');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const toolCount = products.filter((p) => p.type === 'tool').length;
  const consumableCount = products.filter((p) => p.type === 'consumable').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Categorization</h1>
              <p className="text-sm text-gray-600 mt-1">
                Organize and edit products by category
                {modifiedCodes.size > 0 && (
                  <span className="ml-2 text-orange-600 font-medium">
                    ({modifiedCodes.size} modified)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {saveStatus && (
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    saveStatus.startsWith('✓')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {saveStatus}
                </div>
              )}
              <button
                onClick={saveChanges}
                disabled={saving || modifiedCodes.size === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  modifiedCodes.size > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? 'Saving...' : `Save Changes (${modifiedCodes.size})`}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tool')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'tool'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tools ({toolCount})
            </button>
            <button
              onClick={() => setActiveTab('consumable')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'consumable'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Consumables ({consumableCount})
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Search by product code, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {(categoryFilter || tierFilter || activeFilter || marketableFilter || portalFilter) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Image
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('product_code')}
                  >
                    <div className="flex items-center gap-1">
                      Product Code
                      {sortColumn === 'product_code' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/4 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-1">
                      Description
                      {sortColumn === 'description' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Category
                      {sortColumn === 'category' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Price (£)
                      {sortColumn === 'price' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('pricing_tier')}
                  >
                    <div className="flex items-center gap-1">
                      Tier
                      {sortColumn === 'pricing_tier' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Image URL
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('active')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Active
                      {sortColumn === 'active' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('is_marketable')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Market
                      {sortColumn === 'is_marketable' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('show_in_distributor_portal')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Portal
                      {sortColumn === 'show_in_distributor_portal' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                </tr>
                {/* Filter Row */}
                <tr className="bg-white">
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="__uncategorized__">Uncategorized</option>
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2">
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Tiers</option>
                      <option value="null">None</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2">
                    <select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </th>
                  <th className="px-4 py-2">
                    <select
                      value={marketableFilter}
                      onChange={(e) => setMarketableFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </th>
                  <th className="px-4 py-2">
                    <select
                      value={portalFilter}
                      onChange={(e) => setPortalFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.product_code}
                    className={`hover:bg-gray-50 transition-colors ${
                      modifiedCodes.has(product.product_code) ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.description}
                          width={40}
                          height={40}
                          className="rounded object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                          <span className="text-gray-400 text-xs">-</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {product.product_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={product.description}
                        onChange={(e) =>
                          updateField(product.product_code, 'description', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={product.category || ''}
                        onChange={(e) =>
                          updateField(
                            product.product_code,
                            'category',
                            e.target.value || null
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Uncategorized</option>
                        {allCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__new__" disabled>
                          ─── Add New Category ───
                        </option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={parseFloat(product.price) || 0}
                        onChange={(e) =>
                          updateField(product.product_code, 'price', e.target.value)
                        }
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={product.pricing_tier || 'null'}
                        onChange={(e) =>
                          updateField(
                            product.product_code,
                            'pricing_tier',
                            e.target.value === 'null' ? null : e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="null">None</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={product.image_url || ''}
                        onChange={(e) =>
                          updateField(
                            product.product_code,
                            'image_url',
                            e.target.value || null
                          )
                        }
                        placeholder="https://..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={product.active}
                        onChange={(e) =>
                          updateField(product.product_code, 'active', e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={product.is_marketable}
                        onChange={(e) =>
                          updateField(product.product_code, 'is_marketable', e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={product.show_in_distributor_portal}
                        onChange={(e) =>
                          updateField(
                            product.product_code,
                            'show_in_distributor_portal',
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found matching your search
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              Showing {filteredProducts.length} products
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
