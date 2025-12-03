/**
 * MachineFinder Component
 *
 * Flexible cross-filtering machine selector:
 * - Type, Brand, Model dropdowns can be selected in any order
 * - Each selection filters the other dropdowns
 * - Model requires at least Type OR Brand selected
 * - Supports partial selection for fallback pages
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
  count: number;
  types: string[];
}

interface Model {
  model: string;
  slug: string;
  type?: string;
  brand?: string;
}

interface ModelGroup {
  type: string;
  displayName: string;
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

  // All available options (unfiltered)
  const [allTypes, setAllTypes] = useState<MachineType[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  // Filtered options based on selections
  const [filteredTypes, setFilteredTypes] = useState<MachineType[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [modelGroups, setModelGroups] = useState<ModelGroup[]>([]);
  const [isModelsGrouped, setIsModelsGrouped] = useState(false);

  // Selections
  const [selectedType, setSelectedType] = useState<MachineType | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Loading states
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch all types and brands on mount
  useEffect(() => {
    async function fetchInitialData() {
      setLoadingTypes(true);
      setLoadingBrands(true);
      try {
        const [typesRes, brandsRes] = await Promise.all([
          fetch('/api/machines/types'),
          fetch('/api/machines/brands'),
        ]);
        const typesData = await typesRes.json();
        const brandsData = await brandsRes.json();

        setAllTypes(typesData.types || []);
        setFilteredTypes(typesData.types || []);
        setAllBrands(brandsData.brands || []);
        setFilteredBrands(brandsData.brands || []);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setLoadingTypes(false);
        setLoadingBrands(false);
      }
    }
    fetchInitialData();
  }, []);

  // Update filtered types when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setFilteredTypes(allTypes);
      return;
    }

    // Filter types to only those that have this brand
    const brandTypes = selectedBrand.types;
    const filtered = allTypes.filter(t => brandTypes.includes(t.type));
    setFilteredTypes(filtered);

    // If current type selection is not in filtered list, clear it
    if (selectedType && !brandTypes.includes(selectedType.type)) {
      setSelectedType(null);
    }
  }, [selectedBrand, allTypes]);

  // Update filtered brands when type changes
  useEffect(() => {
    if (!selectedType) {
      setFilteredBrands(allBrands);
      return;
    }

    // Filter brands to only those that have this type
    const filtered = allBrands.filter(b => b.types.includes(selectedType.type));
    setFilteredBrands(filtered);

    // If current brand selection is not in filtered list, clear it
    if (selectedBrand && !selectedBrand.types.includes(selectedType.type)) {
      setSelectedBrand(null);
    }
  }, [selectedType, allBrands]);

  // Fetch models when type or brand is selected
  useEffect(() => {
    // Clear models if nothing selected
    if (!selectedType && !selectedBrand) {
      setModels([]);
      setModelGroups([]);
      setSelectedModel(null);
      return;
    }

    async function fetchModels() {
      setLoadingModels(true);
      try {
        const params = new URLSearchParams();
        if (selectedType) params.set('type', selectedType.type);
        if (selectedBrand) params.set('brand', selectedBrand.brand);

        const response = await fetch(`/api/machines/models?${params}`);
        const data = await response.json();

        if (data.grouped) {
          setModelGroups(data.modelGroups || []);
          setModels([]);
          setIsModelsGrouped(true);
        } else {
          setModels(data.models || []);
          setModelGroups([]);
          setIsModelsGrouped(false);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoadingModels(false);
      }
    }

    fetchModels();
    setSelectedModel(null);
  }, [selectedType, selectedBrand]);

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
    const type = filteredTypes.find(t => t.type === e.target.value);
    setSelectedType(type || null);
    setSelectedModel(null);
  };

  const handleBrandSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = filteredBrands.find(b => b.brand === e.target.value);
    setSelectedBrand(brand || null);
    setSelectedModel(null);
  };

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    if (!slug) {
      setSelectedModel(null);
      return;
    }

    // Find in flat list or grouped
    if (isModelsGrouped) {
      for (const group of modelGroups) {
        const found = group.models.find(m => m.slug === slug);
        if (found) {
          setSelectedModel({ ...found, type: group.type });
          return;
        }
      }
    } else {
      const found = models.find(m => m.slug === slug);
      setSelectedModel(found || null);
    }
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
    } else if (selectedBrand) {
      // Brand only - go to brand fallback page
      router.push(`/machines/brand/${selectedBrand.slug}`);
    }
  };

  const canProceed = selectedType !== null || selectedBrand !== null;
  const canSelectModel = selectedType !== null || selectedBrand !== null;

  // Generate button text
  const getButtonText = () => {
    if (selectedModel) {
      return `View ${selectedModel.model} Solutions`;
    }
    if (selectedType && selectedBrand) {
      return `View ${selectedBrand.brand} ${selectedType.displayName} Solutions`;
    }
    if (selectedBrand) {
      return `View All ${selectedBrand.brand} Solutions`;
    }
    if (selectedType) {
      return `View All ${selectedType.displayName} Solutions`;
    }
    return 'Select Your Machine';
  };

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

      <div className="text-xs text-gray-400 text-center">or select below (any order)</div>

      {/* Three Dropdowns - All Independently Selectable */}
      <div className="space-y-3">
        {/* Type Dropdown */}
        <select
          value={selectedType?.type || ''}
          onChange={handleTypeSelect}
          disabled={loadingTypes}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
        >
          <option value="" className="text-gray-900">
            {loadingTypes ? 'Loading...' : 'Select machine type...'}
          </option>
          {filteredTypes.map((type) => (
            <option key={type.type} value={type.type} className="text-gray-900">
              {type.displayName} ({type.count})
            </option>
          ))}
        </select>

        {/* Brand Dropdown */}
        <select
          value={selectedBrand?.brand || ''}
          onChange={handleBrandSelect}
          disabled={loadingBrands}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
        >
          <option value="" className="text-gray-900">
            {loadingBrands ? 'Loading...' : 'Select brand...'}
          </option>
          {filteredBrands.map((brand) => (
            <option key={brand.brand} value={brand.brand} className="text-gray-900">
              {brand.brand} ({brand.count})
            </option>
          ))}
        </select>

        {/* Model Dropdown */}
        <select
          value={selectedModel?.slug || ''}
          onChange={handleModelSelect}
          disabled={!canSelectModel || loadingModels}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="text-gray-900">
            {!canSelectModel
              ? 'Select type or brand first...'
              : loadingModels
              ? 'Loading models...'
              : 'Select model...'}
          </option>
          {isModelsGrouped ? (
            // Grouped by type (when brand-only selected)
            modelGroups.map((group) => (
              <optgroup key={group.type} label={group.displayName} className="text-gray-900">
                {group.models.map((model) => (
                  <option key={model.slug} value={model.slug} className="text-gray-900">
                    {model.model}
                  </option>
                ))}
              </optgroup>
            ))
          ) : (
            // Flat list
            models.map((model) => (
              <option key={model.slug} value={model.slug} className="text-gray-900">
                {model.model}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Find Machine Button */}
      <button
        onClick={handleFindMachine}
        disabled={!canProceed}
        className="w-full py-3 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {getButtonText()}
      </button>

      {/* Helper text */}
      {(selectedType || selectedBrand) && !selectedModel && (
        <p className="text-xs text-gray-400 text-center">
          Don't know your exact model? We'll show you all compatible solutions.
        </p>
      )}
    </div>
  );
}
