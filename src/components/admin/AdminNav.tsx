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
import { getViewMode, setViewMode, type ViewMode } from '@/lib/viewMode';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [viewMode, setViewModeState] = useState<ViewMode>('all');

  useEffect(() => {
    // Load view mode from localStorage on mount
    setViewModeState(getViewMode());

    // Listen for changes from other tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_view_mode') {
        setViewModeState(getViewMode());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold">Technifold Admin</h1>
        <p className="text-xs text-gray-400">Sales Engine</p>
      </div>

      {/* GLOBAL VIEW MODE TOGGLE */}
      <div className="p-4 border-b border-gray-800 bg-gray-800">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          View Mode
        </label>
        <select
          value={viewMode}
          onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm font-semibold text-white hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">🌍 All Companies (Team)</option>
          <option value="my_customers">👤 My Customers Only</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">
          {viewMode === 'all' ? 'Viewing all team data' : 'Viewing your customers only'}
        </p>
      </div>

      {/* Universal Company Search */}
      <div className="p-4 border-b border-gray-800">
        <CompanySearchBar />
      </div>

      {/* Navigation - Scrollable */}
      <div className="py-4 flex-1 overflow-y-auto">
        {/* Dashboard */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Dashboard
          </div>
          <Link
            href="/admin/sales"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/sales' || pathname === '/admin'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Sales Center
          </Link>
          <Link
            href="/admin/sales/reorder-opportunities"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/sales/reorder-opportunities'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Reorder Opportunities
          </Link>
          <Link
            href="/admin/sales/trials-ending"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/sales/trials-ending'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Trials Ending
          </Link>
          <Link
            href="/admin/sales/unpaid-invoices"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/sales/unpaid-invoices'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Unpaid Invoices
          </Link>
        </div>

        {/* Companies */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Companies
          </div>
          <Link
            href="/admin/companies"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/companies' || pathname?.startsWith('/admin/company/')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            All Companies
          </Link>
        </div>

        {/* Quotes */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Quotes
          </div>
          <Link
            href="/admin/quotes"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/quotes' || pathname?.startsWith('/admin/quotes/')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            All Quotes
          </Link>
          <Link
            href="/admin/quote-builder/tools"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname?.startsWith('/admin/quote-builder/tools')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            🔧 Tools Quote Builder
          </Link>
          <Link
            href="/admin/quote-builder/consumables"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname?.startsWith('/admin/quote-builder/consumables')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            📦 Consumables Quote Builder
          </Link>
        </div>

        {/* Invoicing */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Invoicing
          </div>
          <Link
            href="/admin/invoices"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/invoices'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Invoices
          </Link>
        </div>

        {/* Subscriptions */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Subscriptions
          </div>
          <Link
            href="/admin/subscriptions"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/subscriptions'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            All Subscriptions
          </Link>
          <Link
            href="/admin/trials"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/trials'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Active Trials
          </Link>
        </div>

        {/* Products */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Products
          </div>
          <Link
            href="/admin/products"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/products'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Product Catalog
          </Link>
          <Link
            href="/admin/tool-consumables"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/tool-consumables'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Tool-Consumable Links
          </Link>
        </div>

        {/* Tools */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Tools
          </div>
          <Link
            href="/admin/send-reorder"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/send-reorder'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Send Reorder Email
          </Link>
          <Link
            href="/admin/test-reorder-link"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/test-reorder-link'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Test Reorder Link
          </Link>
        </div>

        {/* Other */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Other
          </div>
          <Link
            href="/admin/shipping-manifests"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/shipping-manifests'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Shipping Manifests
          </Link>
          <Link
            href="/admin/shipping-rates"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/shipping-rates'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Shipping Rates
          </Link>
          <Link
            href="/admin/engagements"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/engagements'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Engagement Events
          </Link>
          <Link
            href="/admin/brand-media"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/brand-media'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Brand Media
          </Link>
          <Link
            href="/admin/users"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Users
          </Link>
        </div>
      </div>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-800 hover:text-white rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
