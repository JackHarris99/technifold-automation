/**
 * Admin Layout - Auth + Left Sidebar Navigation
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isDirector, getCurrentUser } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check for admin_authorized cookie
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin_authorized');

  if (!adminAuth || adminAuth.value !== 'true') {
    redirect('/login');
  }

  const isDir = await isDirector();
  const currentUser = await getCurrentUser();

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

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            <div className="text-blue-200 text-xs uppercase font-semibold tracking-wider px-3">
              Overview
            </div>
          </div>

          <SidebarLink href="/admin/dashboard" icon="📊" label="Dashboard" />

          <div className="px-3 mt-6 mb-2">
            <div className="text-blue-200 text-xs uppercase font-semibold tracking-wider px-3">
              Sales
            </div>
          </div>

          <SidebarLink href="/admin/companies" icon="🏢" label="Companies" />
          <SidebarLink href="/admin/quote-requests" icon="📋" label="Leads" />
          <SidebarLink href="/admin/quote-builder-v2" icon="📄" label="Create Quote" />
          <SidebarLink href="/admin/campaigns" icon="📧" label="Campaigns" />
          <SidebarLink href="/admin/orders" icon="📦" label="Orders" />
          <SidebarLink href="/admin/rentals" icon="🔄" label="Rentals" />
          <SidebarLink href="/admin/engagements" icon="📊" label="Engagement" />

          {isDir && (
            <>
              <div className="px-3 mt-6 mb-2">
                <div className="text-blue-200 text-xs uppercase font-semibold tracking-wider px-3">
                  Admin Tools
                </div>
              </div>
              <SidebarLink href="/admin/users" icon="👥" label="Users" />
              <SidebarLink href="/admin/categorize" icon="🏷️" label="Categorize" />
              <SidebarLink href="/admin/ms-problem-editor" icon="✏️" label="Copy Editor" />
              <SidebarLink href="/admin/brand-media" icon="🎨" label="Brand Media" />
              <SidebarLink href="/admin/media-missing" icon="🖼️" label="Missing Media" />
            </>
          )}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-blue-500/30 space-y-2">
          {currentUser && (
            <div className="flex items-center space-x-3 text-white px-2 py-2 bg-white/10 rounded-lg">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">{currentUser.role === 'director' ? '👑' : '👤'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.full_name}</p>
                <p className="text-xs text-blue-200 capitalize">{currentUser.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <a
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-100 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Site
            </a>
            <a
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-100 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </a>
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

function SidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-6 py-3 text-blue-100 hover:bg-white/10 transition-all"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
