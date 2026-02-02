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

  // Filter products by type (tab) and search
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

    // Sort by product code
    return filtered.sort((a, b) => a.product_code.localeCompare(b.product_code));
  }, [products, activeTab, searchTerm]);

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

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search by product code, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/4">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Price (£)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Image URL
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Portal
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
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
