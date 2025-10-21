/**
 * Campaigns List Component
 * Displays all campaigns with create/manage functionality
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import CreateCampaignModal from './CreateCampaignModal';

interface Campaign {
  campaign_key: string;
  campaign_name: string;
  campaign_type: string;
  product_codes: string[];
  status: string;
  links_generated: number;
  clicks_total: number;
  conversions_total: number;
  created_at: string;
}

interface MachineTaxonomy {
  id: string;
  level: number;
  slug: string;
  display_name: string;
  parent_id: string | null;
}

interface CampaignsListProps {
  campaigns: Campaign[];
  machineTaxonomy: MachineTaxonomy[];
}

export default function CampaignsList({ campaigns, machineTaxonomy }: CampaignsListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header with Create Button */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Active Campaigns</h2>
            <p className="mt-1 text-sm text-gray-500">
              Progressive campaigns that learn customer machines through interactions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new progressive campaign.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.campaign_key} className="bg-white shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {campaign.campaign_type}
                  </span>
                </div>

                {/* Campaign Name */}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {campaign.campaign_name}
                </h3>

                {/* Products */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Products:</div>
                  <div className="flex flex-wrap gap-1">
                    {campaign.product_codes.slice(0, 3).map((code, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {code}
                      </span>
                    ))}
                    {campaign.product_codes.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        +{campaign.product_codes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500">Links</div>
                    <div className="text-lg font-semibold text-gray-900">{campaign.links_generated || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Clicks</div>
                    <div className="text-lg font-semibold text-gray-900">{campaign.clicks_total || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Conversions</div>
                    <div className="text-lg font-semibold text-gray-900">{campaign.conversions_total || 0}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/campaigns/${campaign.campaign_key}`}
                    className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/admin/campaigns/${campaign.campaign_key}/links`}
                    className="flex-1 text-center px-3 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                  >
                    Generate Links
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          machineTaxonomy={machineTaxonomy}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
