/**
 * Admin Layout - Auth + Navigation for admin pages
 * In development: allows access without auth
 * In production: checks for admin_authorized cookie
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In production, check for admin_authorized cookie
  if (process.env.NODE_ENV !== 'development') {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get('admin_authorized');

    if (!adminAuth || adminAuth.value !== 'true') {
      redirect('/login');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Technifold Admin
              </Link>

              <div className="flex gap-1">
                <NavLink href="/admin/company" label="Company Console" highlight />
                <NavLink href="/admin/sku-explorer" label="SKU Explorer" />
                <NavLink href="/admin/ms-problem-editor" label="Copy Editor" />
                <NavLink href="/admin/system-check" label="System Check" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to site
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}

function NavLink({ href, label, highlight, small }: { href: string; label: string; highlight?: boolean; small?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        small ? 'text-xs' : 'text-sm'
      } ${
        highlight
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {label}
    </Link>
  );
}
