'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Product {
  product_code: string;
  description: string | null;
  price?: number | null;
  rental_price_monthly?: number | null;
  type?: string;
}

interface Relationship {
  tool_code: string;
  consumable_code: string;
  tools?: Product;
  consumables?: Product;
}

interface ToolConsumableManagementProps {
  relationships: Relationship[];
  tools: Product[];
  consumables: Product[];
}

export default function ToolConsumableManagement({
  relationships: initialRelationships,
  tools,
  consumables,
}: ToolConsumableManagementProps) {
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Group relationships by tool
  const toolsMap = new Map<string, Relationship[]>();
  relationships.forEach((rel) => {
    if (!toolsMap.has(rel.tool_code)) {
      toolsMap.set(rel.tool_code, []);
    }
    toolsMap.get(rel.tool_code)!.push(rel);
  });

  // Filter tools based on search
  const filteredTools = Array.from(toolsMap.keys()).filter((toolCode) => {
    const tool = tools.find((t) => t.product_code === toolCode);
    const matchesSearch =
      toolCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesSearch;
  });

  const handleDeleteRelationship = async (toolCode: string, consumableCode: string) => {
    if (!confirm(`Remove relationship between ${toolCode} and ${consumableCode}?`)) {
      return;
    }

    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('tool_consumable_map')
        .delete()
        .eq('tool_code', toolCode)
        .eq('consumable_code', consumableCode);

      if (error) throw error;

      setRelationships(
        relationships.filter(
          (r) => !(r.tool_code === toolCode && r.consumable_code === consumableCode)
        )
      );
      alert('Relationship removed successfully');
    } catch (err: any) {
      console.error('Error deleting relationship:', err);
      alert('Failed to remove relationship: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
          >
            + Add Relationship
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {filteredTools.length} tools with {relationships.length} total relationships
        </div>
      </div>

      {/* Tools List */}
      <div className="divide-y divide-gray-200">
        {filteredTools.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tool relationships found. Click "Add Relationship" to get started.
          </div>
        ) : (
          filteredTools.map((toolCode) => {
            const tool = tools.find((t) => t.product_code === toolCode);
            const toolRelationships = toolsMap.get(toolCode) || [];

            return (
              <div key={toolCode} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{toolCode}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {tool?.description || 'No description'}
                    </p>
                    {tool?.rental_price_monthly && (
                      <p className="text-xs text-gray-500 mt-1">
                        Rental: £{tool.rental_price_monthly}/month
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {toolRelationships.length} consumables
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {toolRelationships.map((rel) => {
                    const consumable = consumables.find(
                      (c) => c.product_code === rel.consumable_code
                    );
                    return (
                      <div
                        key={`${rel.tool_code}-${rel.consumable_code}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {rel.consumable_code}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {consumable?.description || 'No description'}
                          </p>
                          {consumable?.price && (
                            <p className="text-xs text-gray-500">£{consumable.price}</p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteRelationship(rel.tool_code, rel.consumable_code)
                          }
                          className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Relationship Modal */}
      {showAddModal && (
        <AddRelationshipModal
          tools={tools}
          consumables={consumables}
          existingRelationships={relationships}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newRels) => {
            setRelationships([...relationships, ...newRels]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

interface AddRelationshipModalProps {
  tools: Product[];
  consumables: Product[];
  existingRelationships: Relationship[];
  onClose: () => void;
  onSuccess: (newRelationships: Relationship[]) => void;
}

function AddRelationshipModal({
  tools,
  consumables,
  existingRelationships,
  onClose,
  onSuccess,
}: AddRelationshipModalProps) {
  const [selectedTool, setSelectedTool] = useState('');
  const [selectedConsumables, setSelectedConsumables] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleConsumable = (consumableCode: string) => {
    const newSet = new Set(selectedConsumables);
    if (newSet.has(consumableCode)) {
      newSet.delete(consumableCode);
    } else {
      newSet.add(consumableCode);
    }
    setSelectedConsumables(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedTool) {
      setError('Please select a tool');
      setLoading(false);
      return;
    }

    if (selectedConsumables.size === 0) {
      setError('Please select at least one consumable');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClientComponentClient();

      // Filter out any that already exist
      const existingSet = new Set(
        existingRelationships
          .filter((r) => r.tool_code === selectedTool)
          .map((r) => r.consumable_code)
      );

      const newRelationships = Array.from(selectedConsumables)
        .filter((consumableCode) => !existingSet.has(consumableCode))
        .map((consumableCode) => ({
          tool_code: selectedTool,
          consumable_code: consumableCode,
        }));

      if (newRelationships.length === 0) {
        setError('All selected consumables are already linked to this tool');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('tool_consumable_map')
        .insert(newRelationships);

      if (insertError) throw insertError;

      onSuccess(newRelationships);
      alert(`Added ${newRelationships.length} relationship(s) successfully`);
    } catch (err: any) {
      console.error('Error adding relationships:', err);
      setError(err.message || 'Failed to add relationships');
      setLoading(false);
    }
  };

  // Get consumables already linked to selected tool
  const existingConsumablesForTool = new Set(
    existingRelationships
      .filter((r) => r.tool_code === selectedTool)
      .map((r) => r.consumable_code)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Tool-Consumable Relationship</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tool Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tool <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedTool}
              onChange={(e) => {
                setSelectedTool(e.target.value);
                setSelectedConsumables(new Set()); // Reset consumables when tool changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a tool...</option>
              {tools.map((tool) => (
                <option key={tool.product_code} value={tool.product_code}>
                  {tool.product_code} - {tool.description || 'No description'}
                </option>
              ))}
            </select>
          </div>

          {/* Consumables Selection */}
          {selectedTool && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Consumables <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({selectedConsumables.size} selected)
                </span>
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                {consumables.map((consumable) => {
                  const isExisting = existingConsumablesForTool.has(consumable.product_code);
                  return (
                    <label
                      key={consumable.product_code}
                      className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                        isExisting
                          ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                          : selectedConsumables.has(consumable.product_code)
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedConsumables.has(consumable.product_code)}
                        onChange={() => handleToggleConsumable(consumable.product_code)}
                        disabled={isExisting}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {consumable.product_code}
                          {isExisting && (
                            <span className="ml-2 text-xs text-gray-500">(Already linked)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">{consumable.description}</p>
                        {consumable.price && (
                          <p className="text-xs text-gray-500">£{consumable.price}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
                {consumables.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No consumables available
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading || !selectedTool || selectedConsumables.size === 0}
            >
              {loading ? 'Adding...' : `Add ${selectedConsumables.size} Relationship(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
