/**
 * Admin Layout - Left sidebar navigation for admin section
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
  userRole?: 'director' | 'sales_rep';
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  directorOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'companies', label: 'Companies', icon: '🏢', path: '/admin/company' },
  { id: 'leads', label: 'Leads', icon: '📋', path: '/admin/quote-requests' },
  { id: 'quotes', label: 'Quotes', icon: '📄', path: '/admin/quote-builder-v2' },
  { id: 'orders', label: 'Orders', icon: '✅', path: '/admin/orders' },
  { id: 'rentals', label: 'Rentals', icon: '🔄', path: '/admin/rentals' },
  { id: 'campaigns', label: 'Campaigns', icon: '📧', path: '/admin/campaigns' },
  { id: 'admin', label: 'Admin', icon: '⚙️', path: '/admin/settings', directorOnly: true },
];

export default function AdminLayout({ children, userRole = 'sales_rep' }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active section based on current path
  const getActiveSection = () => {
    if (pathname.startsWith('/admin/company')) return 'companies';
    if (pathname.startsWith('/admin/quote-requests')) return 'leads';
    if (pathname.startsWith('/admin/quote-builder')) return 'quotes';
    if (pathname.startsWith('/admin/orders')) return 'orders';
    if (pathname.startsWith('/admin/rentals')) return 'rentals';
    if (pathname.startsWith('/admin/campaigns')) return 'campaigns';
    if (pathname.startsWith('/admin/settings')) return 'admin';
    return 'companies';
  };

  const activeSection = getActiveSection();

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.directorOnly && userRole !== 'director') {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-600 to-indigo-700 shadow-xl flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-blue-500/30">
          <Link href="/admin/company" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Technifold</h1>
              <p className="text-blue-200 text-xs">Sales Console</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {visibleNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center space-x-3 px-6 py-3 transition-all ${
                activeSection === item.id
                  ? 'bg-white/20 border-l-4 border-white text-white'
                  : 'text-blue-100 hover:bg-white/10 border-l-4 border-transparent'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-blue-500/30">
          <div className="flex items-center space-x-3 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Sales User</p>
              <p className="text-xs text-blue-200 capitalize">{userRole.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
