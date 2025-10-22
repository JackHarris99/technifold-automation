/**
 * Admin Layout - Dev-minimum authentication for admin pages
 * In development: allows access without auth
 * In production: checks for admin_authorized cookie
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In development, allow access without auth
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  // In production, check for admin_authorized cookie
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin_authorized');

  if (!adminAuth || adminAuth.value !== 'true') {
    // Redirect to login page
    redirect('/login');
  }

  return <>{children}</>;
}
