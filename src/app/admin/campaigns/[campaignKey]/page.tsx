/**
 * Campaign Detail/Edit Page
 * Update existing campaign in public.campaigns
 */

import { AdminHeader } from '@/components/admin/AdminHeader';
import { notFound, redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

interface CampaignPageProps {
  params: Promise<{
    campaignKey: string;
  }>;
}

export async function generateMetadata({ params }: CampaignPageProps) {
  const { campaignKey } = await params;
  return {
    title: `Campaign: ${campaignKey} | Technifold Admin`,
    description: 'Edit campaign details',
  };
}

async function updateCampaign(campaignKey: string, formData: FormData) {
  'use server';

  const supabase = getSupabaseClient();

  const name = formData.get('name') as string;
  const status = formData.get('status') as string;
  const offerKey = formData.get('offer_key') as string;
  const targetLevel = formData.get('target_level') as string;
  const targetModelId = formData.get('target_model_id') as string;

  const { error } = await supabase
    .from('campaigns')
    .update({
      name,
      status,
      offer_key: offerKey || null,
      target_level: targetLevel ? parseInt(targetLevel) : null,
      target_model_id: targetModelId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('campaign_key', campaignKey);

  if (error) {
    console.error('Error updating campaign:', error);
    throw new Error('Failed to update campaign');
  }

  redirect(`/admin/campaigns/${campaignKey}`);
}

async function deleteCampaign(campaignKey: string) {
  'use server';

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('campaign_key', campaignKey);

  if (error) {
    console.error('Error deleting campaign:', error);
    throw new Error('Failed to delete campaign');
  }

  redirect('/admin/campaigns');
}

export default async function CampaignDetailPage({ params }: CampaignPageProps) {
  const { campaignKey } = await params;
  const supabase = getSupabaseClient();

  // Fetch campaign
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('campaign_key', campaignKey)
    .single();

  if (error || !campaign) {
    notFound();
  }

  // Fetch asset_models for target selection
  const { data: assetModels } = await supabase
    .from('asset_models')
    .select('*')
    .order('level', { ascending: true })
    .order('display_name', { ascending: true });

  // Fetch campaign stats from v_campaign_interactions view
  const { data: interactions, count: interactionCount } = await supabase
    .from('v_campaign_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_key', campaignKey);

  // Count unique companies
  const { data: uniqueCompanies } = await supabase
    .from('v_campaign_interactions')
    .select('company_id')
    .eq('campaign_key', campaignKey);

  const uniqueCompanyCount = uniqueCompanies
    ? new Set(uniqueCompanies.map((i: any) => i.company_id)).size
    : 0;

  // Count unique contacts
  const { data: uniqueContacts } = await supabase
    .from('v_campaign_interactions')
    .select('contact_id')
    .eq('campaign_key', campaignKey)
    .not('contact_id', 'is', null);

  const uniqueContactCount = uniqueContacts
    ? new Set(uniqueContacts.map((i: any) => i.contact_id)).size
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="mt-2 text-gray-600">
            Campaign Key: <span className="font-mono text-sm">{campaignKey}</span>
          </p>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">Total Interactions</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{interactionCount || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">Unique Companies</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{uniqueCompanyCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase">Unique Contacts</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{uniqueContactCount}</div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form action={updateCampaign.bind(null, campaignKey)} className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={campaign.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue={campaign.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Offer Key */}
            <div>
              <label htmlFor="offer_key" className="block text-sm font-medium text-gray-700 mb-1">
                Offer Key (Optional)
              </label>
              <input
                type="text"
                id="offer_key"
                name="offer_key"
                pattern="[a-z0-9_-]*"
                defaultValue={campaign.offer_key || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Used to customize the offer page content
              </p>
            </div>

            {/* Target Level */}
            <div>
              <label htmlFor="target_level" className="block text-sm font-medium text-gray-700 mb-1">
                Target Level (Optional)
              </label>
              <select
                id="target_level"
                name="target_level"
                defaultValue={campaign.target_level?.toString() || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All machines (no targeting)</option>
                <option value="1">Family (Level 1)</option>
                <option value="2">Brand (Level 2)</option>
                <option value="3">Model (Level 3)</option>
              </select>
            </div>

            {/* Target Model ID */}
            <div>
              <label htmlFor="target_model_id" className="block text-sm font-medium text-gray-700 mb-1">
                Target Machine (Optional)
              </label>
              <select
                id="target_model_id"
                name="target_model_id"
                defaultValue={campaign.target_model_id || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All machines (no targeting)</option>
                {assetModels && assetModels.map((model: any) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.display_name} (Level {model.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Metadata Display */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500 space-y-1">
                <p>Created: {new Date(campaign.created_at).toLocaleString()}</p>
                {campaign.updated_at && (
                  <p>Updated: {new Date(campaign.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Save Changes
              </button>
              <a
                href="/admin/campaigns"
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 font-medium inline-block"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>

        {/* Delete Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
          <p className="text-red-700 mb-4">
            Deleting a campaign is permanent. All campaign data will be removed, but engagement events will be preserved.
          </p>
          <form action={deleteCampaign.bind(null, campaignKey)}>
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium"
              onClick={(e) => {
                if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                  e.preventDefault();
                }
              }}
            >
              Delete Campaign
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
