/**
 * Image Test Page - Diagnostic tool
 * Shows uploaded image URLs and tests if they display
 */

'use client';

import { useState, useEffect } from 'react';
import MediaImage from '@/components/shared/MediaImage';
import Image from 'next/image';

export default function ImageTestPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=10');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Image Upload Diagnostic</h1>
        <p className="text-gray-600 mb-8">
          This page shows products with image_url values and tests if they display correctly.
        </p>

        <div className="space-y-8">
          {products.map((product) => (
            <div key={product.product_code} className="bg-white border-2 border-gray-300 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-2">{product.product_code}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Database Value */}
                <div>
                  <h3 className="font-bold text-sm mb-2">Database Value:</h3>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <code className="text-xs break-all">
                      {product.image_url || 'NULL'}
                    </code>
                  </div>
                </div>

                {/* MediaImage Component */}
                <div>
                  <h3 className="font-bold text-sm mb-2">MediaImage Component:</h3>
                  <div className="relative h-32 w-full bg-gray-100 rounded border border-gray-200 overflow-hidden">
                    <MediaImage
                      src={product.image_url}
                      alt={product.product_code}
                      fill
                      sizes="300px"
                    />
                  </div>
                </div>

                {/* Raw Next Image */}
                <div>
                  <h3 className="font-bold text-sm mb-2">Raw Next.js Image:</h3>
                  {product.image_url ? (
                    <div className="relative h-32 w-full bg-gray-100 rounded border border-gray-200 overflow-hidden">
                      <Image
                        src={product.image_url}
                        alt={product.product_code}
                        fill
                        sizes="300px"
                        className="object-cover"
                        onError={(e) => {
                          console.error('Image load error for', product.product_code, e);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-500">
                      No URL in database
                    </div>
                  )}
                </div>
              </div>

              {/* Test direct link */}
              {product.image_url && (
                <div className="mt-4">
                  <a
                    href={product.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Test direct link →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found with image_url values
          </div>
        )}
      </div>
    </div>
  );
}
