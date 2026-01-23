/**
 * Subscriptions Hub - Unified Page
 * Combines: Active Subscriptions + Trial Offers
 */

'use client';

import { useState } from 'react';
import SubscriptionsTab from '@/components/admin/subscriptions/SubscriptionsTab';
import TrialsTab from '@/components/admin/subscriptions/TrialsTab';

export default function SubscriptionsHubPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'trials'>('subscriptions');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Trials</h1>
          <p className="text-gray-600 mt-2">Manage active subscriptions and trial offers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'subscriptions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📊 Active Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('trials')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'trials'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🎁 Trial Offers
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'subscriptions' ? <SubscriptionsTab /> : <TrialsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
