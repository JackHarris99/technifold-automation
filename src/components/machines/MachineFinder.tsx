/**
 * MachineFinder Component
 *
 * Single-step instant selector on homepage:
 * - Three dropdowns: Type → Brand → Model (each filters the next)
 * - "Find Your Machine" button takes user directly to the page
 * - Works with partial selection (type only, type+brand, or full)
 * - All pages use slugs: /machines/[slug]
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface MachineType {
  type: string;
  slug: string;
  displayName: string;
  count: number;
}

interface Brand {
  brand: string;
  slug: string;
  modelCount: number;
  models: Array<{ model: string; slug: string }>;
}

interface SearchResult {
  machine_id: string;
  brand: string;
  model: string;
  display_name: string;
  type: string;
  typeDisplay: string;
  slug: string;
}

export default function MachineFinder() {
  const router = useRouter();

  // Selection state - all on one page
  const [types, setTypes] = useState<MachineType[]>([]);
  const [selectedType, setSelectedType] = useState<MachineType | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ model: string; slug: string } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Loading
  const [loading, setLoading] = useState(false);

  // Fetch types on mount
  useEffect(() => {
    async function fetchTypes() {
      try {
        const response = await fetch('/api/machines/types');
        const data = await response.json();
        setTypes(data.types || []);
      } catch (error) {
        console.error('Failed to fetch types:', error);
      }
    }
    fetchTypes();
  }, []);

  // Fetch brands when type selected
  useEffect(() => {
    if (!selectedType) {
      setBrands([]);
      setSelectedBrand(null);
      setSelectedModel(null);
      return;
    }

    async function fetchBrands() {
      setLoading(true);
      try {
        const response = await fetch(`/api/machines/by-type?type=${selectedType.type}`);
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBrands();
  }, [selectedType]);

  // Reset model when brand changes
  useEffect(() => {
    setSelectedModel(null);
  }, [selectedBrand]);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/machines/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = types.find(t => t.type === e.target.value);
    setSelectedType(type || null);
    setSelectedBrand(null);
    setSelectedModel(null);
  };

  const handleBrandSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = brands.find(b => b.brand === e.target.value);
    setSelectedBrand(brand || null);
    setSelectedModel(null);
  };

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedBrand) return;
    const model = selectedBrand.models.find(m => m.slug === e.target.value);
    setSelectedModel(model || null);
  };

  const handleSearchSelect = (result: SearchResult) => {
    router.push(`/machines/${result.slug}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleFindMachine = () => {
    if (selectedModel) {
      // Full selection - go to specific machine page
      router.push(`/machines/${selectedModel.slug}`);
    } else if (selectedType && selectedBrand) {
      // Type + Brand - go to type-brand fallback page
      router.push(`/machines/${selectedType.slug}/${selectedBrand.slug}`);
    } else if (selectedType) {
      // Type only - go to type fallback page
      router.push(`/machines/${selectedType.slug}`);
    }
  };

  const canSearch = selectedType !== null;

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div ref={searchRef} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          placeholder="Quick search: type brand or model..."
          className="w-full px-4 py-2 text-sm border border-white/20 bg-white/10 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.machine_id}
                onClick={() => handleSearchSelect(result)}
                className="w-full px-4 py-2 text-left hover:bg-orange-50 border-b border-gray-100 last:border-0"
              >
                <div className="font-medium text-gray-900 text-sm">{result.display_name}</div>
                <div className="text-xs text-gray-500">{result.typeDisplay}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 text-center">or select below</div>

      {/* Three Dropdowns - All Visible */}
      <div className="space-y-3">
        {/* Type Dropdown */}
        <select
          value={selectedType?.type || ''}
          onChange={handleTypeSelect}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="" className="text-gray-900">Select machine type...</option>
          {types.map((type) => (
            <option key={type.type} value={type.type} className="text-gray-900">
              {type.displayName} ({type.count})
            </option>
          ))}
        </select>

        {/* Brand Dropdown */}
        <select
          value={selectedBrand?.brand || ''}
          onChange={handleBrandSelect}
          disabled={!selectedType || loading}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="text-gray-900">
            {!selectedType ? 'Select type first...' : loading ? 'Loading brands...' : 'Select brand...'}
          </option>
          {brands.map((brand) => (
            <option key={brand.brand} value={brand.brand} className="text-gray-900">
              {brand.brand} ({brand.modelCount})
            </option>
          ))}
        </select>

        {/* Model Dropdown */}
        <select
          value={selectedModel?.slug || ''}
          onChange={handleModelSelect}
          disabled={!selectedBrand}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="text-gray-900">
            {!selectedBrand ? 'Select brand first...' : 'Select model...'}
          </option>
          {selectedBrand?.models.map((model) => (
            <option key={model.slug} value={model.slug} className="text-gray-900">
              {model.model}
            </option>
          ))}
        </select>
      </div>

      {/* Find Machine Button */}
      <button
        onClick={handleFindMachine}
        disabled={!canSearch}
        className="w-full py-3 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedModel
          ? `View ${selectedModel.model} Solutions`
          : selectedBrand
          ? `View All ${selectedBrand.brand} Solutions`
          : selectedType
          ? `View All ${selectedType.displayName} Solutions`
          : 'Select Your Machine'}
      </button>

      {/* Helper text */}
      {selectedType && !selectedModel && (
        <p className="text-xs text-gray-400 text-center">
          Don't know your exact model? Just select type {selectedBrand ? 'or brand ' : ''}and we'll show you all options.
        </p>
      )}
    </div>
  );
}
