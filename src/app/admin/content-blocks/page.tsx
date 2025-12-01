/**
 * Content Blocks Library Admin Page
 * Manage reusable content blocks (features, benefits, stats, etc.)
 */

'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const BLOCK_TYPES = [
  { value: 'feature', label: 'Feature', icon: '⚡', color: 'blue' },
  { value: 'benefit', label: 'Benefit', icon: '✓', color: 'green' },
  { value: 'stat', label: 'Statistic', icon: '📊', color: 'purple' },
  { value: 'step', label: 'Step/Process', icon: '→', color: 'orange' },
  { value: 'testimonial', label: 'Testimonial', icon: '★', color: 'yellow' }
];

interface ContentBlock {
  block_id: string;
  block_type: string;
  title?: string;
  content: string;
  icon?: string;
  created_at: string;
  active: boolean;
}

export default function ContentBlocksLibraryPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [editingBlock, setEditingBlock] = useState<Partial<ContentBlock> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlocks();
  }, [filterType]);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const url = filterType
        ? `/api/admin/content-blocks?type=${filterType}`
        : '/api/admin/content-blocks';

      const response = await fetch(url);
      const data = await response.json();
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingBlock) return;

    try {
      const method = editingBlock.block_id ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/content-blocks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBlock)
      });

      if (!response.ok) throw new Error('Failed to save');

      await fetchBlocks();
      setEditingBlock(null);
      setIsCreating(false);
    } catch (error) {
      alert('Failed to save block');
      console.error(error);
    }
  };

  const handleDelete = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this block?')) return;

    try {
      const response = await fetch(`/api/admin/content-blocks?block_id=${blockId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');

      await fetchBlocks();
    } catch (error) {
      alert('Failed to delete block');
      console.error(error);
    }
  };

  const startCreate = () => {
    setEditingBlock({
      block_type: 'feature',
      title: '',
      content: '',
      icon: '',
      active: true
    });
    setIsCreating(true);
  };

  const filteredBlocks = blocks.filter(b => !filterType || b.block_type === filterType);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Blocks Library</h1>
          <p className="text-gray-600">Create and manage reusable content blocks for marketing pages</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-gray-700">Filter by type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg"
              >
                <option value="">All Types</option>
                {BLOCK_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={startCreate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              + Create New Block
            </button>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(isCreating || editingBlock) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingBlock?.block_id ? 'Edit Block' : 'Create New Block'}
                </h2>

                <div className="space-y-4">
                  {/* Block Type */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Block Type</label>
                    <select
                      value={editingBlock.block_type || ''}
                      onChange={(e) => setEditingBlock({ ...editingBlock, block_type: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                    >
                      {BLOCK_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title (optional) */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Title <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={editingBlock.title || ''}
                      onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                      placeholder="e.g., Reduces Waste by 30%"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Icon (optional) */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Icon <span className="text-gray-400 font-normal">(optional emoji or text)</span>
                    </label>
                    <input
                      type="text"
                      value={editingBlock.icon || ''}
                      onChange={(e) => setEditingBlock({ ...editingBlock, icon: e.target.value })}
                      placeholder="⚡ 💰 🎯"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      maxLength={4}
                    />
                  </div>

                  {/* Content (markdown) */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Content <span className="text-gray-400 font-normal">(supports markdown)</span>
                    </label>
                    <textarea
                      value={editingBlock.content || ''}
                      onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                      placeholder="Enter content... Supports **bold**, *italic*, and bullet lists"
                      rows={6}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>

                  {/* Preview */}
                  {editingBlock.content && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Preview</label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{editingBlock.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => {
                      setEditingBlock(null);
                      setIsCreating(false);
                    }}
                    className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editingBlock.block_type || !editingBlock.content}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Save Block
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blocks Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading blocks...</div>
        ) : filteredBlocks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No content blocks found</p>
            <button
              onClick={startCreate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Create Your First Block
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlocks.map(block => {
              const blockType = BLOCK_TYPES.find(t => t.value === block.block_type);
              return (
                <div key={block.block_id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-3 py-1 bg-${blockType?.color}-100 text-${blockType?.color}-800 rounded-full text-sm font-semibold`}>
                      {blockType?.icon} {blockType?.label}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingBlock(block)}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(block.block_id)}
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {block.icon && (
                    <div className="text-3xl mb-2">{block.icon}</div>
                  )}

                  {block.title && (
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{block.title}</h3>
                  )}

                  <div className="prose prose-sm max-w-none text-gray-600 line-clamp-4">
                    <ReactMarkdown>{block.content}</ReactMarkdown>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Created: {new Date(block.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
