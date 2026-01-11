/**
 * Individual Rep Commission and Activity Dashboard
 * Shows current month commission, activity metrics, and team rankings
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Client component for fetching and displaying data
import PerformanceDashboard from '@/components/admin/PerformanceDashboard';

export default async function MyPerformancePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link
                  href="/admin/sales"
                  className="text-gray-700 hover:text-gray-700"
                >
                  ← Sales Center
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Performance - {monthName}
              </h1>
              <p className="text-sm text-gray-800 mt-1">
                {currentUser.full_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <PerformanceDashboard />
      </div>
    </div>
  );
}
