/**
 * Admin Layout - 3-Section Architecture
 * Sales Center | Marketing Suite | CRM
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';

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

  return (
    <>
      <AdminNav />
      <main className="ml-64 min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
}
