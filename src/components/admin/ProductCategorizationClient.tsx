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
  is_reminder_eligible: boolean;
  currency: string;
  weight_kg: string | null;
  hs_code: string | null;
  country_of_origin: string | null;
  cost_price: string | null;
  image_url: string | null;
  last_sold_date: string | null;
  times_sold: number;
  total_quantity_ordered: number;
  ever_sold: boolean;
  dist_price_20: string;
  dist_price_30: string;
  dist_price_40: string;
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
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [addingCategoryForProduct, setAddingCategoryForProduct] = useState<string | null>(null);
  const [newCategoryInputValue, setNewCategoryInputValue] = useState('');

  // Delete state
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Sort and filter state
  const [sortColumn, setSortColumn] = useState<keyof Product>('product_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Get all unique categories (filtered by current tab type)
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.type === activeTab) {
        categorySet.add(p.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [products, activeTab]);

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
  }, [products, activeTab, searchTerm, categoryFilter, tierFilter, activeFilter, sortColumn, sortDirection]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTierFilter('');
    setActiveFilter('');
  };

  // Update a field for a product
  const updateField = (productCode: string, field: keyof Product, value: any) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.product_code !== productCode) return p;

        const updated = { ...p, [field]: value };

        // Recalculate distributor prices if base price changes
        if (field === 'price') {
          const price = parseFloat(value) || 0;
          updated.dist_price_20 = String(price * 0.80);
          updated.dist_price_30 = String(price * 0.70);
          updated.dist_price_40 = String(price * 0.60);
        }

        return updated;
      })
    );
    setModifiedCodes((prev) => new Set(prev).add(productCode));
  };

  // Toggle product selection for deletion
  const toggleSelectForDelete = (productCode: string) => {
    setSelectedForDelete((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productCode)) {
        newSet.delete(productCode);
      } else {
        newSet.add(productCode);
      }
      return newSet;
    });
  };

  // Toggle all visible products
  const toggleSelectAll = () => {
    if (selectedForDelete.size === filteredProducts.length) {
      setSelectedForDelete(new Set());
    } else {
      setSelectedForDelete(new Set(filteredProducts.map(p => p.product_code)));
    }
  };

  // Delete selected products
  const deleteSelected = async () => {
    if (selectedForDelete.size === 0) return;

    const count = selectedForDelete.size;
    const productCodes = Array.from(selectedForDelete);

    if (!confirm(`⚠️ DELETE ${count} PRODUCTS PERMANENTLY?\n\nThis will remove:\n- Products from database\n- All product history\n- Cannot be undone\n\nType "DELETE" to confirm.`)) {
      return;
    }

    const userConfirm = prompt(`Type "DELETE" to confirm deletion of ${count} products:`);
    if (userConfirm !== 'DELETE') {
      alert('Deletion cancelled');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_codes: productCodes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete products');
      }

      const data = await response.json();

      // Show detailed message about what was deleted and what was skipped
      alert(data.message || `✓ Successfully deleted ${data.deleted} products`);

      // Remove only successfully deleted products from state
      if (data.skipped_products && data.skipped_products.length > 0) {
        // Some products couldn't be deleted - only remove the ones that were deleted
        const skippedSet = new Set(data.skipped_products);
        const actuallyDeleted = productCodes.filter(code => !skippedSet.has(code));
        setProducts((prev) => prev.filter(p => !actuallyDeleted.includes(p.product_code)));
      } else {
        // All selected products were deleted
        setProducts((prev) => prev.filter(p => !selectedForDelete.has(p.product_code)));
      }

      setSelectedForDelete(new Set());
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete products: ' + (error as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (productCode: string, file: File) => {
    setUploadingImage(productCode);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('product_code', productCode);

      const response = await fetch('/api/admin/products/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { image_url } = await response.json();
      updateField(productCode, 'image_url', image_url);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  // Save all changes
  const saveChanges = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const modifiedProducts = products
        .filter((p) => modifiedCodes.has(p.product_code))
        .map((p) => ({
          // Only send fields that exist in the products table
          product_code: p.product_code,
          description: p.description,
          type: p.type,
          category: p.category,
          pricing_tier: p.pricing_tier,
          price: p.price,
          active: p.active,
          is_reminder_eligible: p.is_reminder_eligible,
          currency: p.currency,
          weight_kg: p.weight_kg,
          hs_code: p.hs_code,
          country_of_origin: p.country_of_origin,
          cost_price: p.cost_price,
          image_url: p.image_url,
        }));

      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: modifiedProducts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(errorData.error || 'Failed to save changes');
      }

      setSaveStatus(`✓ Saved ${modifiedProducts.length} products successfully`);
      setModifiedCodes(new Set());

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
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
              {selectedForDelete.size > 0 && (
                <button
                  onClick={deleteSelected}
                  disabled={deleting}
                  className="px-6 py-2 rounded-lg font-medium transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : `Delete ${selectedForDelete.size} Products`}
                </button>
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
              onClick={() => {
                setActiveTab('tool');
                setCategoryFilter(''); // Clear category filter when switching tabs
              }}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'tool'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tools ({toolCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('consumable');
                setCategoryFilter(''); // Clear category filter when switching tabs
              }}
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

            {/* Category Filter and Management */}
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="__uncategorized__">⚠️ Uncategorized</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {(categoryFilter || tierFilter || activeFilter) && (
              <div className="flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
                {categoryFilter && (
                  <span className="text-sm text-gray-700">
                    Showing: <span className="font-semibold">{categoryFilter === '__uncategorized__' ? 'Uncategorized' : categoryFilter}</span> ({filteredProducts.length} products)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">
                    <input
                      type="checkbox"
                      checked={selectedForDelete.size > 0 && selectedForDelete.size === filteredProducts.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-red-600 rounded cursor-pointer"
                      title="Select all visible products"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Image
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('product_code')}
                  >
                    <div className="flex items-center gap-1">
                      Code {sortColumn === 'product_code' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-1">
                      Description {sortColumn === 'description' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      Type {sortColumn === 'type' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Category {sortColumn === 'category' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Base £ {sortColumn === 'price' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Dist 20%
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Dist 30%
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Dist 40%
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('pricing_tier')}
                  >
                    <div className="flex items-center gap-1">
                      Tier {sortColumn === 'pricing_tier' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('last_sold_date')}
                  >
                    <div className="flex items-center gap-1">
                      Last Sold {sortColumn === 'last_sold_date' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total_quantity_ordered')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Qty Ordered {sortColumn === 'total_quantity_ordered' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ever_sold')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Sold? {sortColumn === 'ever_sold' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('active')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Active {sortColumn === 'active' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                </tr>
                {/* Filter Row */}
                <tr className="bg-white">
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">All</option>
                      <option value="__uncategorized__">None</option>
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">All</option>
                      <option value="null">None</option>
                      <option value="standard">Std</option>
                      <option value="premium">Prem</option>
                    </select>
                  </th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">
                    <select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">All</option>
                      <option value="true">✓</option>
                      <option value="false">✗</option>
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
                    } ${selectedForDelete.has(product.product_code) ? 'bg-red-50' : ''}`}
                  >
                    {/* Checkbox for deletion */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedForDelete.has(product.product_code)}
                        onChange={() => toggleSelectForDelete(product.product_code)}
                        className="w-4 h-4 text-red-600 rounded cursor-pointer"
                      />
                    </td>
                    {/* Image with Upload */}
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
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
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(product.product_code, file);
                            }}
                            className="hidden"
                          />
                          <span className="text-[10px] text-blue-600 hover:underline">
                            {uploadingImage === product.product_code ? 'Uploading...' : 'Upload'}
                          </span>
                        </label>
                      </div>
                    </td>
                    {/* Product Code - READ ONLY */}
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded">
                        {product.product_code}
                      </span>
                    </td>
                    {/* Description */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={product.description}
                        onChange={(e) =>
                          updateField(product.product_code, 'description', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </td>
                    {/* Type */}
                    <td className="px-3 py-2">
                      <select
                        value={product.type}
                        onChange={(e) =>
                          updateField(product.product_code, 'type', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="tool">Tool</option>
                        <option value="consumable">Consumable</option>
                      </select>
                    </td>
                    {/* Category */}
                    <td className="px-3 py-2">
                      {addingCategoryForProduct === product.product_code ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newCategoryInputValue}
                            onChange={(e) => setNewCategoryInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newCategoryInputValue.trim()) {
                                updateField(product.product_code, 'category', newCategoryInputValue.trim());
                                setAddingCategoryForProduct(null);
                                setNewCategoryInputValue('');
                              } else if (e.key === 'Escape') {
                                setAddingCategoryForProduct(null);
                                setNewCategoryInputValue('');
                              }
                            }}
                            placeholder="New category name..."
                            autoFocus
                            className="flex-1 px-2 py-1 border border-blue-500 rounded text-xs focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => {
                              if (newCategoryInputValue.trim()) {
                                updateField(product.product_code, 'category', newCategoryInputValue.trim());
                                setAddingCategoryForProduct(null);
                                setNewCategoryInputValue('');
                              }
                            }}
                            className="px-2 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setAddingCategoryForProduct(null);
                              setNewCategoryInputValue('');
                            }}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <select
                          value={product.category || ''}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setAddingCategoryForProduct(product.product_code);
                              setNewCategoryInputValue('');
                            } else {
                              updateField(product.product_code, 'category', e.target.value || null);
                            }
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="">None</option>
                          {allCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="__add_new__" className="font-semibold text-teal-600">+ Add New Category...</option>
                        </select>
                      )}
                    </td>
                    {/* Base Price */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={parseFloat(product.price) || 0}
                        onChange={(e) =>
                          updateField(product.product_code, 'price', e.target.value)
                        }
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                      />
                    </td>
                    {/* Distributor Prices - READ ONLY (auto-calculated) */}
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-600">
                        £{parseFloat(product.dist_price_20).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-600">
                        £{parseFloat(product.dist_price_30).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-600">
                        £{parseFloat(product.dist_price_40).toFixed(2)}
                      </span>
                    </td>
                    {/* Pricing Tier */}
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
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="null">None</option>
                        <option value="standard">Std</option>
                        <option value="premium">Prem</option>
                      </select>
                    </td>
                    {/* Last Sold Date */}
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-600">
                        {product.last_sold_date
                          ? new Date(product.last_sold_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit'
                            })
                          : '-'}
                      </span>
                    </td>
                    {/* Total Quantity Ordered */}
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-semibold ${product.total_quantity_ordered > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {product.total_quantity_ordered || '-'}
                      </span>
                    </td>
                    {/* Ever Sold? */}
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-semibold ${product.ever_sold ? 'text-green-600' : 'text-gray-400'}`}>
                        {product.ever_sold ? '✓' : '-'}
                      </span>
                    </td>
                    {/* Active */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={product.active}
                        onChange={(e) =>
                          updateField(product.product_code, 'active', e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded"
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
