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
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm font-semibold text-white">Find Your Solutions</span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Step 1: Brand */}
        <div>
          <label htmlFor="brand" className="block text-sm font-bold text-white mb-2">
            1. Select Your Machine Brand
          </label>
          <select
            id="brand"
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full px-5 py-4 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-white text-gray-900 text-lg bg-white shadow-lg"
          >
            <option value="">Choose a brand...</option>
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
            <label htmlFor="shaft" className="block text-sm font-bold text-white mb-2">
              2. Select Your Shaft Size
            </label>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-white">Loading shaft options...</p>
              </div>
            ) : (
              <>
                <select
                  id="shaft"
                  value={selectedShaft}
                  onChange={(e) => handleShaftChange(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-white text-gray-900 text-lg bg-white shadow-lg"
                >
                  <option value="">Choose shaft size...</option>
                  {shaftOptions.map((shaft) => (
                    <option key={shaft.key} value={shaft.key}>
                      {shaft.display}
                    </option>
                  ))}
                </select>
                {shaftOptions.length === 0 && !loading && (
                  <p className="text-white/70 text-sm mt-2">
                    No shaft configurations found for {selectedBrand}. Contact us for compatibility information.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Product Count */}
        {productCount !== null && productCount > 0 && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-center">
            <p className="text-white font-bold text-lg">
              {productCount} compatible solutions found
            </p>
          </div>
        )}

        {/* CTA Button - show when shaft is selected */}
        {selectedShaft && (
          <button
            type="button"
            onClick={handleViewSolutions}
            className="w-full bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-3"
          >
            View Compatible Solutions
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        )}

      </div>
    </div>
  );
}
