/**
 * Admin Layout Wrapper
 * Provides consistent layout with navigation for all admin pages
 */

'use client';

import AdminNav from './AdminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <AdminNav />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
