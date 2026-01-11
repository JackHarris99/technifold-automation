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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/admin/sales"
                  className="text-[13px] text-[#475569] hover:text-[#1e40af] font-[500] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Sales Center
                </Link>
              </div>
              <h1 className="text-[32px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                My Performance
              </h1>
              <p className="text-[15px] text-[#475569] font-[500] mt-2">
                {currentUser.full_name} • {monthName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <PerformanceDashboard />
      </div>
    </div>
  );
}
