/**
 * Campaigns Management Page
 * Create and manage progressive machine-learning campaigns
 */

import { AdminHeader } from '@/components/admin/AdminHeader';
import CampaignsList from '@/components/admin/campaigns/CampaignsList';
import { getSupabaseClient } from '@/lib/supabase';

export const metadata = {
  title: 'Marketing Campaigns | Technifold Admin',
  description: 'Create progressive campaigns to learn customer machines and sell tools',
};

async function getCampaigns() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCampaigns:', error);
    return [];
  }
}

async function getMachineTaxonomy() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('machine_taxonomy')
      .select('*')
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching machine taxonomy:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMachineTaxonomy:', error);
    return [];
  }
}

async function getKnowledgeStats() {
  try {
    const supabase = getSupabaseClient();

    // Get count of companies by knowledge level
    const { data: knowledgeData, error: knowledgeError } = await supabase
      .from('company_machine_knowledge')
      .select('confidence_level, company_id');

    if (knowledgeError) {
      console.error('Error fetching knowledge stats:', error);
      return { total: 0, byLevel: {} };
    }

    const byLevel = (knowledgeData || []).reduce((acc: any, item: any) => {
      acc[item.confidence_level] = (acc[item.confidence_level] || 0) + 1;
      return acc;
    }, {});

    // Get total unique companies
    const uniqueCompanies = new Set((knowledgeData || []).map((item: any) => item.company_id));

    return {
      total: uniqueCompanies.size,
      byLevel,
    };
  } catch (error) {
    console.error('Error in getKnowledgeStats:', error);
    return { total: 0, byLevel: {} };
  }
}

export default async function CampaignsPage() {
  const [campaigns, machineTaxonomy, knowledgeStats] = await Promise.all([
    getCampaigns(),
    getMachineTaxonomy(),
    getKnowledgeStats(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketing Campaigns</h1>
          <p className="mt-2 text-gray-600">
            Create progressive campaigns that learn about customer machines with each interaction
          </p>
        </div>

        {/* Knowledge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Companies</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {knowledgeStats.total}
            </div>
            <div className="mt-1 text-xs text-gray-500">with machine data</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-blue-700">Clicked Links</div>
            <div className="mt-2 text-3xl font-semibold text-blue-900">
              {knowledgeStats.byLevel[2] || 0}
            </div>
            <div className="mt-1 text-xs text-blue-600">need confirmation</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-green-700">Confirmed</div>
            <div className="mt-2 text-3xl font-semibold text-green-900">
              {knowledgeStats.byLevel[3] || 0}
            </div>
            <div className="mt-1 text-xs text-green-600">sales verified</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-purple-700">Verified</div>
            <div className="mt-2 text-3xl font-semibold text-purple-900">
              {knowledgeStats.byLevel[4] || 0}
            </div>
            <div className="mt-1 text-xs text-purple-600">from orders</div>
          </div>
        </div>

        {/* Campaigns List */}
        <CampaignsList
          campaigns={campaigns}
          machineTaxonomy={machineTaxonomy}
        />
      </main>
    </div>
  );
}
