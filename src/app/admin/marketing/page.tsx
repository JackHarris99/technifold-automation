/**
 * Marketing Suite Homepage
 * Bulk campaign management and lead generation
 */

import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function MarketingSuitePage() {
  const supabase = getSupabaseClient();

  // Fetch campaign stats
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent prospects
  const { data: prospects } = await supabase
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch engagement stats (last 30 days)
  const { data: engagementStats } = await supabase
    .from('engagement_events')
    .select('event_type')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const openRate = engagementStats
    ? (engagementStats.filter(e => e.event_type === 'open').length /
       Math.max(engagementStats.filter(e => e.event_type === 'sent').length, 1) * 100).toFixed(1)
    : '0.0';

  const clickRate = engagementStats
    ? (engagementStats.filter(e => e.event_type === 'click').length /
       Math.max(engagementStats.filter(e => e.event_type === 'sent').length, 1) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Marketing Suite
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bulk campaigns, lead generation, and engagement tracking
              </p>
            </div>
            <Link
              href="/admin/marketing/campaigns/new"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
            >
              + New Campaign
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="Emails Sent (30d)"
            value={engagementStats?.filter(e => e.event_type === 'sent').length.toString() || '0'}
            icon="📧"
            color="blue"
          />
          <MetricCard
            label="Open Rate"
            value={`${openRate}%`}
            icon="📬"
            color="green"
          />
          <MetricCard
            label="Click Rate"
            value={`${clickRate}%`}
            icon="🖱️"
            color="purple"
          />
          <MetricCard
            label="Active Prospects"
            value={prospects?.length.toString() || '0'}
            icon="👥"
            color="orange"
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            href="/admin/campaigns"
            icon="📧"
            title="Email Campaigns"
            description="Create and manage bulk email campaigns"
            color="blue"
          />
          <ActionCard
            href="/admin/prospects"
            icon="👥"
            title="Prospects"
            description="Import and manage prospect lists"
            color="green"
          />
          <ActionCard
            href="/admin/engagements"
            icon="📊"
            title="Engagement Analytics"
            description="Track opens, clicks, and conversions"
            color="purple"
          />
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Campaigns</h2>
            <Link
              href="/admin/campaigns"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {!campaigns || campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No campaigns yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first email campaign to get started
              </p>
              <Link
                href="/admin/marketing/campaigns/new"
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {campaigns.map((campaign: any) => (
                <CampaignRow key={campaign.campaign_id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>

        {/* Content Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickLinkCard
            href="/admin/quote-requests"
            icon="📬"
            title="Quote Requests"
            description="View and respond to inbound quote requests"
          />
          <QuickLinkCard
            href="/admin/content-blocks"
            icon="📝"
            title="Content Library"
            description="Manage email templates and brand assets"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    green: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  };

  return (
    <Link
      href={href}
      className={`block bg-white border-2 ${colorClasses[color]} rounded-lg p-6 transition-all`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

function CampaignRow({ campaign }: { campaign: any }) {
  return (
    <Link
      href={`/admin/campaigns/${campaign.campaign_id}`}
      className="block p-6 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{campaign.name || 'Untitled Campaign'}</h3>
          <p className="text-sm text-gray-600">
            Created {new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {campaign.sent_count || 0} sent
            </p>
            <p className="text-xs text-gray-500">
              {campaign.open_rate ? `${campaign.open_rate}% open` : 'No opens yet'}
            </p>
          </div>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function QuickLinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-md transition-all"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
