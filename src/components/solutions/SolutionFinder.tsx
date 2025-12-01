'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShaftOption {
  key: string;
  display: string; // "35mm" or "20mm (36mm OD)" if disambiguation needed
  shaft_size_mm: number;
  outer_diameter_mm: number;
}

export default function SolutionFinder() {
  const router = useRouter();
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [shaftOptions, setShaftOptions] = useState<ShaftOption[]>([]);
  const [selectedShaft, setSelectedShaft] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);

  // Fetch brands on mount
  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch('/api/machines/brands');
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (error) {
        console.error('[SolutionFinder] Failed to fetch brands:', error);
      }
    }
    fetchBrands();
  }, []);

  // Fetch shaft options when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setShaftOptions([]);
      setSelectedShaft('');
      setProductCount(null);
      return;
    }

    async function fetchShaftOptions() {
      setLoading(true);
      try {
        const response = await fetch(`/api/solutions/shafts?brand=${encodeURIComponent(selectedBrand)}`);
        const data = await response.json();
        setShaftOptions(data.shafts || []);
      } catch (error) {
        console.error('[SolutionFinder] Failed to fetch shaft options:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchShaftOptions();
  }, [selectedBrand]);

  // Fetch product count when shaft selected
  useEffect(() => {
    if (!selectedBrand || !selectedShaft) {
      setProductCount(null);
      return;
    }

    const shaft = shaftOptions.find(s => s.key === selectedShaft);
    if (!shaft) return;

    async function fetchProductCount() {
      try {
        const response = await fetch(
          `/api/compatibility?brand=${encodeURIComponent(selectedBrand)}&shaft_size_mm=${shaft!.shaft_size_mm}&outer_diameter_mm=${shaft!.outer_diameter_mm}`
        );
        const data = await response.json();
        setProductCount(data.total_compatible_products || 0);
      } catch (error) {
        console.error('[SolutionFinder] Failed to fetch product count:', error);
        setProductCount(null);
      }
    }

    fetchProductCount();
  }, [selectedBrand, selectedShaft, shaftOptions]);

  const handleViewSolutions = () => {
    if (!selectedBrand || !selectedShaft) return;
    const shaft = shaftOptions.find(s => s.key === selectedShaft);
    if (!shaft) return;
    // URL uses display value (e.g., "35mm" or "20mm (36mm OD)")
    const url = `/solutions/${encodeURIComponent(selectedBrand)}/${encodeURIComponent(shaft.display)}`;
    router.push(url);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedShaft('');
    setShaftOptions([]);
    setProductCount(null);
  };

  const handleShaftChange = (shaft: string) => {
    setSelectedShaft(shaft);
  };

  return (
    <div className="bg-white border-2 border-gray-300 p-6">
      <div className="mb-4 pb-3 border-b-2 border-gray-300">
        <div className="inline-block bg-orange-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
          Compatibility Finder
        </div>
        <h2 className="text-xl font-bold text-gray-900">Find Compatible Products</h2>
      </div>

      <div className="space-y-4">
        {/* Step 1: Brand */}
        <div>
          <label htmlFor="brand" className="block text-sm font-bold text-gray-900 mb-2">
            1. Machine Brand
          </label>
          <select
            id="brand"
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
          >
            <option value="">Select brand...</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Shaft Size - always show after brand selected */}
        {selectedBrand && (
          <div>
            <label htmlFor="shaft" className="block text-sm font-bold text-gray-900 mb-2">
              2. Shaft Size
            </label>
            {loading ? (
              <div className="bg-gray-100 border border-gray-300 p-4 text-center">
                <p className="text-gray-700 text-sm">Loading shaft options...</p>
              </div>
            ) : (
              <>
                <select
                  id="shaft"
                  value={selectedShaft}
                  onChange={(e) => handleShaftChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                >
                  <option value="">Select shaft size...</option>
                  {shaftOptions.map((shaft) => (
                    <option key={shaft.key} value={shaft.key}>
                      {shaft.display}
                    </option>
                  ))}
                </select>
                {shaftOptions.length === 0 && !loading && (
                  <p className="text-gray-600 text-sm mt-2">
                    No shaft configurations found for {selectedBrand}. Contact us for compatibility information.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Product Count */}
        {productCount !== null && productCount > 0 && (
          <div className="bg-green-50 border-2 border-green-500 p-4 text-center">
            <p className="text-gray-900 font-bold text-base">
              {productCount} compatible {productCount === 1 ? 'solution' : 'solutions'} found
            </p>
          </div>
        )}

        {/* CTA Button - show when shaft is selected */}
        {selectedShaft && (
          <button
            type="button"
            onClick={handleViewSolutions}
            className="w-full bg-orange-500 text-white px-6 py-3 font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            View Compatible Solutions →
          </button>
        )}

      </div>
    </div>
  );
}
