/**
 * Brand Media Management Page
 * Upload and manage brand logos and hero images
 */

'use client';

import { useState, useEffect } from 'react';
import MediaUpload from '@/components/admin/MediaUpload';
import MediaImage from '@/components/shared/MediaImage';

interface Brand {
  brand_slug: string;
  brand_name: string;
  logo_url: string | null;
  hero_url: string | null;
}

export default function BrandMediaPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/brands');
      if (!response.ok) throw new Error('Failed to fetch brands');

      const data = await response.json();
      setBrands(data.brands || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (brandSlug: string, field: 'logo_url' | 'hero_url', url: string) => {
    setBrands((prev) =>
      prev.map((brand) =>
        brand.brand_slug === brandSlug ? { ...brand, [field]: url } : brand
      )
    );
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.brand_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Brand Media</h1>
          <div className="text-center py-12 text-gray-500">Loading brands...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Brand Media</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Media</h1>
          <p className="text-gray-600">Upload and manage brand logos and hero images</p>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brands..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div key={brand.brand_slug} className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{brand.brand_name}</h3>
              <p className="text-sm text-gray-500 mb-4 font-mono">{brand.brand_slug}</p>

              <div className="space-y-4">
                {/* Logo Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Brand Logo</label>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center p-4">
                    <MediaImage
                      src={brand.logo_url}
                      alt={`${brand.brand_name} logo`}
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </div>
                  <MediaUpload
                    mediaType="brand_logo"
                    identifier={brand.brand_slug}
                    table="brand_media"
                    column="logo_url"
                    recordId={brand.brand_slug}
                    idColumn="brand_slug"
                    currentUrl={brand.logo_url}
                    type="image"
                    compact
                    onUploadSuccess={(url) => handleUploadSuccess(brand.brand_slug, 'logo_url', url)}
                  />
                </div>

                {/* Hero Image Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hero Image</label>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <MediaImage
                      src={brand.hero_url}
                      alt={`${brand.brand_name} hero`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <MediaUpload
                    mediaType="brand_hero"
                    identifier={brand.brand_slug}
                    table="brand_media"
                    column="hero_url"
                    recordId={brand.brand_slug}
                    idColumn="brand_slug"
                    currentUrl={brand.hero_url}
                    type="image"
                    compact
                    onUploadSuccess={(url) => handleUploadSuccess(brand.brand_slug, 'hero_url', url)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-12 text-gray-500">No brands found matching "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
}
