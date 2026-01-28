/**
 * Product Categorization Client
 * Spreadsheet-style inline editor for all product fields
 */

'use client';

import { useState, useMemo } from 'react';

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
}

interface Props {
  products: Product[];
}

export default function ProductCategorizationClient({ products: initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [modifiedCodes, setModifiedCodes] = useState<Set<string>>(new Set());

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'NEGLECTED') {
        filtered = filtered.filter((p) => p.category === 'NEGLECTED');
      } else if (categoryFilter === 'null') {
        filtered = filtered.filter((p) => !p.category);
      } else {
        filtered = filtered.filter((p) => p.category === categoryFilter);
      }
    }

    return filtered;
  }, [products, searchTerm, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Categorization</h1>
              <p className="text-sm text-gray-600 mt-1">
                Inline editing for all product fields • {filteredProducts.length} products
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

          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <input
              type="text"
              placeholder="Search by product code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="NEGLECTED">NEGLECTED</option>
              <option value="null">No Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Product Code
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Description
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Category
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Pricing Tier
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Price (£)
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Active
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Marketable
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Portal Visible
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.product_code}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    modifiedCodes.has(product.product_code) ? 'bg-orange-50' : ''
                  }`}
                >
                  {/* Product Code - Read Only */}
                  <td className="px-3 py-2 font-mono text-xs text-gray-900 font-medium whitespace-nowrap">
                    {product.product_code}
                  </td>

                  {/* Description - Editable */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={product.description}
                      onChange={(e) =>
                        updateField(product.product_code, 'description', e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                    />
                  </td>

                  {/* Type - Dropdown */}
                  <td className="px-3 py-2">
                    <select
                      value={product.type}
                      onChange={(e) =>
                        updateField(product.product_code, 'type', e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-xs"
                    >
                      <option value="tool">tool</option>
                      <option value="consumable">consumable</option>
                      <option value="other">other</option>
                    </select>
                  </td>

                  {/* Category - Editable */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={product.category || ''}
                      onChange={(e) =>
                        updateField(
                          product.product_code,
                          'category',
                          e.target.value || null
                        )
                      }
                      placeholder="uncategorized"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                  </td>

                  {/* Pricing Tier - Dropdown */}
                  <td className="px-3 py-2">
                    <select
                      value={product.pricing_tier || 'null'}
                      onChange={(e) =>
                        updateField(
                          product.product_code,
                          'pricing_tier',
                          e.target.value === 'null' ? null : e.target.value
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-xs"
                    >
                      <option value="null">None</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>

                  {/* Price - Editable (in pounds) */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={parseFloat(product.price) || 0}
                      onChange={(e) =>
                        updateField(
                          product.product_code,
                          'price',
                          e.target.value
                        )
                      }
                      step="0.01"
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                  </td>

                  {/* Active - Checkbox */}
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={product.active}
                      onChange={(e) =>
                        updateField(product.product_code, 'active', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>

                  {/* Marketable - Checkbox */}
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={product.is_marketable}
                      onChange={(e) =>
                        updateField(product.product_code, 'is_marketable', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>

                  {/* Portal Visible - Checkbox */}
                  <td className="px-3 py-2 text-center">
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found matching your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
