/**
 * Shipping Hub - Unified Page
 * Combines: Shipping Manifests + Shipping Rates
 */

'use client';

import { useState } from 'react';
import ManifestsTab from '@/components/admin/shipping/ManifestsTab';
import RatesTab from '@/components/admin/shipping/RatesTab';

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<'manifests' | 'rates'>('manifests');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600 mt-2">Manage shipments, manifests, and shipping rates</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('manifests')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'manifests'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📦 Shipping Manifests
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'rates'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🌍 Shipping Rates
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'manifests' ? <ManifestsTab /> : <RatesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
