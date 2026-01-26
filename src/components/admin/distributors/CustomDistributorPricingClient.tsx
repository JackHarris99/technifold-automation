/**
 * Custom Distributor Pricing Client Component
 * Manage company-specific distributor pricing
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  product_code: string;
  description: string;
  price: number | null;
  type: string;
  category: string;
  active: boolean;
  standard_distributor_price?: number;
}

interface CustomPrice {
  company_id: string;
  product_code: string;
  price: number;
}

interface Company {
  company_id: string;
  company_name: string;
  sage_customer_code: string | null;
}

interface Props {
  company: Company;
  products: Product[];
  customPricing: CustomPrice[];
}

export default function CustomDistributorPricingClient({
  company,
  products,
  customPricing,
}: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingPrices, setEditingPrices] = useState<Map<string, string>>(new Map());

  // Create map of custom pricing for quick lookup
  const customPricingMap = new Map(customPricing.map(p => [p.product_code, p.price]));

  // Filter products
  const filteredProducts = products.filter(
    (product) =>
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get effective price (custom > standard > base)
  const getEffectivePrice = (product: Product): number => {
    return (
      customPricingMap.get(product.product_code) ||
      product.standard_distributor_price ||
      product.price
    );
  };

  // Handle price update
  const handlePriceUpdate = async (productCode: string, newPrice: string) => {
    if (!newPrice || isNaN(parseFloat(newPrice))) {
      alert('Please enter a valid price');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/distributors/custom-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.company_id,
          product_code: productCode,
          price: parseFloat(newPrice),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update price');
      }

      // Clear editing state
      const newEditingPrices = new Map(editingPrices);
      newEditingPrices.delete(productCode);
      setEditingPrices(newEditingPrices);

      router.refresh();
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle price removal
  const handlePriceRemoval = async (productCode: string) => {
    if (!confirm('Remove custom pricing for this product? It will revert to standard pricing.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/distributors/custom-pricing', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.company_id,
          product_code: productCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove price');
      }

      router.refresh();
    } catch (error) {
      console.error('Error removing price:', error);
      alert('Failed to remove price. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Check if product has custom pricing
  const hasCustomPricing = (productCode: string): boolean => {
    return customPricingMap.has(productCode);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Company Header */}
      <div className="p-6 border-b border-gray-200 bg-teal-50">
        <h2 className="text-xl font-semibold text-gray-900">{company.company_name}</h2>
        {company.sage_customer_code && (
          <p className="text-sm text-gray-700 mt-1">Code: {company.sage_customer_code}</p>
        )}
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <div className="mt-2 text-sm text-gray-700">
          Showing {filteredProducts.length} of {products.length} products
          {' • '}
          {customPricing.length} custom price{customPricing.length !== 1 ? 's' : ''} set
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Base Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Standard Dist. Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Custom Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-700">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isEditing = editingPrices.has(product.product_code);
                const customPrice = customPricingMap.get(product.product_code);

                return (
                  <tr
                    key={product.product_code}
                    className={`hover:bg-gray-50 ${hasCustomPricing(product.product_code) ? 'bg-teal-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.product_code}
                      </div>
                      <div className="text-sm text-gray-700">{product.description}</div>
                      <div className="text-xs text-gray-600">
                        {product.type} • {product.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {product.price != null ? `£${product.price.toFixed(2)}` : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {product.standard_distributor_price
                          ? `£${product.standard_distributor_price.toFixed(2)}`
                          : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={customPrice?.toFixed(2) || ''}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handlePriceUpdate(
                                product.product_code,
                                (e.target as HTMLInputElement).value
                              );
                            } else if (e.key === 'Escape') {
                              const newEditingPrices = new Map(editingPrices);
                              newEditingPrices.delete(product.product_code);
                              setEditingPrices(newEditingPrices);
                            }
                          }}
                          className="w-28 px-2 py-1 border border-teal-300 rounded text-sm text-right focus:ring-2 focus:ring-teal-500"
                          autoFocus
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${customPrice ? 'text-teal-700' : 'text-gray-500'}`}>
                          {customPrice ? `£${customPrice.toFixed(2)}` : '—'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              const input = document.querySelector(
                                `input[type="number"]:focus`
                              ) as HTMLInputElement;
                              if (input) {
                                handlePriceUpdate(product.product_code, input.value);
                              }
                            }}
                            disabled={saving}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              const newEditingPrices = new Map(editingPrices);
                              newEditingPrices.delete(product.product_code);
                              setEditingPrices(newEditingPrices);
                            }}
                            disabled={saving}
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              const newEditingPrices = new Map(editingPrices);
                              newEditingPrices.set(product.product_code, '');
                              setEditingPrices(newEditingPrices);
                            }}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            {customPrice ? 'Edit' : 'Set Price'}
                          </button>
                          {customPrice && (
                            <button
                              onClick={() => handlePriceRemoval(product.product_code)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
