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
import EngagementTab from './console-tabs/EngagementTab';
import SettingsTab from './console-tabs/SettingsTab';

type TabName = 'overview' | 'marketing' | 'reorder' | 'history' | 'contacts' | 'engagement' | 'settings';

interface CompanyConsoleProps {
  company: any;
  salesRep?: { rep_name: string; email: string } | null;
  machines: any[];
  contacts: any[];
  recentEngagement: any[];
  orders: any[];
  permissions: {
    canSendMarketing: boolean;
    canCreateQuote: boolean;
    canEditContacts: boolean;
    canViewDetails: boolean;
    canChangeAccountOwner: boolean;
    canChangeCompanyType: boolean;
  };
}

// Color scheme for account owners
const OWNER_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  'Lee': { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Callum': { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Steve': { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  'jack_harris': { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
};

export default function CompanyConsole({
  company,
  salesRep,
  machines,
  contacts,
  recentEngagement,
  orders,
  permissions
}: CompanyConsoleProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('overview');

  // Get color scheme for this company's owner
  const ownerColors = OWNER_COLORS[company.account_owner || ''] || {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    text: 'text-gray-700'
  };

  const canAct = permissions.canSendMarketing; // Shorthand for any action

  // Load tab from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1) as TabName;
    if (hash && ['overview', 'marketing', 'reorder', 'history', 'contacts', 'engagement', 'settings'].includes(hash)) {
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
      {/* Top Bar - Sticky with color-coded border */}
      <div className={`bg-white border-b-4 ${ownerColors.border} sticky top-0 z-30 shadow-sm`}>
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

            {/* Quick Info with color badge + Admin Tools */}
            <div className="text-right">
              <div className="flex gap-3 justify-end items-center">
                <div className="flex gap-2">
                  <a
                    href="/admin/quote-requests"
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    Quote Requests
                  </a>
                  <a
                    href="/admin/quote-builder-v2"
                    className="px-3 py-1.5 text-xs font-semibold text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors"
                  >
                    Build Quote
                  </a>
                </div>
                <div className={`px-4 py-2 rounded-lg ${ownerColors.bg} ${ownerColors.border} border-2 text-sm`}>
                  <div className={`font-bold ${ownerColors.text}`}>{salesRep?.rep_name || 'Unassigned'}</div>
                  <div className="text-xs text-gray-600">Account Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Warning */}
      {!canAct && (
        <div className="bg-yellow-50 border-b-2 border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-semibold">
                View-only access: You cannot perform actions on this company (owned by {salesRep?.rep_name || 'another rep'})
              </span>
            </div>
          </div>
        </div>
      )}

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
            <TabButton active={activeTab === 'engagement'} onClick={() => handleTabChange('engagement')}>
              Engagement
            </TabButton>
            <TabButton active={activeTab === 'settings'} onClick={() => handleTabChange('settings')}>
              Settings
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
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsTab
            companyId={company.company_id}
            company={company}
            contacts={contacts}
          />
        )}

        {activeTab === 'engagement' && (
          <EngagementTab
            companyId={company.company_id}
            contacts={contacts}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            companyId={company.company_id}
            company={company}
            contacts={contacts}
            permissions={permissions}
            onRefresh={() => router.refresh()}
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
