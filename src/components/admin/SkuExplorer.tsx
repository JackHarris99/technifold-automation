/**
 * SKU Explorer Component
 * Search, view, and edit SKU details
 */

'use client';

import { useState, useEffect } from 'react';

interface SkuOption {
  product_code: string;
  description: string;
}

interface SkuDetails {
  product_code: string;
  description: string | null;
  price: number | null;
  category: string | null;
  type: string | null;
}

interface CurationUsage {
  machine_display_name: string;
  solution_name: string;
  problem_title: string;
  machine_solution_problem_id: string;
}

interface SkuExplorerProps {
  allSkus: SkuOption[];
}

export default function SkuExplorer({ allSkus }: SkuExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [skuDetails, setSkuDetails] = useState<SkuDetails | null>(null);
  const [curationUsage, setCurationUsage] = useState<CurationUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredSkus = allSkus.filter(
    sku =>
      sku.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sku.description && sku.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (!selectedSku) {
      setSkuDetails(null);
      setCurationUsage([]);
      return;
    }

    async function fetchSkuDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/products/${selectedSku}`);
        if (!response.ok) throw new Error('Failed to fetch SKU');

        const data = await response.json();
        setSkuDetails(data.sku);
        setCurationUsage(data.curationUsage || []);
        setEditedDescription(data.sku.description || '');
      } catch (error) {
        console.error('Failed to fetch SKU details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSkuDetails();
  }, [selectedSku]);

  const handleSaveDescription = async () => {
    if (!selectedSku) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${selectedSku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editedDescription })
      });

      if (!response.ok) throw new Error('Failed to save');

      setSkuDetails(prev => prev ? { ...prev, description: editedDescription } : null);
      setEditing(false);
      alert('Description saved successfully!');
    } catch (error) {
      console.error('Failed to save description:', error);
      alert('Failed to save description');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left Panel: Search & SKU List */}
      <div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <label htmlFor="sku-search" className="block text-sm font-bold text-gray-900 mb-3">
            Search SKUs
          </label>
          <input
            type="text"
            id="sku-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code or name..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredSkus.slice(0, 50).map((sku) => (
              <button
                key={sku.product_code}
                onClick={() => setSelectedSku(sku.product_code)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedSku === sku.product_code
                    ? 'bg-blue-100 border-2 border-blue-500 font-semibold'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="font-mono text-sm text-blue-600">{sku.product_code}</div>
                <div className="text-sm text-gray-700 truncate">{sku.description}</div>
              </button>
            ))}
            {filteredSkus.length > 50 && (
              <div className="text-sm text-gray-500 text-center py-2">
                Showing first 50 of {filteredSkus.length} results
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: SKU Details */}
      <div>
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-gray-500">Loading SKU details...</p>
          </div>
        )}

        {!loading && !skuDetails && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500">Select a SKU to view details</p>
          </div>
        )}

        {!loading && skuDetails && (
          <div className="space-y-6">
            {/* SKU Facts */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">SKU Details</h3>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Code</div>
                  <div className="font-mono text-lg font-bold text-gray-900">{skuDetails.product_code}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-semibold text-gray-900">{skuDetails.product_name}</div>
                </div>

                {skuDetails.price && (
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="text-lg font-bold text-gray-900">£{skuDetails.price.toFixed(2)}</div>
                  </div>
                )}

                {skuDetails.category && (
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="text-gray-900">{skuDetails.category}</div>
                  </div>
                )}

                {/* Description Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">Description</div>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <div>
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Add description..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleSaveDescription}
                          disabled={saving}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditing(false);
                            setEditedDescription(skuDetails.description || '');
                          }}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 text-sm">
                      {skuDetails.description || (
                        <span className="text-gray-400 italic">No description</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Curated In */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Curated In</h3>

              {curationUsage.length === 0 ? (
                <p className="text-sm text-gray-500">This SKU is not curated in any machine/solution/problem combinations</p>
              ) : (
                <div className="space-y-3">
                  {curationUsage.map((usage) => (
                    <div key={usage.machine_solution_problem_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 mb-1">
                        {usage.machine_display_name}
                      </div>
                      <div className="text-sm text-gray-700">
                        {usage.solution_name} → {usage.problem_title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
