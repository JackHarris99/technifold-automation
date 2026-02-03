'use client';

import { useState, useMemo } from 'react';

interface Product {
  product_code: string;
  description: string;
  type: string;
  category: string | null;
  price: number | null;
  active: boolean;
  show_in_distributor_portal: boolean;
}

interface CatalogEntry {
  product_code: string;
  visible: boolean;
}

interface DistributorPricing {
  product_code: string;
  standard_price: number;
}

interface CompanyPricing {
  product_code: string;
  custom_price: number;
}

interface DistributorCatalogManagerProps {
  companyId: string;
  companyTier: string; // tier_1, tier_2, tier_3
  products: Product[];
  catalogEntries: CatalogEntry[];
  distributorPricing: DistributorPricing[];
  companyPricing: CompanyPricing[];
}

type ProductType = 'tool' | 'consumable';

export default function DistributorCatalogManager({
  companyId,
  companyTier,
  products,
  catalogEntries,
  distributorPricing,
  companyPricing,
}: DistributorCatalogManagerProps) {
  const [activeTab, setActiveTab] = useState<ProductType>('tool');
  const [searchTerm, setSearchTerm] = useState('');
  const [customPrices, setCustomPrices] = useState<{ [key: string]: string }>(() => {
    const prices: { [key: string]: string } = {};
    companyPricing.forEach(p => {
      prices[p.product_code] = p.custom_price.toString();
    });
    return prices;
  });

  // Calculate discount multiplier based on company tier
  const discountMultiplier = useMemo(() => {
    return companyTier === 'tier_1' ? 0.60 : // 40% off
           companyTier === 'tier_2' ? 0.70 : // 30% off
           0.80; // 20% off (tier_3 or default)
  }, [companyTier]);

  // Build pricing maps (legacy - now we calculate dynamically)
  const distPricingMap = useMemo(() => {
    const map = new Map<string, number>();
    distributorPricing.forEach(p => map.set(p.product_code, p.standard_price));
    return map;
  }, [distributorPricing]);

  // Get products in catalog
  const companyCatalogProducts = useMemo(() => {
    return new Set(
      catalogEntries
        .filter(e => e.visible)
        .map(e => e.product_code)
    );
  }, [catalogEntries]);

  // Filter and organize products by type and category
  const organizedProducts = useMemo(() => {
    const filtered = products
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

    // Separate by type
    const tools = filtered.filter(p => p.type === 'tool');
    const consumables = filtered.filter(p => p.type === 'consumable');

    // Group by category
    const groupByCategory = (prods: Product[]) => {
      const grouped = new Map<string, Product[]>();
      prods.forEach(p => {
        const cat = p.category || 'Uncategorized';
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat)!.push(p);
      });
      return grouped;
    };

    return {
      tools: {
        inCatalog: groupByCategory(tools.filter(p => companyCatalogProducts.has(p.product_code))),
        notInCatalog: groupByCategory(tools.filter(p => !companyCatalogProducts.has(p.product_code))),
      },
      consumables: {
        inCatalog: groupByCategory(consumables.filter(p => companyCatalogProducts.has(p.product_code))),
        notInCatalog: groupByCategory(consumables.filter(p => !companyCatalogProducts.has(p.product_code))),
      },
    };
  }, [products, searchTerm, companyCatalogProducts]);

  const handleAddProduct = async (productCode: string) => {
    try {
      const response = await fetch('/api/admin/product-catalogs/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          product_code: productCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to add product');

      alert('✓ Product added to catalog');
      window.location.reload();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const handleRemoveProduct = async (productCode: string) => {
    if (!confirm('Remove this product from the catalog?')) return;

    try {
      const response = await fetch('/api/admin/product-catalogs/remove-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          product_code: productCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to remove product');

      alert('✓ Product removed from catalog');
      window.location.reload();
    } catch (err) {
      alert('Failed to remove product');
    }
  };

  const handleSavePrice = async (productCode: string) => {
    const priceStr = customPrices[productCode];
    if (!priceStr || isNaN(parseFloat(priceStr))) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const response = await fetch('/api/admin/product-catalogs/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          product_code: productCode,
          custom_price: parseFloat(priceStr),
        }),
      });

      if (!response.ok) throw new Error('Failed to update price');

      alert('✓ Custom price saved');
      window.location.reload();
    } catch (err) {
      alert('Failed to save price');
    }
  };

  const handleClearPrice = async (productCode: string) => {
    if (!confirm('Clear custom price? Will revert to standard distributor pricing.')) return;

    try {
      const response = await fetch('/api/admin/product-catalogs/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          product_code: productCode,
          custom_price: null,
        }),
      });

      if (!response.ok) throw new Error('Failed to clear price');

      alert('✓ Custom price cleared');
      window.location.reload();
    } catch (err) {
      alert('Failed to clear price');
    }
  };

  const ProductRow = ({ product, inCatalog }: { product: Product; inCatalog: boolean }) => {
    // Calculate standard distributor price dynamically from base price * tier multiplier
    const standardPrice = product.price != null ? product.price * discountMultiplier : null;
    const customPrice = customPrices[product.product_code];
    const hasCustomPrice = companyPricing.some(p => p.product_code === product.product_code);

    return (
      <tr className="hover:bg-gray-50">
        <td className="py-3 px-4 font-mono text-sm text-gray-900">{product.product_code}</td>
        <td className="py-3 px-4 text-sm text-gray-800">{product.description}</td>
        <td className="py-3 px-4 text-right text-sm text-gray-600">
          {product.price != null ? `£${product.price.toFixed(2)}` : '-'}
        </td>
        <td className="py-3 px-4 text-right text-sm font-medium text-blue-600">
          {standardPrice != null ? `£${standardPrice.toFixed(2)}` : '-'}
        </td>
        <td className="py-3 px-4">
          {inCatalog ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={customPrice || ''}
                onChange={(e) => setCustomPrices({ ...customPrices, [product.product_code]: e.target.value })}
                placeholder="Custom price"
                className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <button
                onClick={() => handleSavePrice(product.product_code)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Save
              </button>
              {hasCustomPrice && (
                <button
                  onClick={() => handleClearPrice(product.product_code)}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500">-</span>
          )}
        </td>
        <td className="py-3 px-4 text-right">
          {inCatalog ? (
            <button
              onClick={() => handleRemoveProduct(product.product_code)}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              Remove
            </button>
          ) : (
            <button
              onClick={() => handleAddProduct(product.product_code)}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Add
            </button>
          )}
        </td>
      </tr>
    );
  };

  const CategorySection = ({
    title,
    categoryMap,
    inCatalog
  }: {
    title: string;
    categoryMap: Map<string, Product[]>;
    inCatalog: boolean;
  }) => {
    if (categoryMap.size === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          {inCatalog
            ? `No ${activeTab}s in custom catalog. Add products below.`
            : `No ${activeTab}s available. Try adjusting your search.`
          }
        </div>
      );
    }

    return (
      <>
        {Array.from(categoryMap.entries()).map(([category, prods]) => (
          <div key={category} className="mb-6">
            <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 text-sm">
              {category} ({prods.length})
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Base Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Std. Dist Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Custom Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prods.map(product => (
                  <ProductRow key={product.product_code} product={product} inCatalog={inCatalog} />
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </>
    );
  };

  const currentData = activeTab === 'tool' ? organizedProducts.tools : organizedProducts.consumables;
  const inCatalogCount = Array.from(currentData.inCatalog.values()).reduce((sum, arr) => sum + arr.length, 0);
  const notInCatalogCount = Array.from(currentData.notInCatalog.values()).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How This Works</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Add products</strong> to create a custom catalog for this distributor</li>
          <li><strong>Custom pricing</strong> overrides standard distributor pricing for this distributor only</li>
          <li><strong>If no custom catalog</strong> exists, distributor sees all products with "Show in Distributor Portal" checked</li>
        </ul>
      </div>

      {/* Product Type Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tool')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'tool'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveTab('consumable')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'consumable'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Consumables
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by code, description, or category..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* In Catalog */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-green-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">✓ In Catalog ({inCatalogCount})</h3>
        </div>
        <div className="overflow-x-auto">
          <CategorySection
            title="In Catalog"
            categoryMap={currentData.inCatalog}
            inCatalog={true}
          />
        </div>
      </div>

      {/* Not In Catalog */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Available Products ({notInCatalogCount})</h3>
        </div>
        <div className="overflow-x-auto">
          <CategorySection
            title="Available Products"
            categoryMap={currentData.notInCatalog}
            inCatalog={false}
          />
        </div>
      </div>
    </div>
  );
}
