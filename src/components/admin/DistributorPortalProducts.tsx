'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Product {
  product_code: string;
  description: string;
  type: string;
  category: string | null;
  price: number | null;
  image_url: string | null;
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

interface PurchasedProduct {
  product_code: string;
  total_quantity: number;
  last_purchased_at: string;
}

interface DistributorPortalProductsProps {
  companyId: string;
  companyTier: string; // tier_1, tier_2, tier_3
  products: Product[];
  catalogEntries: CatalogEntry[];
  distributorPricing: DistributorPricing[];
  companyPricing: CompanyPricing[];
  purchasedProducts: PurchasedProduct[];
}

export default function DistributorPortalProducts({
  companyId,
  companyTier,
  products,
  catalogEntries,
  distributorPricing,
  companyPricing,
  purchasedProducts,
}: DistributorPortalProductsProps) {
  const [customPrices, setCustomPrices] = useState<{ [key: string]: string }>(() => {
    const prices: { [key: string]: string } = {};
    companyPricing.forEach(p => {
      prices[p.product_code] = p.custom_price.toString();
    });
    return prices;
  });
  const [importing, setImporting] = useState(false);

  // Calculate discount multiplier based on company tier
  const discountMultiplier =
    companyTier === 'tier_1' ? 0.60 : // 40% off
    companyTier === 'tier_2' ? 0.70 : // 30% off
    0.80; // 20% off (tier_3)

  // Check if custom catalog exists
  const hasCustomCatalog = catalogEntries.some(e => e.visible);

  // Get products in catalog
  const catalogProductCodes = new Set(
    catalogEntries.filter(e => e.visible).map(e => e.product_code)
  );

  // Determine which products are visible in portal
  const portalProducts = products.filter(p => {
    if (hasCustomCatalog) {
      // If custom catalog exists, only show products in catalog
      return catalogProductCodes.has(p.product_code);
    } else {
      // If no custom catalog, show all products with show_in_distributor_portal = true
      return p.show_in_distributor_portal;
    }
  });

  // Build custom pricing map
  const companyPricingMap = new Map<string, number>();
  companyPricing.forEach(p => companyPricingMap.set(p.product_code, p.custom_price));

  // Get display price for a product
  const getDisplayPrice = (product: Product): { price: number; basePrice: number; type: 'custom' | 'tier' } => {
    const basePrice = product.price || 0;
    const customPrice = companyPricingMap.get(product.product_code);

    if (customPrice !== undefined) {
      return { price: customPrice, basePrice, type: 'custom' };
    }

    // Calculate dynamic tier pricing
    const tierPrice = basePrice * discountMultiplier;
    return { price: tierPrice, basePrice, type: 'tier' };
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

  const handleImportAll = async () => {
    if (!confirm(`Import all ${purchasedProducts.length} purchased products to this distributor's catalog?\n\nThey will be visible at their tier-based discount (${companyTier === 'tier_1' ? '40%' : companyTier === 'tier_2' ? '30%' : '20%'} off base prices), unless you set custom prices.`)) {
      return;
    }

    setImporting(true);

    try {
      // Add all purchased products to catalog
      const promises = purchasedProducts.map(p =>
        fetch('/api/admin/product-catalogs/add-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            product_code: p.product_code,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
          }
          return { success: true, product_code: p.product_code };
        }).catch((err) => {
          return { success: false, product_code: p.product_code, error: err.message };
        })
      );

      const results = await Promise.allSettled(promises);

      // Count successes and failures
      const succeeded: string[] = [];
      const failed: Array<{ product_code: string; error: string }> = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            succeeded.push(result.value.product_code);
          } else {
            failed.push({ product_code: result.value.product_code, error: result.value.error || 'Unknown error' });
          }
        } else {
          failed.push({ product_code: purchasedProducts[index].product_code, error: result.reason?.message || 'Unknown error' });
        }
      });

      // Show detailed results
      if (failed.length === 0) {
        alert(`✓ Successfully imported all ${succeeded.length} products to catalog`);
        window.location.reload();
      } else if (succeeded.length === 0) {
        alert(`✗ Failed to import any products.\n\nAll ${failed.length} products failed. First error: ${failed[0].error}`);
      } else {
        const failedCodes = failed.map(f => f.product_code).join(', ');
        alert(`⚠ Partial import completed:\n\n✓ ${succeeded.length} products imported successfully\n✗ ${failed.length} products failed: ${failedCodes}\n\nFirst error: ${failed[0].error}`);
        window.location.reload();
      }
    } catch (err) {
      alert('Failed to import products: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setImporting(false);
    }
  };

  if (!hasCustomCatalog) {
    return (
      <div className="space-y-6">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">No Custom Catalog Assigned</h3>
          <p className="text-sm text-blue-800 mb-4">
            This distributor currently sees <strong>all products</strong> marked as "Show in Distributor Portal" ({portalProducts.length} products).
          </p>
          <p className="text-sm text-blue-800 mb-4">
            To customize which products this distributor can see, you can:
          </p>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside mb-4">
            <li>Import all products they've previously purchased (recommended starting point)</li>
            <li>Manually add products via the "Catalog & Pricing" tab</li>
          </ul>
          <button
            onClick={handleImportAll}
            disabled={importing || purchasedProducts.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : `Import All ${purchasedProducts.length} Purchased Products`}
          </button>
        </div>

        {/* Preview of what they see */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Current Portal Products (Default) ({portalProducts.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              These products are currently visible in the distributor portal
            </p>
          </div>
          <div className="p-6">
            {portalProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products marked for distributor portal</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portalProducts.slice(0, 12).map(product => {
                  const { price, basePrice, type } = getDisplayPrice(product);
                  return (
                    <div key={product.product_code} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                          <Image
                            src={product.image_url || '/product-placeholder.svg'}
                            alt={product.description}
                            fill
                            className="object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/product-placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{product.description}</div>
                          <div className="text-xs text-gray-600 mt-1">SKU: {product.product_code}</div>
                          <div className="mt-2 space-y-0.5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold text-green-600">
                                £{price.toFixed(2)}
                              </span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                type === 'custom' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {type === 'custom' ? 'Custom' : `Tier ${companyTier.slice(-1)}`}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              RRP: £{basePrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {portalProducts.length > 12 && (
              <p className="text-sm text-gray-600 text-center mt-4">
                Showing first 12 of {portalProducts.length} products
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Has custom catalog - show editable products
  return (
    <div className="space-y-6">
      {/* Header with import button */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Custom Catalog Active</h3>
          <p className="text-sm text-gray-600">This distributor has {portalProducts.length} products in their custom catalog</p>
        </div>
        <button
          onClick={handleImportAll}
          disabled={importing || purchasedProducts.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {importing ? 'Importing...' : `Import ${purchasedProducts.length} Purchased Products`}
        </button>
      </div>

      {/* Portal Products Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Portal Products ({portalProducts.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Products visible in this distributor's portal with pricing
          </p>
        </div>
        <div className="p-6">
          {portalProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products in custom catalog</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portalProducts.map(product => {
                const { price, basePrice, type } = getDisplayPrice(product);
                const customPrice = customPrices[product.product_code];
                const hasCustomPrice = companyPricingMap.has(product.product_code);

                return (
                  <div key={product.product_code} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                        <Image
                          src={product.image_url || '/product-placeholder.svg'}
                          alt={product.description}
                          fill
                          className="object-contain p-1"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/product-placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{product.description}</div>
                        <div className="text-xs text-gray-600 mt-1">SKU: {product.product_code}</div>
                        <div className="text-xs text-gray-500 mt-1">{product.category || 'Uncategorized'}</div>
                      </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-gray-600">Their Price:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-green-600">£{price.toFixed(2)}</span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              type === 'custom' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {type === 'custom' ? 'Custom' : `Tier ${companyTier.slice(-1)}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-gray-600">RRP (Full):</span>
                          <span className="text-gray-900">£{basePrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Custom Price Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={customPrice || ''}
                          onChange={(e) => setCustomPrices({ ...customPrices, [product.product_code]: e.target.value })}
                          placeholder="Set custom price"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button
                          onClick={() => handleSavePrice(product.product_code)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
