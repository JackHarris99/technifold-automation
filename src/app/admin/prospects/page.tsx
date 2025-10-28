/**
 * Admin Prospects Page
 * /admin/prospects - Help sales team chase prospects and confirm machines
 */

import { getSupabaseClient } from '@/lib/supabase';
import ProspectsTable from '@/components/admin/ProspectsTable';

export default async function ProspectsPage() {
  const supabase = getSupabaseClient();

  // Fetch companies with their machines and recent engagement
  const { data: companies } = await supabase
    .from('companies')
    .select(`
      company_id,
      company_name,
      account_owner,
      type,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(500);

  // Fetch all company_machine records for these companies
  const companyIds = companies?.map(c => c.company_id) || [];

  let companyMachines = [];
  if (companyIds.length > 0) {
    const { data } = await supabase
      .from('company_machine')
      .select(`
        *,
        machines:machine_id (
          machine_id,
          brand,
          model,
          display_name,
          slug
        )
      `)
      .in('company_id', companyIds);

    companyMachines = data || [];
  }

  // Fetch recent engagement events (last 30 days)
  let recentEngagement: Record<string, any[]> = {};
  if (companyIds.length > 0) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: events } = await supabase
      .from('engagement_events')
      .select('company_id, event_name, created_at, url')
      .in('company_id', companyIds)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Group by company_id
    if (events) {
      events.forEach(event => {
        if (!recentEngagement[event.company_id]) {
          recentEngagement[event.company_id] = [];
        }
        recentEngagement[event.company_id].push(event);
      });
    }
  }

  // Combine data
  const prospectsData = (companies || []).map(company => {
    const machines = companyMachines.filter(cm => cm.company_id === company.company_id);
    const engagement = recentEngagement[company.company_id] || [];

    return {
      ...company,
      machines,
      engagement: engagement.slice(0, 5) // Limit to 5 most recent events
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Prospects & Machines
              </h1>
              <p className="text-gray-600">
                Track which machines your customers run • Assign reps • Send targeted offers
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{prospectsData.length}</div>
              <div className="text-sm text-gray-500">Total companies</div>
            </div>
          </div>
        </div>

        <ProspectsTable prospects={prospectsData} />
      </div>
    </div>
  );
}
