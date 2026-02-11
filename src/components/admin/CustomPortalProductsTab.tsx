/**
 * Custom Portal Products Tab
 * Manually add products to customer portals
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  company: {
    company_id: string;
    company_name: string;
  };
  customProducts: Array<{
    product_code: string;
    added_at: string;
  }>;
  allProducts: Array<{
    product_code: string;
    description: string;
    category: string;
  }>;
}

export default function CustomPortalProductsTab({ company, customProducts, allProducts }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter products by search term
  const filteredProducts = allProducts.filter(p =>
    p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get product details for custom products
  const customProductDetails = customProducts.map(cp => {
    const product = allProducts.find(p => p.product_code === cp.product_code);
    return {
      ...cp,
      description: product?.description || cp.product_code,
      category: product?.category || '',
    };
  });

  const handleAddProduct = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/custom-portal-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.company_id,
          product_code: selectedProduct,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      setSuccess(data.message);
      setSelectedProduct('');
      setSearchTerm('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productCode: string) => {
    if (!confirm('Remove this product from the customer portal?')) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/custom-portal-products?company_id=${company.company_id}&product_code=${productCode}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove product');
      }

      setSuccess(data.message);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Custom Portal Products</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manually add products to {company.company_name}'s portal (they'll appear in "Previously Ordered" section)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Add Product */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Add Product</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && filteredProducts.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredProducts.slice(0, 10).map((product) => (
                  <button
                    key={product.product_code}
                    onClick={() => {
                      setSelectedProduct(product.product_code);
                      setSearchTerm(product.description);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-mono text-xs text-gray-500">{product.product_code}</div>
                    <div className="text-sm text-gray-900">{product.description}</div>
                    {product.category && (
                      <div className="text-xs text-gray-500">{product.category}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleAddProduct}
            disabled={loading || !selectedProduct}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Custom Products List */}
      {customProductDetails.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Custom Products</h3>
          <p className="text-gray-600">Add products to show them in this customer's portal</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customProductDetails.map((product) => (
                <tr key={product.product_code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-xs text-gray-500">{product.product_code}</div>
                    <div className="text-sm font-medium text-gray-900">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.added_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleRemoveProduct(product.product_code)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
