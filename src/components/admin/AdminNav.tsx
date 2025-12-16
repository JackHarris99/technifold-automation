/**
 * Unified Admin Navigation
 * Clean, organized sidebar for the fact-based architecture
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import CompanySearchBar from './CompanySearchBar';

interface NavSection {
  title: string;
  icon: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  deprecated?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Dashboard',
    icon: '📊',
    items: [
      { label: 'Sales Center', href: '/admin/sales' },
      { label: 'Pipeline', href: '/admin/pipeline' },
    ],
  },
  {
    title: 'Companies',
    icon: '🏢',
    items: [
      { label: 'My Territory', href: '/admin/sales/companies' },
      { label: 'All Companies', href: '/admin/companies' },
      { label: 'Prospects', href: '/admin/prospects' },
      { label: 'CRM View', href: '/admin/crm', deprecated: true },
    ],
  },
  {
    title: 'Sales Actions',
    icon: '⚡',
    items: [
      { label: 'Reorder Opportunities', href: '/admin/sales/reorder-opportunities' },
      { label: 'Trials Ending', href: '/admin/sales/trials-ending' },
      { label: 'Unpaid Invoices', href: '/admin/sales/unpaid-invoices' },
      { label: 'Quote Requests', href: '/admin/quote-requests' },
    ],
  },
  {
    title: 'Subscriptions',
    icon: '🔄',
    items: [
      { label: 'All Subscriptions', href: '/admin/subscriptions' },
      { label: 'Active Trials', href: '/admin/trials' },
      { label: 'Rentals (Legacy)', href: '/admin/rentals', deprecated: true },
    ],
  },
  {
    title: 'Invoicing',
    icon: '📄',
    items: [
      { label: 'Stripe Invoices', href: '/admin/invoices' },
      { label: 'Create Invoice', href: '/admin/invoices/new' },
      { label: 'Orders (Deprecated)', href: '/admin/orders', deprecated: true },
    ],
  },
  {
    title: 'Shipping',
    icon: '📦',
    items: [
      { label: 'International Manifests', href: '/admin/shipping-manifests' },
    ],
  },
  {
    title: 'Marketing',
    icon: '📢',
    items: [
      { label: 'Campaigns', href: '/admin/campaigns' },
      { label: 'Engagement Events', href: '/admin/engagements' },
      { label: 'Marketing Center', href: '/admin/marketing' },
    ],
  },
  {
    title: 'Tools',
    icon: '🛠️',
    items: [
      { label: 'Test Reorder Link', href: '/admin/test-reorder-link' },
      { label: 'Quote Builder', href: '/admin/quote-builder' },
      { label: 'Content Blocks', href: '/admin/content-blocks' },
      { label: 'SKU Explorer', href: '/admin/sku-explorer' },
    ],
  },
  {
    title: 'Settings',
    icon: '⚙️',
    items: [
      { label: 'Users', href: '/admin/users' },
      { label: 'Brand Media', href: '/admin/brand-media' },
      { label: 'Categorize Companies', href: '/admin/categorize' },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} overflow-y-auto z-50`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold">Technifold Admin</h1>
            <p className="text-xs text-gray-400">Sales Engine</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Universal Company Search */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-800">
          <CompanySearchBar />
        </div>
      )}

      {/* Navigation Sections */}
      <div className="py-4">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </div>
            )}
            {collapsed && (
              <div className="px-4 mb-2 text-center" title={section.title}>
                <span className="text-xl">{section.icon}</span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : item.deprecated
                        ? 'text-gray-500 hover:bg-gray-800 hover:text-gray-400'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${collapsed ? 'text-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <span className={item.deprecated ? 'line-through' : ''}>
                        {collapsed ? item.label.charAt(0) : item.label}
                      </span>
                      {!collapsed && item.deprecated && (
                        <span className="text-xs bg-yellow-600 px-1 rounded">OLD</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="text-xs bg-red-600 px-1 rounded">{item.badge}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300">
            ← Back to Sales Center
          </Link>
        </div>
      )}
    </nav>
  );
}
