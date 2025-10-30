/**
 * SKU Explorer - Deep dive on any SKU
 * 2-row layout: search on top, full details below
 */

'use client';

import { useState, useEffect } from 'react';

interface SkuOption {
  product_code: string;
  description: string;
  type: string;
}

interface SkuDetails {
  product_code: string;
  description: string | null;
  price: number | null;
  category: string | null;
  type: string | null;
}

interface SkuExplorerProps {
  allSkus: SkuOption[];
}

export default function SkuExplorer({ allSkus }: SkuExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [skuDetails, setSkuDetails] = useState<SkuDetails | null>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredSkus = allSkus.filter(
    sku =>
      sku.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sku.description && sku.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 50); // Show first 50 matches

  useEffect(() => {
    if (!selectedSku) {
      setSkuDetails(null);
      setRelatedItems([]);
      return;
    }

    async function fetchSkuDetails() {
      setLoading(true);
      try {
        // URL-encode the SKU code to handle slashes
        const encodedSku = encodeURIComponent(selectedSku);
        const response = await fetch(`/api/admin/products/${encodedSku}/details`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setSkuDetails(data.sku);
        setRelatedItems(data.relatedItems || []);
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
      const encodedSku = encodeURIComponent(selectedSku);
      const response = await fetch(`/api/admin/products/${encodedSku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editedDescription })
      });

      if (!response.ok) throw new Error('Failed to save');

      setSkuDetails(prev => prev ? { ...prev, description: editedDescription } : null);
      setEditing(false);
      alert('Description saved!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save description');
    } finally {
      setSaving(false);
    }
  };

  const isTool = skuDetails?.type === 'tool';
  const isConsumable = skuDetails?.type === 'consumable';

  return (
    <div className="space-y-6">
      {/* Row 1: Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label htmlFor="sku-search" className="block text-lg font-bold text-gray-900 mb-3">
          Search SKUs
        </label>
        <input
          type="text"
          id="sku-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type SKU code or description..."
          className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          autoFocus
        />

        {/* Search Results Dropdown */}
        {searchTerm && (
          <div className="border-2 border-gray-200 rounded-xl max-h-80 overflow-y-auto">
            {filteredSkus.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No SKUs found</div>
            ) : (
              filteredSkus.map((sku) => (
                <button
                  key={sku.product_code}
                  onClick={() => {
                    setSelectedSku(sku.product_code);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-5 py-4 border-b border-gray-200 hover:bg-blue-50 transition-colors last:border-b-0 ${
                    selectedSku === sku.product_code ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-blue-600">{sku.product_code}</div>
                      <div className="text-sm text-gray-700">{sku.description}</div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{sku.type}</span>
                  </div>
                </button>
              ))
            )}
            {filteredSkus.length === 50 && (
              <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                Showing first 50 results - type more to narrow down
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 2: SKU Details */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">Loading SKU details...</p>
        </div>
      )}

      {!loading && selectedSku && skuDetails && (
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left: Image Placeholder */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center text-sm text-gray-500">Image coming soon</div>
            </div>

            {/* Middle: Details */}
            <div className="md:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="font-mono text-2xl font-bold text-blue-600 mb-2">{skuDetails.product_code}</div>
                  <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-700 mb-4">
                    {isTool ? '🔧 Tool' : isConsumable ? '📦 Consumable' : '⚙️ Part'}
                  </div>
                </div>
                {skuDetails.price && (
                  <div className="text-3xl font-bold text-gray-900">£{skuDetails.price.toFixed(2)}</div>
                )}
              </div>

              {/* Description - Editable */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
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
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveDescription}
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setEditedDescription(skuDetails.description || '');
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-900 text-lg">{skuDetails.description || 'No description'}</div>
                )}
              </div>

              {skuDetails.category && (
                <div className="mb-4">
                  <div className="text-sm font-bold text-gray-700 mb-1">Category</div>
                  <div className="text-gray-900">{skuDetails.category}</div>
                </div>
              )}

              {/* Related Items */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {isTool ? 'Compatible Consumables' : isConsumable ? 'Fits These Tools' : 'Related Items'}
                </h3>

                {relatedItems.length === 0 ? (
                  <p className="text-gray-500">No related items found</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {relatedItems.map((item: any) => (
                      <div
                        key={item.product_code}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedSku(item.product_code)}
                      >
                        <div className="font-mono text-sm text-blue-600 font-bold mb-1">{item.product_code}</div>
                        <div className="text-sm text-gray-900">{item.description}</div>
                        {item.price && (
                          <div className="text-lg font-bold text-gray-900 mt-2">£{item.price.toFixed(2)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedSku && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 text-lg">Search for a SKU to view details</p>
        </div>
      )}
    </div>
  );
}
