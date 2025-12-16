/**
 * Admin Layout - Clean Rebuild
 * Single auth system (cookie-based), single navigation
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cookie-based auth check (ONE auth system)
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin_authorized');

  if (!adminAuth || adminAuth.value !== 'true') {
    redirect('/login');
  }

  return (
    <>
      <AdminNav />
      <main className="ml-64 min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
}

export const metadata = {
  title: 'Technifold Admin',
  description: 'Sales and operations dashboard',
};
