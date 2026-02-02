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

  // Extract all unique categories from all products (dynamically)
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        categorySet.add(p.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [products]);

  // Filter products by type (tab) and search
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => p.type === activeTab);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [products, activeTab, searchTerm]);

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: { [key: string]: Product[] } = {};

    filteredProducts.forEach((product) => {
      const category = product.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });

    // Sort categories alphabetically, but put Uncategorized last
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    });

    const sorted: { [key: string]: Product[] } = {};
    sortedCategories.forEach((cat) => {
      sorted[cat] = groups[cat].sort((a, b) =>
        a.product_code.localeCompare(b.product_code)
      );
    });

    return sorted;
  }, [filteredProducts]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(groupedProducts)));
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set());
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

          {/* Search and Controls */}
          <div className="flex gap-4 mt-4">
            <input
              type="text"
              placeholder="Search by product code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={expandAll}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Products */}
      <div className="px-6 py-4 space-y-4">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => {
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">{category}</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {categoryProducts.length} products
                  </span>
                </div>
              </button>

              {/* Products in Category */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="divide-y divide-gray-100">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.product_code}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          modifiedCodes.has(product.product_code) ? 'bg-orange-50' : ''
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.description}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Product Code
                                </label>
                                <div className="font-mono text-sm font-medium text-gray-900">
                                  {product.product_code}
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={product.description}
                                  onChange={(e) =>
                                    updateField(product.product_code, 'description', e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Category
                                </label>
                                <select
                                  value={product.category || ''}
                                  onChange={(e) =>
                                    updateField(
                                      product.product_code,
                                      'category',
                                      e.target.value || null
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                  <option value="">Uncategorized</option>
                                  {allCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Price (£)
                                  </label>
                                  <input
                                    type="number"
                                    value={parseFloat(product.price) || 0}
                                    onChange={(e) =>
                                      updateField(product.product_code, 'price', e.target.value)
                                    }
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Pricing Tier
                                  </label>
                                  <select
                                    value={product.pricing_tier || 'null'}
                                    onChange={(e) =>
                                      updateField(
                                        product.product_code,
                                        'pricing_tier',
                                        e.target.value === 'null' ? null : e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  >
                                    <option value="null">None</option>
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Image URL
                                </label>
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
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    checked={product.active}
                                    onChange={(e) =>
                                      updateField(product.product_code, 'active', e.target.checked)
                                    }
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-xs font-medium text-gray-700">Active</span>
                                </label>

                                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    checked={product.is_marketable}
                                    onChange={(e) =>
                                      updateField(product.product_code, 'is_marketable', e.target.checked)
                                    }
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-xs font-medium text-gray-700">Marketable</span>
                                </label>

                                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
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
                                  <span className="text-xs font-medium text-gray-700">Portal</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(groupedProducts).length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12 text-gray-500">
            No products found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
