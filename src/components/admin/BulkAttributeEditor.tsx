'use client';

import { useState, useMemo } from 'react';
import { PRESET_ATTRIBUTES } from './ProductAttributeBuilder';

interface Product {
  product_code: string;
  description: string | null;
  type: string;
  category: string | null;
  active: boolean;
  extra: any;
}

interface BulkAttributeEditorProps {
  products: Product[];
}

export default function BulkAttributeEditor({ products: initialProducts }: BulkAttributeEditorProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Attribute to add
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [customAttributeName, setCustomAttributeName] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Uncategorized'));
    return Array.from(cats).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          product.product_code.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && product.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [products, searchTerm, typeFilter, categoryFilter]);

  const toggleProduct = (productCode: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productCode)) {
      newSelected.delete(productCode);
    } else {
      newSelected.add(productCode);
    }
    setSelectedProducts(newSelected);
  };

  const selectAll = () => {
    setSelectedProducts(new Set(filteredProducts.map(p => p.product_code)));
  };

  const deselectAll = () => {
    setSelectedProducts(new Set());
  };

  const handleApplyAttributes = async () => {
    if (selectedProducts.size === 0) {
      setError('Please select at least one product');
      return;
    }

    if (!attributeKey && !customAttributeName) {
      setError('Please select an attribute');
      return;
    }

    if (!attributeValue.trim()) {
      setError('Please enter a value');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const finalKey = attributeKey === 'custom' ? customAttributeName.toLowerCase().replace(/\s+/g, '_') : attributeKey;

      const response = await fetch('/api/admin/products/bulk-update-attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_codes: Array.from(selectedProducts),
          attributes: {
            [finalKey]: attributeValue,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully updated ${data.updated} product(s)`);
        setAttributeKey('');
        setAttributeValue('');
        setCustomAttributeName('');
        setSelectedProducts(new Set());

        // Refresh page to show updated products
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || 'Failed to update products');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAttribute = PRESET_ATTRIBUTES.find(a => a.key === attributeKey);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Products</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Product code, description, category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="tool">Tools</option>
              <option value="consumable">Consumables</option>
              <option value="part">Parts</option>
              <option value="accessory">Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Select All ({filteredProducts.length})
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {/* Selected Products Summary */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-900 font-medium">
              {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={deselectAll}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Attribute Editor */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Attribute to Selected Products</h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attribute Name
            </label>
            <select
              value={attributeKey}
              onChange={(e) => {
                setAttributeKey(e.target.value);
                setAttributeValue('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select attribute...</option>
              {PRESET_ATTRIBUTES.map((attr) => (
                <option key={attr.key} value={attr.key}>
                  {attr.label}
                </option>
              ))}
              <option value="custom">Custom Attribute...</option>
            </select>
          </div>

          {attributeKey === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Attribute Name
              </label>
              <input
                type="text"
                value={customAttributeName}
                onChange={(e) => setCustomAttributeName(e.target.value)}
                placeholder="e.g. Max Speed"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className={attributeKey === 'custom' ? '' : 'col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value
            </label>
            {selectedAttribute?.type === 'select' ? (
              <select
                value={attributeValue}
                onChange={(e) => setAttributeValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select value...</option>
                {selectedAttribute.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={selectedAttribute?.type || 'text'}
                value={attributeValue}
                onChange={(e) => setAttributeValue(e.target.value)}
                placeholder={selectedAttribute?.placeholder || 'Enter value...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleApplyAttributes}
          disabled={loading || selectedProducts.size === 0 || (!attributeKey || (attributeKey === 'custom' && !customAttributeName)) || !attributeValue}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Applying...' : `Apply to ${selectedProducts.size} Product${selectedProducts.size !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.has(p.product_code))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Current Attributes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.product_code}
                    className={`hover:bg-gray-50 ${selectedProducts.has(product.product_code) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.product_code)}
                        onChange={() => toggleProduct(product.product_code)}
                        className="w-4 h-4 text-blue-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.product_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{product.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{product.category || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {product.extra && Object.keys(product.extra).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(product.extra).map((key) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
