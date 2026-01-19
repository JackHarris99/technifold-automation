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
  price: number | null; // Base sales price
  active: boolean;
  show_in_distributor_portal: boolean;
}

interface CatalogEntry {
  company_id: string;
  product_code: string;
  visible: boolean;
}

interface DistributorPricing {
  product_code: string;
  standard_price: number;
  currency: string;
}

interface CompanyPricing {
  company_id: string;
  product_code: string;
  custom_price: number;
  currency: string;
}

interface ProductCatalogClientV2Props {
  companies: Company[];
  products: Product[];
  catalogEntries: CatalogEntry[];
  distributorPricing: DistributorPricing[];
  companyPricing: CompanyPricing[];
}

export default function ProductCatalogClientV2({
  companies,
  products,
  catalogEntries,
  distributorPricing,
  companyPricing,
}: ProductCatalogClientV2Props) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customPrices, setCustomPrices] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  // Build pricing maps for quick lookup
  const distPricingMap = useMemo(() => {
    const map = new Map<string, number>();
    distributorPricing.forEach(p => map.set(p.product_code, p.standard_price));
    return map;
  }, [distributorPricing]);

  const companyPricingMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    companyPricing.forEach(p => {
      if (!map.has(p.company_id)) {
        map.set(p.company_id, new Map());
      }
      map.get(p.company_id)!.set(p.product_code, p.custom_price);
    });
    return map;
  }, [companyPricing]);

  // Get products in selected company's catalog
  const companyCatalogProducts = useMemo(() => {
    if (!selectedCompanyId) return new Set<string>();
    return new Set(
      catalogEntries
        .filter(e => e.company_id === selectedCompanyId && e.visible)
        .map(e => e.product_code)
    );
  }, [selectedCompanyId, catalogEntries]);

  // Initialize custom prices when company changes
  useMemo(() => {
    if (!selectedCompanyId) {
      setCustomPrices({});
      return;
    }

    const companyPrices = companyPricingMap.get(selectedCompanyId);
    if (companyPrices) {
      const prices: { [key: string]: string } = {};
      companyPrices.forEach((price, productCode) => {
        prices[productCode] = price.toString();
      });
      setCustomPrices(prices);
    } else {
      setCustomPrices({});
    }
  }, [selectedCompanyId, companyPricingMap]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.active)
      .filter(p => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          p.product_code.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search)
        );
      });
  }, [products, searchTerm]);

  // Split into in-catalog and not-in-catalog
  const productsInCatalog = filteredProducts.filter(p => companyCatalogProducts.has(p.product_code));
  const productsNotInCatalog = filteredProducts.filter(p => !companyCatalogProducts.has(p.product_code));

  const handleAddProduct = async (productCode: string) => {
    if (!selectedCompanyId) return;

    const customPrice = customPrices[productCode];

    try {
      const response = await fetch('/api/admin/product-catalogs/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          product_code: productCode,
          custom_price: customPrice ? parseFloat(customPrice) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add product');
      }

      window.location.reload();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRemoveProduct = async (productCode: string) => {
    if (!selectedCompanyId) return;

    if (!confirm('Remove this product from the catalog?')) return;

    try {
      const response = await fetch('/api/admin/product-catalogs/remove-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          product_code: productCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove product');
      }

      window.location.reload();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdatePrice = async (productCode: string) => {
    if (!selectedCompanyId) return;

    const customPrice = customPrices[productCode];
    if (!customPrice || isNaN(parseFloat(customPrice))) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const response = await fetch('/api/admin/product-catalogs/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          product_code: productCode,
          custom_price: parseFloat(customPrice),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update price');
      }

      alert('Custom price updated!');
      window.location.reload();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);

  const ProductRow = ({ product, inCatalog }: { product: Product; inCatalog: boolean }) => {
    const basePrice = product.price;
    const standardDistPrice = distPricingMap.get(product.product_code);
    const customPrice = customPrices[product.product_code];
    const hasCustomPrice = companyPricingMap.get(selectedCompanyId)?.has(product.product_code);

    return (
      <tr key={product.product_code} className="hover:bg-gray-50">
        <td className="py-3 px-4 font-mono text-sm text-gray-900">{product.product_code}</td>
        <td className="py-3 px-4 text-sm text-gray-800">{product.description}</td>
        <td className="py-3 px-4 text-sm text-gray-600">{product.category || '-'}</td>
        <td className="py-3 px-4 text-sm text-gray-600 text-right">
          {basePrice ? `£${basePrice.toFixed(2)}` : '-'}
        </td>
        <td className="py-3 px-4 text-sm text-gray-600 text-right">
          {standardDistPrice ? `£${standardDistPrice.toFixed(2)}` : '-'}
        </td>
        <td className="py-3 px-4">
          {inCatalog ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={customPrice || ''}
                onChange={(e) => setCustomPrices({ ...customPrices, [product.product_code]: e.target.value })}
                placeholder="Custom price"
                className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              {customPrice && customPrice !== companyPricingMap.get(selectedCompanyId)?.get(product.product_code)?.toString() && (
                <button
                  onClick={() => handleUpdatePrice(product.product_code)}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              )}
              {hasCustomPrice && (
                <span className="text-xs text-green-600 font-medium">✓ Set</span>
              )}
            </div>
          ) : (
            <input
              type="number"
              step="0.01"
              min="0"
              value={customPrice || ''}
              onChange={(e) => setCustomPrices({ ...customPrices, [product.product_code]: e.target.value })}
              placeholder="Optional"
              className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          )}
        </td>
        <td className="py-3 px-4">
          {inCatalog ? (
            <button
              onClick={() => handleRemoveProduct(product.product_code)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </button>
          ) : (
            <button
              onClick={() => handleAddProduct(product.product_code)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <>
      {/* Distributor Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Select Distributor</h3>
        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Select a distributor --</option>
          {companies.map(company => (
            <option key={company.company_id} value={company.company_id}>
              {company.company_name} ({company.type})
            </option>
          ))}
        </select>

        {selectedCompanyId && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              {companyCatalogProducts.size > 0 ? (
                <span>Custom Catalog: {companyCatalogProducts.size} products</span>
              ) : (
                <span>Using Default Catalog (no custom products set)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Product Search & Management */}
      {selectedCompanyId && (
        <>
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Search & Add Products</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product code, description, or category..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Products In Catalog */}
          {productsInCatalog.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                <h3 className="text-lg font-semibold text-green-900">
                  In {selectedCompany?.company_name}'s Catalog ({productsInCatalog.length} products)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Code</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Base Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Std Dist Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Custom Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productsInCatalog.map(product => (
                      <ProductRow key={product.product_code} product={product} inCatalog={true} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Available Products */}
          {productsNotInCatalog.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Available Products ({productsNotInCatalog.length})
                </h3>
                <p className="text-sm text-gray-600 mt-1">Click "Add" to include in this distributor's catalog</p>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Code</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Base Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Std Dist Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Custom Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productsNotInCatalog.map(product => (
                      <ProductRow key={product.product_code} product={product} inCatalog={false} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
