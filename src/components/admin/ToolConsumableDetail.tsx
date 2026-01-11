'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  product_code: string;
  description: string | null;
  price?: number | null;
  rental_price_monthly?: number | null;
  type?: string;
  category?: string | null;
  image_url?: string | null;
}

interface ToolConsumableDetailProps {
  tool: Product;
  linkedConsumables: Product[];
  allConsumables: Product[];
  linkedConsumableCodes: string[];
}

export default function ToolConsumableDetail({
  tool,
  linkedConsumables: initialLinkedConsumables,
  allConsumables,
  linkedConsumableCodes: initialLinkedCodes,
}: ToolConsumableDetailProps) {
  const [linkedConsumables, setLinkedConsumables] = useState(initialLinkedConsumables);
  const [linkedCodes, setLinkedCodes] = useState(new Set(initialLinkedCodes));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Group available consumables by category
  const consumablesByCategory = useMemo(() => {
    const groups = new Map<string, Product[]>();
    allConsumables.forEach((c) => {
      const category = c.category || 'Uncategorized';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push(c);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allConsumables]);

  const categories = ['all', ...consumablesByCategory.map(([cat]) => cat)];

  // Filter available consumables (not already linked)
  const availableConsumables = useMemo(() => {
    let filtered = allConsumables.filter(c => !linkedCodes.has(c.product_code));

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => (c.category || 'Uncategorized') === selectedCategory);
    }

    return filtered;
  }, [allConsumables, linkedCodes, searchTerm, selectedCategory]);

  const handleRemove = async (consumableCode: string) => {
    if (!confirm(`Remove ${consumableCode} from ${tool.product_code}?`)) return;

    try {
      const response = await fetch('/api/admin/tool-consumables/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          tool_code: tool.product_code,
          consumable_code: consumableCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to remove');

      setLinkedConsumables(linkedConsumables.filter(c => c.product_code !== consumableCode));
      setLinkedCodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(consumableCode);
        return newSet;
      });
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleAdd = async (consumableCode: string) => {
    setIsAdding(true);
    try {
      const response = await fetch('/api/admin/tool-consumables/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          tool_code: tool.product_code,
          consumable_code: consumableCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add');
      }

      const consumable = allConsumables.find(c => c.product_code === consumableCode);
      if (consumable) {
        setLinkedConsumables([...linkedConsumables, consumable].sort((a, b) => {
          const catCompare = (a.category || 'Uncategorized').localeCompare(b.category || 'Uncategorized');
          if (catCompare !== 0) return catCompare;
          return a.product_code.localeCompare(b.product_code);
        }));
        setLinkedCodes(prev => new Set([...prev, consumableCode]));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-[1800px] mx-auto p-6">
      {/* Header with Tool Info */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin/tool-consumables"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Back to All Tools
          </Link>
        </div>

        <div className="flex items-start gap-8">
          {/* Tool Image */}
          <div className="relative w-48 h-48 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border-2 border-gray-200">
            {tool.image_url ? (
              <Image
                src={tool.image_url}
                alt={tool.description || tool.product_code}
                fill
                className="object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Tool Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.product_code}</h1>
            <p className="text-lg text-gray-600 mb-4">{tool.description}</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-900">{linkedConsumables.length}</div>
                <div className="text-sm text-blue-700">Linked Consumables</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-900">{availableConsumables.length}</div>
                <div className="text-sm text-green-700">Available to Add</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">
                  {tool.rental_price_monthly ? `£${tool.rental_price_monthly}` : 'N/A'}
                </div>
                <div className="text-sm text-purple-700">Monthly Rental</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Linked Consumables */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Linked Consumables ({linkedConsumables.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              These consumables are compatible with this tool
            </p>
          </div>

          <div className="p-6 max-h-[800px] overflow-y-auto">
            {linkedConsumables.length === 0 ? (
              <div className="text-center py-12 text-gray-700">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>No consumables linked yet</p>
                <p className="text-sm mt-2">Add consumables from the right panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {linkedConsumables.map((consumable) => (
                  <div
                    key={consumable.product_code}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    {/* Consumable Image */}
                    <div className="relative w-20 h-20 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                      {consumable.image_url ? (
                        <Image
                          src={consumable.image_url}
                          alt={consumable.description || consumable.product_code}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{consumable.product_code}</p>
                      <p className="text-sm text-gray-600 truncate">{consumable.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {consumable.category || 'Uncategorized'}
                        </span>
                        {consumable.price && (
                          <span className="text-xs text-gray-600">£{consumable.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(consumable.product_code)}
                      className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Available Consumables to Add */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Add Consumables
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Search and add compatible consumables
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* Available Consumables List */}
            <div className="max-h-[600px] overflow-y-auto space-y-3">
              {availableConsumables.length === 0 ? (
                <div className="text-center py-12 text-gray-700">
                  <p>No consumables found</p>
                  <p className="text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                availableConsumables.map((consumable) => (
                  <div
                    key={consumable.product_code}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                  >
                    {/* Consumable Image */}
                    <div className="relative w-16 h-16 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                      {consumable.image_url ? (
                        <Image
                          src={consumable.image_url}
                          alt={consumable.description || consumable.product_code}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{consumable.product_code}</p>
                      <p className="text-xs text-gray-600 truncate">{consumable.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {consumable.category || 'Uncategorized'}
                        </span>
                        {consumable.price && (
                          <span className="text-xs text-gray-600">£{consumable.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleAdd(consumable.product_code)}
                      disabled={isAdding}
                      className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex-shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
