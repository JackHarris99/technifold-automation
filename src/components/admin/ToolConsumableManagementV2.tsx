'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  product_code: string;
  description: string | null;
  price?: number | null;
  rental_price_monthly?: number | null;
  type?: string;
  category?: string | null;
}

interface Relationship {
  tool_code: string;
  consumable_code: string;
  tools?: Product;
  consumables?: Product;
}

interface ToolConsumableManagementV2Props {
  relationships: Relationship[];
  tools: Product[];
  consumables: Product[];
}

export default function ToolConsumableManagementV2({
  relationships: initialRelationships,
  tools,
  consumables,
}: ToolConsumableManagementV2Props) {
  const router = useRouter();
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);
  const [activeView, setActiveView] = useState<'by-tool' | 'by-consumable'>('by-tool');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkCopyModal, setShowBulkCopyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Sync state when props change (after navigation back)
  useEffect(() => {
    setRelationships(initialRelationships);
  }, [initialRelationships]);

  // DEBUG: Log coverage data in useEffect (not during render)
  useEffect(() => {
    if (tools.length > 0 && relationships.length > 0) {
      console.log('[Coverage Debug] First tool product_code:', tools[0].product_code);
      console.log('[Coverage Debug] First relationship tool_code:', relationships[0].tool_code);
      console.log('[Coverage Debug] Sample tool codes from tools:', tools.slice(0, 3).map(t => t.product_code));
      console.log('[Coverage Debug] Sample tool codes from relationships:', [...new Set(relationships.slice(0, 10).map(r => r.tool_code))]);
    }
  }, [tools, relationships]);

  // Coverage stats
  const toolCoverage = useMemo(() => {
    const coverage = new Map<string, number>();
    relationships.forEach(rel => {
      coverage.set(rel.tool_code, (coverage.get(rel.tool_code) || 0) + 1);
    });

    const stats = {
      zero: tools.filter(t => !coverage.has(t.product_code)).length,
      low: tools.filter(t => {
        const count = coverage.get(t.product_code) || 0;
        return count > 0 && count <= 5;
      }).length,
      medium: tools.filter(t => {
        const count = coverage.get(t.product_code) || 0;
        return count > 5 && count <= 15;
      }).length,
      high: tools.filter(t => {
        const count = coverage.get(t.product_code) || 0;
        return count > 15;
      }).length,
    };

    return { coverage, stats };
  }, [relationships, tools]);

  const handleDeleteRelationship = async (toolCode: string, consumableCode: string) => {
    if (!confirm(`Remove ${consumableCode} from ${toolCode}?`)) return;

    try {
      const response = await fetch('/api/admin/tool-consumables/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          tool_code: toolCode,
          consumable_code: consumableCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to remove relationship');

      setRelationships(relationships.filter(
        r => !(r.tool_code === toolCode && r.consumable_code === consumableCode)
      ));
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Coverage Dashboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Coverage Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">
              Last updated: {lastRefresh.toLocaleTimeString('en-GB')}
            </span>
            <button
              onClick={() => router.refresh()}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-gray-900">{tools.length}</div>
            <div className="text-sm text-gray-800 mt-1">Total Tools</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-900">{toolCoverage.stats.zero}</div>
            <div className="text-sm text-red-700 mt-1">No Consumables</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-900">{toolCoverage.stats.low}</div>
            <div className="text-sm text-orange-700 mt-1">1-5 Consumables</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-900">{toolCoverage.stats.medium}</div>
            <div className="text-sm text-yellow-700 mt-1">6-15 Consumables</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-900">{toolCoverage.stats.high}</div>
            <div className="text-sm text-green-700 mt-1">15+ Consumables</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Consumables to Tool
          </button>
          <button
            onClick={() => setShowBulkCopyModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Bulk Copy Between Tools
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveView('by-tool')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'by-tool'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700'
              }`}
            >
              By Tool
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
                {tools.length}
              </span>
            </button>
            <button
              onClick={() => setActiveView('by-consumable')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'by-consumable'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700'
              }`}
            >
              By Consumable
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
                {consumables.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          <input
            type="text"
            placeholder={`Search ${activeView === 'by-tool' ? 'tools' : 'consumables'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {activeView === 'by-tool' ? (
          <ByToolView
            tools={tools}
            consumables={consumables}
            relationships={relationships}
            searchTerm={searchTerm}
            coverage={toolCoverage.coverage}
            onDelete={handleDeleteRelationship}
            onAddClick={() => setShowAddModal(true)}
          />
        ) : (
          <ByConsumableView
            tools={tools}
            consumables={consumables}
            relationships={relationships}
            searchTerm={searchTerm}
            onDelete={handleDeleteRelationship}
          />
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddConsumablesModal
          tools={tools}
          consumables={consumables}
          relationships={relationships}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newRels) => {
            setRelationships([...relationships, ...newRels]);
            setShowAddModal(false);
          }}
        />
      )}

      {showBulkCopyModal && (
        <BulkCopyModal
          tools={tools}
          relationships={relationships}
          onClose={() => setShowBulkCopyModal(false)}
          onSuccess={(newRels) => {
            setRelationships([...relationships, ...newRels]);
            setShowBulkCopyModal(false);
          }}
        />
      )}
    </div>
  );
}

// By Tool View Component
function ByToolView({ tools, consumables, relationships, searchTerm, coverage, onDelete, onAddClick }: any) {
  const toolsMap = new Map<string, Relationship[]>();
  relationships.forEach((rel: Relationship) => {
    if (!toolsMap.has(rel.tool_code)) toolsMap.set(rel.tool_code, []);
    toolsMap.get(rel.tool_code)!.push(rel);
  });

  const filteredTools = tools
    .filter((tool: Product) =>
      tool.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Product, b: Product) => {
      const aCount = coverage.get(a.product_code) || 0;
      const bCount = coverage.get(b.product_code) || 0;
      return aCount - bCount; // Show tools with fewest consumables first
    });

  return (
    <div className="divide-y divide-gray-200">
      {filteredTools.map((tool: Product) => {
        const toolRels = toolsMap.get(tool.product_code) || [];
        const count = toolRels.length;
        const statusColor = count === 0 ? 'bg-red-100 text-red-800' :
                           count <= 5 ? 'bg-orange-100 text-orange-800' :
                           count <= 15 ? 'bg-yellow-100 text-yellow-800' :
                           'bg-green-100 text-green-800';

        return (
          <div key={tool.product_code} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <a
                href={`/admin/tool-consumables/${tool.product_code.replace(/\//g, '--')}`}
                className="flex-1 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700">
                    {tool.product_code} →
                  </h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColor}`}>
                    {count} consumables
                  </span>
                </div>
                <p className="text-sm text-gray-800 mt-1">{tool.description}</p>
              </a>
            </div>

            {toolRels.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {toolRels.map((rel) => {
                  const consumable = consumables.find((c: Product) => c.product_code === rel.consumable_code);
                  return (
                    <div key={rel.consumable_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{rel.consumable_code}</p>
                        <p className="text-xs text-gray-800 truncate">{consumable?.description}</p>
                      </div>
                      <button
                        onClick={() => onDelete(rel.tool_code, rel.consumable_code)}
                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// By Consumable View Component
function ByConsumableView({ tools, consumables, relationships, searchTerm, onDelete }: any) {
  const consumablesMap = new Map<string, Relationship[]>();
  relationships.forEach((rel: Relationship) => {
    if (!consumablesMap.has(rel.consumable_code)) consumablesMap.set(rel.consumable_code, []);
    consumablesMap.get(rel.consumable_code)!.push(rel);
  });

  const filteredConsumables = consumables.filter((c: Product) =>
    c.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="divide-y divide-gray-200">
      {filteredConsumables.map((consumable: Product) => {
        const consRels = consumablesMap.get(consumable.product_code) || [];

        return (
          <div key={consumable.product_code} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{consumable.product_code}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {consRels.length} tools
                  </span>
                </div>
                <p className="text-sm text-gray-800 mt-1">{consumable.description}</p>
                {consumable.price && <p className="text-xs text-gray-700 mt-1">£{consumable.price}</p>}
              </div>
            </div>

            {consRels.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {consRels.map((rel) => {
                  const tool = tools.find((t: Product) => t.product_code === rel.tool_code);
                  return (
                    <div key={rel.tool_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <a
                        href={`/admin/tool-consumables/${rel.tool_code.replace(/\//g, '--')}`}
                        className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        <p className="font-medium text-sm text-blue-600 hover:text-blue-700 truncate">
                          {rel.tool_code} →
                        </p>
                        <p className="text-xs text-gray-800 truncate">{tool?.description}</p>
                      </a>
                      <button
                        onClick={() => onDelete(rel.tool_code, rel.consumable_code)}
                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Add Consumables Modal (with category grouping)
function AddConsumablesModal({ tools, consumables, relationships, onClose, onSuccess }: any) {
  const [selectedTool, setSelectedTool] = useState('');
  const [selectedConsumables, setSelectedConsumables] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Group consumables by category
  const consumablesByCategory = useMemo(() => {
    const groups = new Map<string, Product[]>();
    consumables.forEach((c: Product) => {
      const category = c.category || 'Uncategorized';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push(c);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [consumables]);

  const existingForTool = useMemo(() =>
    new Set(relationships.filter((r: Relationship) => r.tool_code === selectedTool).map((r: Relationship) => r.consumable_code)),
    [relationships, selectedTool]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/tool-consumables/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_multiple',
          tool_code: selectedTool,
          consumable_codes: Array.from(selectedConsumables),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onSuccess(data.relationships || []);
      alert(`Added ${data.created_count} consumables`);
    } catch (err: any) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Consumables to Tool</h2>
          <button onClick={onClose} className="text-gray-800 hover:text-gray-800 text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Tool</label>
            <select
              required
              value={selectedTool}
              onChange={(e) => {
                setSelectedTool(e.target.value);
                setSelectedConsumables(new Set());
              }}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Choose tool...</option>
              {tools.map((t: Product) => (
                <option key={t.product_code} value={t.product_code}>{t.product_code} - {t.description}</option>
              ))}
            </select>
          </div>

          {selectedTool && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Consumables ({selectedConsumables.size} selected)
              </label>

              <div className="space-y-2">
                {consumablesByCategory.map(([category, items]) => {
                  const isExpanded = expandedCategories.has(category);
                  const selectedInCategory = items.filter(i => selectedConsumables.has(i.product_code)).length;

                  return (
                    <div key={category} className="border rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          const newSet = new Set(expandedCategories);
                          isExpanded ? newSet.delete(category) : newSet.add(category);
                          setExpandedCategories(newSet);
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className="font-medium">{category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-800">{selectedInCategory}/{items.length}</span>
                          <span>{isExpanded ? '▼' : '▶'}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t p-4 space-y-2 max-h-64 overflow-y-auto">
                          {items.map((c: Product) => {
                            const isExisting = existingForTool.has(c.product_code);
                            return (
                              <label
                                key={c.product_code}
                                className={`flex items-start p-3 rounded border cursor-pointer ${
                                  isExisting ? 'bg-gray-100 opacity-50 cursor-not-allowed' :
                                  selectedConsumables.has(c.product_code) ? 'bg-blue-50 border-blue-300' :
                                  'hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedConsumables.has(c.product_code)}
                                  disabled={isExisting}
                                  onChange={() => {
                                    const newSet = new Set(selectedConsumables);
                                    newSet.has(c.product_code) ? newSet.delete(c.product_code) : newSet.add(c.product_code);
                                    setSelectedConsumables(newSet);
                                  }}
                                  className="mt-1"
                                />
                                <div className="ml-3 flex-1">
                                  <p className="font-medium text-sm">{c.product_code}</p>
                                  <p className="text-xs text-gray-800">{c.description}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={loading || !selectedTool || selectedConsumables.size === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : `Add ${selectedConsumables.size} Consumables`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bulk Copy Modal
function BulkCopyModal({ tools, relationships, onClose, onSuccess }: any) {
  const [sourceTool, setSourceTool] = useState('');
  const [targetTool, setTargetTool] = useState('');
  const [loading, setLoading] = useState(false);

  const sourceConsumables = useMemo(() =>
    relationships.filter((r: Relationship) => r.tool_code === sourceTool).map((r: Relationship) => r.consumable_code),
    [relationships, sourceTool]
  );

  const handleCopy = async () => {
    if (!sourceTool || !targetTool || sourceConsumables.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/tool-consumables/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_multiple',
          tool_code: targetTool,
          consumable_codes: sourceConsumables,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onSuccess(data.relationships || []);
      alert(`Copied ${data.created_count} consumables from ${sourceTool} to ${targetTool}`);
    } catch (err: any) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Bulk Copy Consumables</h2>
          <button onClick={onClose} className="text-gray-800 hover:text-gray-800 text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Copy From (Source Tool)</label>
            <select
              value={sourceTool}
              onChange={(e) => setSourceTool(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Choose source tool...</option>
              {tools.map((t: Product) => (
                <option key={t.product_code} value={t.product_code}>{t.product_code} - {t.description}</option>
              ))}
            </select>
          </div>

          {sourceTool && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>{sourceConsumables.length} consumables</strong> will be copied from {sourceTool}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Copy To (Target Tool)</label>
            <select
              value={targetTool}
              onChange={(e) => setTargetTool(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Choose target tool...</option>
              {tools.filter((t: Product) => t.product_code !== sourceTool).map((t: Product) => (
                <option key={t.product_code} value={t.product_code}>{t.product_code} - {t.description}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
            <button
              onClick={handleCopy}
              disabled={loading || !sourceTool || !targetTool || sourceConsumables.length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Copying...' : `Copy ${sourceConsumables.length} Consumables`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
