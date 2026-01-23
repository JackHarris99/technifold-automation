/**
 * Reorder Tools - Unified Page
 * Combines: Send Reorder Emails + Test Reorder Link Generator
 */

'use client';

import { useState } from 'react';
import SendReorderTab from '@/components/admin/reorder-tools/SendReorderTab';
import TestReorderLinkTab from '@/components/admin/reorder-tools/TestReorderLinkTab';

export default function ReorderToolsPage() {
  const [activeTab, setActiveTab] = useState<'send' | 'test'>('send');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reorder Tools</h1>
        <p className="text-gray-600 mb-6">Send reorder campaigns and generate test links</p>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'send'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📧 Send Reorder Email
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'test'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🔗 Test Reorder Link
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'send' ? <SendReorderTab /> : <TestReorderLinkTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
