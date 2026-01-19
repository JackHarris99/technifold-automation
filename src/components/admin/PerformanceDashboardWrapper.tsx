/**
 * Performance Dashboard Wrapper with Tabs (Directors Only)
 * Allows Directors to view performance for any sales rep
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import PerformanceDashboard from './PerformanceDashboard';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: 'director' | 'sales_rep';
  sales_rep_id?: string | null;
}

interface PerformanceDashboardWrapperProps {
  currentUser: User;
  viewingSalesRep: string | null;
  isDirector: boolean;
  monthName: string;
}

export default function PerformanceDashboardWrapper({
  currentUser,
  viewingSalesRep: initialViewingSalesRep,
  isDirector,
  monthName,
}: PerformanceDashboardWrapperProps) {
  // For Directors, allow switching between reps
  const [selectedRep, setSelectedRep] = useState<string | null>(initialViewingSalesRep);

  const salesReps = [
    { id: 'Lee', name: 'Lee' },
    { id: 'Steve', name: 'Steve' },
    { id: 'Callum', name: 'Callum' },
  ];

  const getDisplayName = () => {
    if (!isDirector) return currentUser.full_name;
    if (!selectedRep) return 'All Team';
    return salesReps.find(r => r.id === selectedRep)?.name || selectedRep;
  };

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
                Performance Dashboard
              </h1>
              <p className="text-[15px] text-[#475569] font-[500] mt-2">
                {getDisplayName()} • {monthName}
              </p>
            </div>
          </div>

          {/* Tabs for Directors */}
          {isDirector && (
            <div className="flex gap-2 mt-6 border-b border-[#e8e8e8]">
              {salesReps.map((rep) => (
                <button
                  key={rep.id}
                  onClick={() => setSelectedRep(rep.id)}
                  className={`px-4 py-2 text-[13px] font-[600] transition-colors border-b-2 ${
                    selectedRep === rep.id
                      ? 'border-[#1e40af] text-[#1e40af]'
                      : 'border-transparent text-[#64748b] hover:text-[#1e40af]'
                  }`}
                >
                  {rep.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <PerformanceDashboard salesRepId={selectedRep} />
      </div>
    </div>
  );
}
