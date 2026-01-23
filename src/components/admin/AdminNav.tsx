/**
 * Clean Admin Navigation - Rebuilt
 * Only shows pages that actually exist
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import CompanySearchBar from './CompanySearchBar';
import { getViewMode, setViewMode, getViewModeLabel, type ViewMode } from '@/lib/viewMode';

interface AdminNavProps {
  isDirector?: boolean;
}

export default function AdminNav({ isDirector = false }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [viewMode, setViewModeState] = useState<ViewMode>('all');
  const [systemMode, setSystemMode] = useState<'sales' | 'marketing'>('sales');

  useEffect(() => {
    // Load view mode from localStorage on mount
    setViewModeState(getViewMode());

    // Detect which system we're in based on URL
    if (pathname?.startsWith('/admin/marketing')) {
      setSystemMode('marketing');
    } else {
      setSystemMode('sales');
    }

    // Listen for changes from other tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_view_mode') {
        setViewModeState(getViewMode());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [pathname]);

  async function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    setViewModeState(mode);

    // Also set cookie for server components
    document.cookie = `view_mode=${mode}; path=/; max-age=31536000`; // 1 year

    // Trigger page refresh to apply new filter
    window.location.reload();
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const bgColor = systemMode === 'marketing' ? 'bg-orange-900' : 'bg-gray-900';
  const borderColor = systemMode === 'marketing' ? 'border-orange-800' : 'border-gray-800';
  const highlightColor = systemMode === 'marketing' ? 'bg-orange-600' : 'bg-blue-600';
  const hoverColor = systemMode === 'marketing' ? 'hover:bg-orange-800' : 'hover:bg-gray-800';
  const selectBgColor = systemMode === 'marketing' ? 'bg-orange-700' : 'bg-gray-700';
  const selectBorderColor = systemMode === 'marketing' ? 'border-orange-600' : 'border-gray-600';
  const selectHoverColor = systemMode === 'marketing' ? 'hover:bg-orange-600' : 'hover:bg-gray-600';

  return (
    <nav className={`fixed left-0 top-0 h-screen w-64 ${bgColor} text-white flex flex-col z-50`}>
      {/* System Mode Toggle - DIRECTORS ONLY */}
      {isDirector && (
        <div className={`p-4 border-b ${borderColor} ${systemMode === 'marketing' ? 'bg-orange-800' : 'bg-gray-800'}`}>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            System
          </label>
          <select
            value={systemMode}
            onChange={(e) => {
              const newMode = e.target.value as 'sales' | 'marketing';
              setSystemMode(newMode);
              if (newMode === 'marketing') {
                router.push('/admin/marketing/dashboard');
              } else {
                router.push('/admin/sales');
              }
            }}
            className={`w-full px-3 py-2 ${selectBgColor} border ${selectBorderColor} rounded text-sm font-semibold text-white ${selectHoverColor} focus:ring-2 focus:ring-${systemMode === 'marketing' ? 'orange' : 'blue'}-500 focus:border-${systemMode === 'marketing' ? 'orange' : 'blue'}-500`}
          >
            <option value="sales">🏢 Sales Engine</option>
            <option value="marketing">📧 Marketing System</option>
          </select>
        </div>
      )}

      {/* Header */}
      <div className={`p-4 border-b ${borderColor}`}>
        <h1 className="text-lg font-bold">Technifold Admin</h1>
        <p className="text-xs text-gray-400">
          {systemMode === 'marketing' ? 'Marketing System' : 'Sales Engine'}
        </p>
      </div>

      {/* GLOBAL VIEW MODE TOGGLE - Only show in Sales mode */}
      {systemMode === 'sales' && (
        <div className={`p-4 border-b ${borderColor} ${systemMode === 'marketing' ? 'bg-orange-800' : 'bg-gray-800'}`}>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            View Mode
          </label>
          <select
            value={viewMode}
            onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
            className={`w-full px-3 py-2 ${selectBgColor} border ${selectBorderColor} rounded text-sm font-semibold text-white ${selectHoverColor} focus:ring-2 focus:ring-${systemMode === 'marketing' ? 'orange' : 'blue'}-500 focus:border-${systemMode === 'marketing' ? 'orange' : 'blue'}-500`}
          >
            <option value="all">🌍 All Companies (Team)</option>
            <option value="my_customers">👤 My Customers Only</option>
            {isDirector && (
              <>
                <option value="view_as_lee">🟡 Lee's Customers</option>
                <option value="view_as_steve">🟠 Steve's Customers</option>
                <option value="view_as_callum">🔴 Callum's Customers</option>
              </>
            )}
          </select>
          <p className="text-xs text-gray-400 mt-2">
            {getViewModeLabel(viewMode)}
          </p>
        </div>
      )}

      {/* Universal Company Search - Only in Sales mode */}
      {systemMode === 'sales' && (
        <div className={`p-4 border-b ${borderColor}`}>
          <CompanySearchBar />
        </div>
      )}

      {/* Navigation - Scrollable */}
      <div className="py-4 flex-1 overflow-y-auto">

        {/* ==================== MARKETING SYSTEM NAV ==================== */}
        {systemMode === 'marketing' && isDirector && (
          <>
            {/* Dashboard */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Dashboard
              </div>
              <Link
                href="/admin/marketing/dashboard"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/marketing/dashboard'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📊 Marketing Dashboard
              </Link>
            </div>

            {/* Campaigns */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Campaigns
              </div>
              <Link
                href="/admin/marketing/campaigns/list"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/marketing/campaigns/list' || pathname?.startsWith('/admin/marketing/campaigns/')
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📧 All Campaigns
              </Link>
              <Link
                href="/admin/marketing/campaigns/create"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/marketing/campaigns/create'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                ✨ Create Campaign
              </Link>
            </div>

            {/* Prospects */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Prospects
              </div>
              <Link
                href="/admin/marketing/prospects/list"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/marketing/prospects/list' || pathname?.startsWith('/admin/marketing/prospects/')
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                👥 All Prospects
              </Link>
              <Link
                href="/admin/marketing/prospects/import"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/marketing/prospects/import'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📥 Import Prospects
              </Link>
              <Link
                href="/admin/marketing/prospects/process-csv"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/marketing/prospects/process-csv'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                🔍 CSV Processor
              </Link>
            </div>
          </>
        )}

        {/* ==================== SALES ENGINE NAV ==================== */}
        {systemMode === 'sales' && (
          <>
        {/* Dashboard */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Dashboard
          </div>
          <Link
            href="/admin/sales"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/sales' || pathname === '/admin'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Sales Center
          </Link>
          {isDirector && (
            <Link
              href="/admin/sales/distributors"
              className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                pathname === '/admin/sales/distributors'
                  ? `${highlightColor} text-white`
                  : `text-gray-300 ${hoverColor} hover:text-white`
              }`}
            >
              📦 Distributor Center
            </Link>
          )}
          <Link
            href="/admin/sales/reorder-opportunities"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/sales/reorder-opportunities'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Reorder Opportunities
          </Link>
          <Link
            href="/admin/sales/trials-ending"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/sales/trials-ending'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Trials Ending
          </Link>
          <Link
            href="/admin/sales/unpaid-invoices"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/sales/unpaid-invoices'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Unpaid Invoices
          </Link>
        </div>

        {/* Companies */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Companies
          </div>
          <Link
            href="/admin/companies"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/companies' || pathname?.startsWith('/admin/company/')
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            All Companies
          </Link>
          <Link
            href="/admin/distributors"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/distributors'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Distributor Users
          </Link>
          <Link
            href="/admin/distributor-orders/pending"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname?.startsWith('/admin/distributor-orders')
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Pending Distributor Orders
          </Link>
        </div>

        {/* Quotes */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Quotes
          </div>
          <Link
            href="/admin/quotes"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/quotes' || pathname?.startsWith('/admin/quotes/')
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            All Quotes
          </Link>
          <Link
            href="/admin/quote-builder/tools"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname?.startsWith('/admin/quote-builder/tools')
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            🔧 Tools Quote Builder
          </Link>
          <Link
            href="/admin/quote-builder/consumables"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname?.startsWith('/admin/quote-builder/consumables')
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            📦 Consumables Quote Builder
          </Link>
        </div>

        {/* Invoicing */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Invoicing
          </div>
          <Link
            href="/admin/invoices"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/invoices'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Invoices
          </Link>
        </div>

        {/* Subscriptions */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Subscriptions
          </div>
          <Link
            href="/admin/subscriptions-hub"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/subscriptions-hub' || pathname === '/admin/subscriptions' || pathname === '/admin/trials'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Subscriptions & Trials
          </Link>
        </div>

        {/* Products */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Products
          </div>
          <Link
            href="/admin/products"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/products'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Product Catalog
          </Link>
          <Link
            href="/admin/tool-consumables"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/tool-consumables'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Tool-Consumable Links
          </Link>
          <Link
            href="/admin/products/bulk-edit"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/products/bulk-edit'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Bulk Edit Products
          </Link>
        </div>

        {/* Tools */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Tools
          </div>
          <Link
            href="/admin/reorder-tools"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/reorder-tools' || pathname === '/admin/send-reorder' || pathname === '/admin/test-reorder-link'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Reorder Tools
          </Link>
        </div>

        {/* Other */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Other
          </div>
          <Link
            href="/admin/shipping"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/shipping' || pathname === '/admin/shipping-manifests' || pathname === '/admin/shipping-rates'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Shipping Management
          </Link>
          <Link
            href="/admin/engagements"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/engagements'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Engagement Events
          </Link>
          <Link
            href="/admin/brand-media"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/brand-media'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Brand Media
          </Link>
          <Link
            href="/admin/users"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/users'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            Users
          </Link>
        </div>
          </>
        )}
      </div>

      {/* Footer - Logout */}
      <div className={`p-4 border-t ${borderColor} ${bgColor}`}>
        <button
          onClick={handleLogout}
          className={`w-full px-4 py-2 text-sm font-[500] text-gray-300 ${hoverColor} hover:text-white rounded transition-colors`}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
