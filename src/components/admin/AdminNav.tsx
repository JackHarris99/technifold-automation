/**
 * Clean Admin Navigation - Rebuilt
 * Only shows pages that actually exist
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white overflow-y-auto z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold">Technifold Admin</h1>
        <p className="text-xs text-gray-400">Sales Engine</p>
      </div>

      {/* Navigation */}
      <div className="py-4">
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
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            All Companies
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
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Invoices
          </Link>
          <Link
            href="/admin/invoices/new"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/invoices/new'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Create Invoice
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
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            All Subscriptions
          </Link>
          <Link
            href="/admin/trials"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/trials'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Active Trials
          </Link>
        </div>

        {/* Tools */}
        <div className="mb-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Tools
          </div>
          <Link
            href="/admin/test-reorder-link"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/test-reorder-link'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Test Reorder Link
          </Link>
          <Link
            href="/admin/quote-builder"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/quote-builder'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Quote Builder
          </Link>
          <Link
            href="/admin/sku-explorer"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/sku-explorer'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            SKU Explorer
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
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Shipping Manifests
          </Link>
          <Link
            href="/admin/engagements"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/engagements'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Engagement Events
          </Link>
          <Link
            href="/admin/brand-media"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/brand-media'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Brand Media
          </Link>
          <Link
            href="/admin/users"
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === '/admin/users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Users
          </Link>
        </div>
      </div>

      {/* Footer - Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
