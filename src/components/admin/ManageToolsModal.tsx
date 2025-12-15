/**
 * Manage Tools Modal
 * Admin interface for adding/editing/removing tools from a company
 */

'use client';

import { useState, useEffect } from 'react';

interface Tool {
  tool_code: string;
  total_units: number;
  products?: {
    description: string;
    category: string;
  };
}

interface AvailableTool {
  product_code: string;
  description: string;
  category: string;
}

interface ManageToolsModalProps {
  companyId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ManageToolsModal({
  companyId,
  companyName,
  isOpen,
  onClose,
  onSaved,
}: ManageToolsModalProps) {
  const [currentTools, setCurrentTools] = useState<Tool[]>([]);
  const [availableTools, setAvailableTools] = useState<AvailableTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedToolCode, setSelectedToolCode] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, companyId]);

  async function loadData() {
    setLoading(true);
    try {
      // Load current tools for this company
      const toolsRes = await fetch(`/api/admin/companies/${companyId}/tools`);
      const toolsData = await toolsRes.json();
      setCurrentTools(toolsData.tools || []);

      // Load all available tools
      const availableRes = await fetch('/api/products/tools');
      const availableData = await availableRes.json();
      setAvailableTools(availableData.tools || []);
    } catch (err) {
      console.error('Failed to load tools:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!selectedToolCode || quantity < 1) {
      alert('Please select a tool and enter a valid quantity');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_code: selectedToolCode,
          total_units: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add tool');
      }

      // Reload tools
      await loadData();
      setSelectedToolCode('');
      setQuantity(1);
      alert('Tool added successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add tool');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateQuantity(toolCode: string, newQuantity: number) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_code: toolCode,
          total_units: newQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tool');
      }

      // Reload tools
      await loadData();
      alert('Tool quantity updated');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update tool');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(toolCode: string) {
    if (!confirm('Are you sure you want to remove this tool?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/companies/${companyId}/tools?tool_code=${toolCode}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove tool');
      }

      // Reload tools
      await loadData();
      alert('Tool removed successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove tool');
    } finally {
      setSaving(false);
    }
  }

  function handleSaveAndClose() {
    onSaved();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Tools</h2>
            <p className="text-sm text-gray-600">{companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading tools...</div>
            </div>
          ) : (
            <>
              {/* Add New Tool */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Add Tool</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Tool
                    </label>
                    <select
                      value={selectedToolCode}
                      onChange={(e) => setSelectedToolCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    >
                      <option value="">-- Select a tool --</option>
                      {availableTools.map((tool) => (
                        <option key={tool.product_code} value={tool.product_code}>
                          {tool.description} ({tool.product_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    />
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={saving || !selectedToolCode}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adding...' : 'Add Tool'}
                </button>
              </div>

              {/* Current Tools */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Current Tools ({currentTools.length})
                </h3>
                {currentTools.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No tools assigned yet. Add your first tool above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentTools.map((tool) => (
                      <div
                        key={tool.tool_code}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-blue-300 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {tool.products?.description || tool.tool_code}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {tool.tool_code} • {tool.products?.category || 'Tool'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Qty:</label>
                            <input
                              type="number"
                              min="0"
                              value={tool.total_units}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 0;
                                if (newQty !== tool.total_units) {
                                  handleUpdateQuantity(tool.tool_code, newQty);
                                }
                              }}
                              className="w-20 px-3 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={saving}
                            />
                          </div>
                          <button
                            onClick={() => handleRemove(tool.tool_code)}
                            disabled={saving}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
