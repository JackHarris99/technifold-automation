/**
 * Admin Layout - Clean Rebuild
 * Single auth system (cookie-based), single navigation
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

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
    <div className={inter.className}>
      <AdminNav />
      <main className="ml-64 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Technifold Admin',
  description: 'Sales and operations dashboard',
};
