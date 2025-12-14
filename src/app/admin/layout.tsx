/**
 * Admin Layout - 3-Section Architecture
 * Sales Center | Marketing Suite | CRM
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isDirector, getCurrentUser } from '@/lib/auth';
import AdminNavigation from '@/components/admin/AdminNavigation';

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
          <Link href="/admin/sales" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Technifold</h1>
              <p className="text-blue-200 text-xs">Sales Engine</p>
            </div>
          </Link>
        </div>

        {/* Section Tabs */}
        <div className="px-3 py-4 border-b border-blue-500/30">
          <div className="space-y-1">
            <SectionTab href="/admin/sales" label="Sales Center" icon="🎯" />
            <SectionTab href="/admin/marketing" label="Marketing" icon="📧" />
            <SectionTab href="/admin/crm" label="CRM" icon="🏢" />
          </div>
        </div>

        {/* Dynamic Navigation based on current section */}
        <AdminNavigation isDirector={isDir} />

        {/* User Info & Actions */}
        <div className="p-4 border-t border-blue-500/30 space-y-2 mt-auto">
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

function SectionTab({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-4 py-3 text-blue-100 hover:bg-white/10 rounded-lg transition-all font-medium text-sm"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
