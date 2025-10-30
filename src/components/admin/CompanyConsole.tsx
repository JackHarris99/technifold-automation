/**
 * Company Console - Unified workspace with tabs
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanySelector from './CompanySelector';
import OverviewTab from './console-tabs/OverviewTab';
import MarketingTab from './console-tabs/MarketingTab';
import ReorderTab from './console-tabs/ReorderTab';
import HistoryTab from './console-tabs/HistoryTab';
import ContactsTab from './console-tabs/ContactsTab';

type TabName = 'overview' | 'marketing' | 'reorder' | 'history' | 'contacts';

interface CompanyConsoleProps {
  company: any;
  machines: any[];
  contacts: any[];
  recentEngagement: any[];
  orders: any[];
}

export default function CompanyConsole({
  company,
  machines,
  contacts,
  recentEngagement,
  orders
}: CompanyConsoleProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('overview');

  // Load tab from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1) as TabName;
    if (hash && ['overview', 'marketing', 'reorder', 'history', 'contacts'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    window.location.hash = tab;
    // Save to localStorage for persistence
    localStorage.setItem(`last_tab_${company.company_id}`, tab);
  };

  const handleCompanyChange = (companyId: string) => {
    router.push(`/admin/company/${companyId}`);
  };

  const lastOrder = orders.length > 0 ? orders[0] : null;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Sticky */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            {/* Company Selector */}
            <div>
              <CompanySelector
                currentCompanyId={company.company_id}
                currentCompanyName={company.company_name}
                onCompanySelect={handleCompanyChange}
              />
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 justify-center text-sm">
              <div>
                <div className="text-gray-500">Machines</div>
                <div className="font-bold text-lg">{machines.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Last Order</div>
                <div className="font-bold text-lg">
                  {lastOrder ? new Date(lastOrder.created_at).toLocaleDateString() : 'Never'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Total Revenue</div>
                <div className="font-bold text-lg">£{totalRevenue.toFixed(0)}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/portal/${company.company_id}`;
                  navigator.clipboard.writeText(url);
                  alert('Portal URL copied!');
                }}
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
              >
                Copy Portal URL
              </button>
              <a
                href={`/portal/${company.company_id}`}
                target="_blank"
                className="text-xs px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold"
              >
                Open Portal
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => handleTabChange('overview')}>
              Overview
            </TabButton>
            <TabButton active={activeTab === 'marketing'} onClick={() => handleTabChange('marketing')}>
              Marketing
            </TabButton>
            <TabButton active={activeTab === 'reorder'} onClick={() => handleTabChange('reorder')}>
              Reorder
            </TabButton>
            <TabButton active={activeTab === 'history'} onClick={() => handleTabChange('history')}>
              History
            </TabButton>
            <TabButton active={activeTab === 'contacts'} onClick={() => handleTabChange('contacts')}>
              Contacts & Details
            </TabButton>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            company={company}
            machines={machines}
            recentEngagement={recentEngagement}
            onNavigateTo={handleTabChange}
          />
        )}

        {activeTab === 'marketing' && (
          <MarketingTab
            companyId={company.company_id}
            companyName={company.company_name}
            machines={machines}
            contacts={contacts}
          />
        )}

        {activeTab === 'reorder' && (
          <ReorderTab
            companyId={company.company_id}
            companyName={company.company_name}
            contacts={contacts}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            companyId={company.company_id}
            orders={orders}
            machines={machines}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsTab
            companyId={company.company_id}
            company={company}
            contacts={contacts}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}
