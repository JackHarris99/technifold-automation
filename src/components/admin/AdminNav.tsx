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
  const [systemMode, setSystemMode] = useState<'sales' | 'marketing' | 'distributors' | 'press' | 'suppliers'>('sales');

  useEffect(() => {
    // Load view mode from localStorage on mount
    setViewModeState(getViewMode());

    // Detect which system we're in based on URL
    if (pathname?.startsWith('/admin/marketing')) {
      setSystemMode('marketing');
    } else if (pathname?.startsWith('/admin/distributors')) {
      setSystemMode('distributors');
    } else if (pathname?.startsWith('/admin/press')) {
      setSystemMode('press');
    } else if (pathname?.startsWith('/admin/suppliers')) {
      setSystemMode('suppliers');
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

  const colorMaps = {
    marketing: { bg: 'bg-orange-900', border: 'border-orange-800', highlight: 'bg-orange-600', hover: 'hover:bg-orange-800', selectBg: 'bg-orange-700', selectBorder: 'border-orange-600', selectHover: 'hover:bg-orange-600' },
    distributors: { bg: 'bg-teal-900', border: 'border-teal-800', highlight: 'bg-teal-600', hover: 'hover:bg-teal-800', selectBg: 'bg-teal-700', selectBorder: 'border-teal-600', selectHover: 'hover:bg-teal-600' },
    press: { bg: 'bg-purple-900', border: 'border-purple-800', highlight: 'bg-purple-600', hover: 'hover:bg-purple-800', selectBg: 'bg-purple-700', selectBorder: 'border-purple-600', selectHover: 'hover:bg-purple-600' },
    suppliers: { bg: 'bg-emerald-900', border: 'border-emerald-800', highlight: 'bg-emerald-600', hover: 'hover:bg-emerald-800', selectBg: 'bg-emerald-700', selectBorder: 'border-emerald-600', selectHover: 'hover:bg-emerald-600' },
    sales: { bg: 'bg-gray-900', border: 'border-gray-800', highlight: 'bg-blue-600', hover: 'hover:bg-gray-800', selectBg: 'bg-gray-700', selectBorder: 'border-gray-600', selectHover: 'hover:bg-gray-600' }
  };

  const colors = colorMaps[systemMode];
  const bgColor = colors.bg;
  const borderColor = colors.border;
  const highlightColor = colors.highlight;
  const hoverColor = colors.hover;
  const selectBgColor = colors.selectBg;
  const selectBorderColor = colors.selectBorder;
  const selectHoverColor = colors.selectHover;

  return (
    <nav className={`fixed left-0 top-0 h-screen w-64 ${bgColor} text-white flex flex-col z-50`}>
      {/* System Mode Toggle - DIRECTORS ONLY */}
      {isDirector && (
        <div className={`p-4 border-b ${borderColor} ${selectBgColor.replace('bg-', 'bg-').replace('-700', '-800')}`}>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            System
          </label>
          <select
            value={systemMode}
            onChange={(e) => {
              const newMode = e.target.value as 'sales' | 'marketing' | 'distributors' | 'press' | 'suppliers';
              setSystemMode(newMode);
              if (newMode === 'marketing') {
                router.push('/admin/marketing/dashboard');
              } else if (newMode === 'distributors') {
                router.push('/admin/distributors/dashboard');
              } else if (newMode === 'press') {
                router.push('/admin/press/dashboard');
              } else if (newMode === 'suppliers') {
                router.push('/admin/suppliers/dashboard');
              } else {
                router.push('/admin/sales');
              }
            }}
            className={`w-full px-3 py-2 ${selectBgColor} border ${selectBorderColor} rounded text-sm font-semibold text-white ${selectHoverColor} focus:ring-2 focus:ring-opacity-50`}
          >
            <option value="sales">🏢 Sales Engine</option>
            <option value="marketing">📧 Marketing System</option>
            <option value="distributors">📦 Distributor System</option>
            <option value="press">📰 Press & Media</option>
            <option value="suppliers">🏭 Suppliers</option>
          </select>
        </div>
      )}

      {/* Header */}
      <div className={`p-4 border-b ${borderColor}`}>
        <h1 className="text-lg font-bold">Technifold Admin</h1>
        <p className="text-xs text-gray-400">
          {systemMode === 'marketing' ? 'Marketing System' :
           systemMode === 'distributors' ? 'Distributor System' :
           systemMode === 'press' ? 'Press & Media Relations' :
           systemMode === 'suppliers' ? 'Supplier Management' :
           'Sales Engine'}
        </p>
      </div>

      {/* GLOBAL VIEW MODE TOGGLE - Only show in Sales mode */}
      {systemMode === 'sales' && (
        <div className={`p-4 border-b ${borderColor} ${selectBgColor.replace('bg-', 'bg-').replace('-700', '-800')}`}>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            View Mode
          </label>
          <select
            value={viewMode}
            onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
            className={`w-full px-3 py-2 ${selectBgColor} border ${selectBorderColor} rounded text-sm font-semibold text-white ${selectHoverColor} focus:ring-2 focus:ring-opacity-50`}
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

        {/* ==================== DISTRIBUTOR SYSTEM NAV ==================== */}
        {systemMode === 'distributors' && isDirector && (
          <>
            {/* Dashboard */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Dashboard
              </div>
              <Link
                href="/admin/distributors/dashboard"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/dashboard' || pathname === '/admin/distributors'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📊 Distributor Dashboard
              </Link>
            </div>

            {/* Distributors */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Distributors
              </div>
              <Link
                href="/admin/distributors/companies"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/companies'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                🏢 All Distributors
              </Link>
              <Link
                href="/admin/distributors/manage"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/manage'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                👥 Manage Users & Tiers
              </Link>
            </div>

            {/* Orders */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Orders
              </div>
              <Link
                href="/admin/distributors/orders"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/orders' || pathname?.startsWith('/admin/distributors/orders/')
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📦 All Orders
              </Link>
              <Link
                href="/admin/distributors/orders/pending"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/orders/pending'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                ⏳ Pending Review
              </Link>
            </div>

            {/* Pricing & Commission */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Pricing & Commission
              </div>
              <Link
                href="/admin/distributors/pricing"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/pricing'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                💰 Standard Pricing
              </Link>
              <Link
                href="/admin/distributors/custom-pricing"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/custom-pricing'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                🎯 Custom Pricing
              </Link>
              {/* Commission Tracking - Coming Soon
              <Link
                href="/admin/distributors/commission"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/commission'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                💵 Commission Tracking
              </Link>
              */}
            </div>

            {/* Reporting */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Reporting
              </div>
              <Link
                href="/admin/distributors/sales"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/sales'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📈 Sales Report
              </Link>
              {/* Performance Dashboard - Coming Soon
              <Link
                href="/admin/distributors/performance"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/distributors/performance'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                🎯 Performance Dashboard
              </Link>
              */}
            </div>
          </>
        )}

        {/* ==================== PRESS & MEDIA NAV ==================== */}
        {systemMode === 'press' && isDirector && (
          <>
            {/* Dashboard */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Dashboard
              </div>
              <Link
                href="/admin/press/dashboard"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/press/dashboard' || pathname === '/admin/press'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📊 Press Dashboard
              </Link>
            </div>

            {/* Media Contacts */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Media Contacts
              </div>
              <Link
                href="/admin/press/contacts"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/press/contacts'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📰 All Press Contacts
              </Link>
              <Link
                href="/admin/press/outlets"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/press/outlets'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                🏢 Media Outlets
              </Link>
            </div>

            {/* Coverage */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Media Coverage
              </div>
              <Link
                href="/admin/press/coverage"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/press/coverage'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📰 All Coverage
              </Link>
              <Link
                href="/admin/press/releases"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/press/releases'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📝 Press Releases
              </Link>
            </div>
          </>
        )}

        {/* ==================== SUPPLIERS NAV ==================== */}
        {systemMode === 'suppliers' && isDirector && (
          <>
            {/* Dashboard */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Dashboard
              </div>
              <Link
                href="/admin/suppliers/dashboard"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/suppliers/dashboard' || pathname === '/admin/suppliers'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📊 Supplier Dashboard
              </Link>
            </div>

            {/* Suppliers */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Suppliers
              </div>
              <Link
                href="/admin/suppliers/companies"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/suppliers/companies'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                🏭 All Suppliers
              </Link>
              <Link
                href="/admin/suppliers/contacts"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/suppliers/contacts'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                👥 Supplier Contacts
              </Link>
            </div>

            {/* Purchase Orders */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Purchase Orders
              </div>
              <Link
                href="/admin/suppliers/orders"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/suppliers/orders'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📦 All Orders
              </Link>
              <Link
                href="/admin/suppliers/orders/pending"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/suppliers/orders/pending'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                ⏳ Pending Delivery
              </Link>
            </div>

            {/* Catalogs */}
            <div className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Catalogs & Pricing
              </div>
              <Link
                href="/admin/suppliers/catalogs"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/suppliers/catalogs'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                📑 Product Catalogs
              </Link>
              <Link
                href="/admin/suppliers/pricing"
                className={`block px-4 py-2 text-sm font-[500] transition-colors ${
                  pathname === '/admin/suppliers/pricing'
                    ? `${highlightColor} text-white`
                    : `text-gray-300 ${hoverColor} hover:text-white`
                }`}
              >
                💰 Pricing History
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
            href="/admin/technicrease-quotes"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname?.startsWith('/admin/technicrease-quotes')
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            ⚙️ TechniCrease Quotes
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
          <Link
            href="/admin/quote-builder/technicrease"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname?.startsWith('/admin/quote-builder/technicrease')
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            ⚙️ TechniCrease Quote Builder
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
          <Link
            href="/admin/products/categorize"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/products/categorize'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            📋 Categorize Products
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
          <Link
            href="/admin/analytics/reorder-links"
            className={`block px-4 py-2 text-sm font-[500] transition-colors ${
              pathname === '/admin/analytics/reorder-links'
                ? `${highlightColor} text-white`
                : `text-gray-300 ${hoverColor} hover:text-white`
            }`}
          >
            📊 Reorder Analytics
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
