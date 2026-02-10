/**
 * Prospects List Page
 * View and filter all prospects
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import ProspectsListClient from '@/components/admin/marketing/ProspectsListClient';

export default async function ProspectsListPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'director') {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Fetch prospects (companies with customer_status = 'prospect')
  const { data: prospects } = await supabase
    .from('companies')
    .select(`
      company_id,
      company_name,
      country,
      source,
      lead_score,
      lead_temperature,
      created_at,
      updated_at
    `)
    .eq('customer_status', 'prospect')
    .order('updated_at', { ascending: false })
    .limit(1000);

  // Get counts by temperature
  const { data: tempCounts } = await supabase
    .from('companies')
    .select('lead_temperature', { count: 'exact' })
    .eq('customer_status', 'prospect');

  const counts = {
    total: prospects?.length || 0,
    cold: tempCounts?.filter(p => p.lead_temperature === 'cold').length || 0,
    warm: tempCounts?.filter(p => p.lead_temperature === 'warm').length || 0,
    hot: tempCounts?.filter(p => p.lead_temperature === 'hot').length || 0,
    qualified: tempCounts?.filter(p => p.lead_temperature === 'qualified').length || 0,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-[700] text-[#0a0a0a]">Prospects</h1>
              <p className="text-[14px] text-[#64748b] mt-1">
                {counts.total} prospects in your marketing database
              </p>
            </div>
            <a
              href="/admin/marketing/prospects/import"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-[600] text-[14px] hover:bg-blue-700 transition-colors"
            >
              Import Prospects
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-[24px] font-[700] text-gray-600">{counts.cold}</div>
              <div className="text-[12px] text-[#64748b]">Cold</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-[24px] font-[700] text-yellow-600">{counts.warm}</div>
              <div className="text-[12px] text-[#64748b]">Warm</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-[24px] font-[700] text-orange-600">{counts.hot}</div>
              <div className="text-[12px] text-[#64748b]">Hot</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-[24px] font-[700] text-purple-600">{counts.qualified}</div>
              <div className="text-[12px] text-[#64748b]">Qualified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProspectsListClient prospects={prospects || []} />
      </div>
    </div>
  );
}
