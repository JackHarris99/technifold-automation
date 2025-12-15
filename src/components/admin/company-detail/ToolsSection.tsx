/**
 * Tools Section
 * Shows tools owned by company from company_tools fact table
 */

'use client';

import { useState } from 'react';
import ManageToolsModal from '@/components/admin/ManageToolsModal';

interface Tool {
  tool_code: string;
  first_seen_at: string;
  last_seen_at: string;
  total_units: number;
  products?: {
    description: string;
    category: string;
    price: number;
    image_url?: string;
  };
}

interface ToolsSectionProps {
  tools: Tool[];
  companyId: string;
}

export default function ToolsSection({ tools, companyId }: ToolsSectionProps) {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Tools Owned ({tools.length})</h2>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
          >
            Manage Tools
          </button>
        </div>

        {tools.length === 0 ? (
          <p className="text-gray-600 text-sm">No tools owned</p>
        ) : (
          <div className="space-y-3">
            {tools.map((tool) => (
              <div key={tool.tool_code} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {tool.products?.description || tool.tool_code}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Code: {tool.tool_code}
                      {tool.products?.category && ` • ${tool.products.category}`}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Quantity:</span> {tool.total_units} unit{tool.total_units !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      First seen: {new Date(tool.first_seen_at).toLocaleDateString('en-GB')}
                      {' '}• Last updated: {new Date(tool.last_seen_at).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  {tool.products?.image_url && (
                    <img
                      src={tool.products.image_url}
                      alt={tool.products.description}
                      className="w-20 h-20 object-cover rounded ml-4"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ManageToolsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        companyId={companyId}
      />
    </>
  );
}
