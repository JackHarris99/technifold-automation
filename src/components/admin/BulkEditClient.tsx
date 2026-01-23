/**
 * Bulk Edit Client - Tabbed Interface
 * Combines pricing tier and attributes editing
 */

'use client';

import { useState } from 'react';
import BulkPricingTierClient from './BulkPricingTierClient';
import BulkAttributeEditor from './BulkAttributeEditor';

interface Props {
  products: any[];
}

export default function BulkEditClient({ products }: Props) {
  const [activeTab, setActiveTab] = useState<'pricing' | 'attributes'>('pricing');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Product Editor</h1>
          <p className="text-gray-600 mt-2">
            Edit pricing tiers and attributes for multiple products at once
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'pricing'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              💰 Pricing Tiers
            </button>
            <button
              onClick={() => setActiveTab('attributes')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'attributes'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🏷️ Attributes
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pricing' ? (
              <>
                {/* Info Box for Pricing */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">How Pricing Tiers Work</h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li><strong>No Tier:</strong> Standard pricing with no volume discounts (use for screws, standard items)</li>
                    <li><strong>Standard Tier:</strong> Total quantity across all standard items determines unit price</li>
                    <li><strong>Premium Tier:</strong> Per-SKU quantity determines percentage discount</li>
                    <li><strong>Note:</strong> Pricing tiers only affect consumables quote builder, NOT distributor portals</li>
                  </ul>
                </div>
                <BulkPricingTierClient products={products} />
              </>
            ) : (
              <BulkAttributeEditor products={products} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
