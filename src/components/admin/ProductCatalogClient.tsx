'use client';

import { useState, useMemo } from 'react';

interface Company {
  company_id: string;
  company_name: string;
  type: string;
}

interface Product {
  product_code: string;
  description: string;
  type: string;
  category: string | null;
  active: boolean;
  show_in_distributor_portal: boolean;
}

interface CatalogEntry {
  company_id: string;
  product_code: string;
  visible: boolean;
}

interface ProductCatalogClientProps {
  companies: Company[];
  products: Product[];
  catalogEntries: CatalogEntry[];
}

export default function ProductCatalogClient({
  companies,
  products,
  catalogEntries,
}: ProductCatalogClientProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all'); // all, selected, unselected

  // Get catalog for selected company
  const companyCatalog = useMemo(() => {
    if (!selectedCompanyId) return [];
    return catalogEntries.filter(e => e.company_id === selectedCompanyId && e.visible);
  }, [selectedCompanyId, catalogEntries]);

  const hasCustomCatalog = companyCatalog.length > 0;

  // Initialize selected products when company changes
  useMemo(() => {
    if (!selectedCompanyId) {
      setSelectedProducts(new Set());
      return;
    }

    if (hasCustomCatalog) {
      // Load custom catalog
      setSelectedProducts(new Set(companyCatalog.map(e => e.product_code)));
    } else {
      // Load default catalog (all products with show_in_distributor_portal = true)
      setSelectedProducts(new Set(
        products.filter(p => p.show_in_distributor_portal && p.active).map(p => p.product_code)
      ));
    }
  }, [selectedCompanyId, hasCustomCatalog, companyCatalog, products]);

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
    setSelectedProducts(new Set(products.filter(p => p.active).map(p => p.product_code)));
  };

  const handleDeselectAll = () => {
    setSelectedProducts(new Set());
  };

  const handleSaveCustomCatalog = async () => {
    if (!selectedCompanyId) {
      alert('Please select a company');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/product-catalogs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          product_codes: Array.from(selectedProducts),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save catalog');
      }

      alert(`Custom catalog saved! ${data.added} products added.`);
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving catalog:', error);
      alert(`Failed to save catalog: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomCatalog = async () => {
    if (!selectedCompanyId || !hasCustomCatalog) return;

    if (!confirm('Delete custom catalog? This company will revert to the default catalog.')) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/product-catalogs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: selectedCompanyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete catalog');
      }

      alert('Custom catalog deleted. Company will now use default catalog.');
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting catalog:', error);
      alert(`Failed to delete catalog: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.active);

    if (filter === 'selected') {
      filtered = filtered.filter(p => selectedProducts.has(p.product_code));
    } else if (filter === 'unselected') {
      filtered = filtered.filter(p => !selectedProducts.has(p.product_code));
    }

    return filtered;
  }, [products, filter, selectedProducts]);

  return (
    <>
      {/* Company Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Company</h3>
        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Select a company --</option>
          {companies.map(company => (
            <option key={company.company_id} value={company.company_id}>
              {company.company_name} ({company.type})
            </option>
          ))}
        </select>

        {selectedCompanyId && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {hasCustomCatalog ? (
                    <span className="text-orange-600">Custom Catalog ({companyCatalog.length} products)</span>
                  ) : (
                    <span className="text-blue-600">Using Default Catalog</span>
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {hasCustomCatalog
                    ? 'This company has a custom product selection'
                    : 'This company sees all products marked for distributor portal'}
                </p>
              </div>
              {hasCustomCatalog && (
                <button
                  onClick={handleDeleteCustomCatalog}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Delete Custom Catalog
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Selection */}
      {selectedCompanyId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Products ({selectedProducts.size} selected)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Products ({products.filter(p => p.active).length})</option>
                <option value="selected">Selected ({selectedProducts.size})</option>
                <option value="unselected">Unselected ({products.filter(p => p.active).length - selectedProducts.size})</option>
              </select>
              <button
                onClick={handleSaveCustomCatalog}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : 'Save Custom Catalog'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.filter(p => p.active).length}
                      onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                      className="rounded border-gray-300 text-blue-600"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Default Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.product_code} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.product_code)}
                        onChange={() => handleToggleProduct(product.product_code)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-900">{product.product_code}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{product.description}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.type === 'tool' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{product.category || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      {product.show_in_distributor_portal ? (
                        <span className="text-green-600 text-sm">✓</span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">How to Use</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Select a company to view/edit their product catalog</li>
          <li>Check products to include in their portal, uncheck to hide</li>
          <li>Click "Save Custom Catalog" to create a custom product selection for this company</li>
          <li>If a company has no custom catalog, they see all products with "Default Portal" checked</li>
          <li>Delete a custom catalog to revert the company back to the default catalog</li>
        </ul>
      </div>
    </>
  );
}
