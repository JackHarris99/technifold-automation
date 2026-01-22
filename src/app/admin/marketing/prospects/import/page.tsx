/**
 * Prospect Import Page
 * Bulk CSV import with deduplication check
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProspectImportClient from '@/components/admin/marketing/ProspectImportClient';

export default async function ProspectImportPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'director') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-[28px] font-[700] text-[#0a0a0a]">Import Prospects</h1>
          <p className="text-[14px] text-[#64748b] mt-1">
            Upload CSV files to add prospects to your marketing database
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProspectImportClient />
      </div>
    </div>
  );
}
