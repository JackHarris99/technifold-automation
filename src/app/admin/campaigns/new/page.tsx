/**
 * New Campaign Page
 * Create new campaign in public.campaigns
 */

import { AdminHeader } from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export const metadata = {
  title: 'New Campaign | Technifold Admin',
  description: 'Create a new marketing campaign',
};

async function createCampaign(formData: FormData) {
  'use server';

  const supabase = getSupabaseClient();

  const name = formData.get('name') as string;
  const campaignKey = formData.get('campaign_key') as string;
  const status = formData.get('status') as string;
  const offerKey = formData.get('offer_key') as string;
  const targetLevel = formData.get('target_level') as string;
  const targetModelId = formData.get('target_model_id') as string;

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      campaign_key: campaignKey,
      name,
      status,
      offer_key: offerKey || null,
      target_level: targetLevel ? parseInt(targetLevel) : null,
      target_model_id: targetModelId || null,
    })
    .select('campaign_key')
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    throw new Error('Failed to create campaign');
  }

  redirect(`/admin/campaigns/${data.campaign_key}`);
}

export default async function NewCampaignPage() {
  const supabase = getSupabaseClient();

  // Fetch asset_models for target selection
  const { data: assetModels } = await supabase
    .from('asset_models')
    .select('*')
    .order('level', { ascending: true })
    .order('display_name', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="mt-2 text-gray-600">
            Define a new marketing campaign with targeting criteria
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form action={createCampaign} className="space-y-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Spring 2025 Reorder Reminder"
              />
            </div>

            {/* Campaign Key */}
            <div>
              <label htmlFor="campaign_key" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Key
              </label>
              <input
                type="text"
                id="campaign_key"
                name="campaign_key"
                required
                pattern="[a-z0-9_-]+"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., spring_2025_reorder"
              />
              <p className="mt-1 text-sm text-gray-500">
                Lowercase letters, numbers, underscores, and hyphens only
              </p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., reorder_reminder, new_product_launch"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All machines (no targeting)</option>
                <option value="1">Family (Level 1)</option>
                <option value="2">Brand (Level 2)</option>
                <option value="3">Model (Level 3)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Target companies with machines at this specificity level
              </p>
            </div>

            {/* Target Model ID */}
            <div>
              <label htmlFor="target_model_id" className="block text-sm font-medium text-gray-700 mb-1">
                Target Machine (Optional)
              </label>
              <select
                id="target_model_id"
                name="target_model_id"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All machines (no targeting)</option>
                {assetModels && assetModels.map((model: any) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.display_name} (Level {model.level})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Target companies with this specific machine
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Create Campaign
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
      </main>
    </div>
  );
}
