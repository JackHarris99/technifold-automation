/**
 * Individual Rep Commission and Activity Dashboard
 * Shows current month commission, activity metrics, and team rankings
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSalesRepFromViewMode, type ViewMode } from '@/lib/viewMode';
import PerformanceDashboardWrapper from '@/components/admin/PerformanceDashboardWrapper';

export default async function MyPerformancePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Get view mode from cookies
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get('view_mode');
  const viewModeValue = viewModeCookie?.value || 'all';

  // Parse view mode
  let viewMode: ViewMode = 'all';
  if (viewModeValue === 'my_customers') viewMode = 'my_customers';
  else if (viewModeValue === 'view_as_lee') viewMode = 'view_as_lee';
  else if (viewModeValue === 'view_as_steve') viewMode = 'view_as_steve';
  else if (viewModeValue === 'view_as_callum') viewMode = 'view_as_callum';

  // Determine which sales rep to show performance for
  const viewingSalesRep = getSalesRepFromViewMode(viewMode, currentUser.sales_rep_id || currentUser.full_name);
  const isDirector = currentUser.role === 'director';

  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <PerformanceDashboardWrapper
      currentUser={currentUser}
      viewingSalesRep={viewingSalesRep}
      isDirector={isDirector}
      monthName={monthName}
    />
  );
}
