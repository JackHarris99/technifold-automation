/**
 * CSV Processing Page
 * Upload CSVs for systematic cleaning and processing
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import CSVProcessorClient from '@/components/admin/marketing/CSVProcessorClient';

export default async function CSVProcessorPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'director') {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Fetch existing CSV processing jobs
  const { data: jobs } = await supabase
    .from('csv_processing_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-[28px] font-[700] text-[#0a0a0a]">CSV Processor</h1>
          <p className="text-[14px] text-[#64748b] mt-1">
            Upload CSVs for systematic cleaning, deduplication, and validation
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CSVProcessorClient jobs={jobs || []} />
      </div>
    </div>
  );
}
