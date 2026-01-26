/**
 * Company Engagement Timeline
 * Shows engagement score and expandable activity feed
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ActivityEvent {
  activity_id: string;
  event_type: string;
  source: string;
  url: string;
  occurred_at: string;
  score: number;
  object_type?: string;
}

interface CompanyEngagement {
  company_id: string;
  company_name: string;
  total_score: number;
  score_30d: number;
  score_7d: number;
  last_activity_at: string | null;
  activity_count: number;
  recent_events: ActivityEvent[];
  heat_level: 'cold' | 'warm' | 'hot' | 'fire';
}

interface Props {
  companies: { company_id: string; company_name: string }[];
  limit?: number;
  showExpanded?: boolean;
}

export default function CompanyEngagementTimeline({ companies, limit = 10, showExpanded = false }: Props) {
  const [engagements, setEngagements] = useState<CompanyEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    if (companies.length === 0) {
      setLoading(false);
      return;
    }

    // Skip loading if there are too many companies (to avoid URL length issues)
    if (companies.length > 100) {
      console.log(`Skipping engagement load for ${companies.length} companies (too many)`);
      setLoading(false);
      return;
    }

    const companyIds = companies.map(c => c.company_id).join(',');

    fetch(`/api/admin/engagement/company-activity?company_ids=${encodeURIComponent(companyIds)}`)
      .then(res => res.json())
      .then(data => {
        // Merge company names with engagement data
        const enriched = data.engagements.map((eng: any) => {
          const company = companies.find(c => c.company_id === eng.company_id);
          return {
            ...eng,
            company_name: company?.company_name || 'Unknown',
          };
        });

        // Sort by 7-day score (most engaged first)
        enriched.sort((a: CompanyEngagement, b: CompanyEngagement) => b.score_7d - a.score_7d);

        setEngagements(enriched.slice(0, limit));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load engagement:', err);
        setLoading(false);
      });
  }, [companies, limit]);

  const getHeatEmoji = (heat: string) => {
    switch (heat) {
      case 'fire': return '🔥';
      case 'hot': return '🌡️';
      case 'warm': return '☀️';
      case 'cold': return '❄️';
      default: return '⚪';
    }
  };

  const getHeatColor = (heat: string) => {
    switch (heat) {
      case 'fire': return 'bg-red-100 text-red-700 border-red-300';
      case 'hot': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'warm': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cold': return 'bg-gray-100 text-gray-600 border-gray-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'order_placed': '💰 Placed Order',
      'subscription_created': '📋 Created Subscription',
      'quote_requested': '💬 Requested Quote',
      'trial_started': '🧪 Started Trial',
      'reorder_view': '🔄 Viewed Reorder Portal',
      'quote_view': '📄 Viewed Quote',
      'offer_view': '🎁 Viewed Offer',
      'product_view': '📦 Viewed Product',
      'solution_page_view': '🎯 Viewed Solution',
      'machine_page_view': '🏭 Viewed Machine Page',
      'email_click': '📧 Clicked Email',
      'page_view': '👁️ Viewed Page',
      'subscription_page_view': '📋 Viewed Subscription Page',
    };
    return labels[eventType] || `📌 ${eventType}`;
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      'marketing_email': 'Email Campaign',
      'reorder_link': 'Reorder Link',
      'quote_link': 'Quote Link',
      'offer_link': 'Offer Link',
      'google': 'Google Search',
      'direct': 'Direct Visit',
      'customer_cookie': 'Returning Customer',
    };
    return labels[source] || source;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (engagements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <p>No engagement data yet</p>
        <p className="text-sm mt-1">Activity will appear here once customers start interacting</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {engagements.map((engagement) => (
        <div
          key={engagement.company_id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Company Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpandedCompany(expandedCompany === engagement.company_id ? null : engagement.company_id)}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`px-3 py-1 rounded-full border-2 text-sm font-bold ${getHeatColor(engagement.heat_level)}`}>
                {getHeatEmoji(engagement.heat_level)} {engagement.score_7d}
              </div>
              <div>
                <Link
                  href={`/admin/company/${engagement.company_id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {engagement.company_name}
                </Link>
                <p className="text-xs text-gray-600">
                  {engagement.activity_count} interaction{engagement.activity_count !== 1 ? 's' : ''} •{' '}
                  Last: {engagement.last_activity_at
                    ? new Date(engagement.last_activity_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Never'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">30d: {engagement.score_30d}</span>
              <span className="text-gray-400">{expandedCompany === engagement.company_id ? '▼' : '▶'}</span>
            </div>
          </div>

          {/* Expanded Timeline */}
          {expandedCompany === engagement.company_id && engagement.recent_events.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {engagement.recent_events.map((event) => (
                  <div
                    key={event.activity_id}
                    className="flex items-start gap-3 text-sm bg-white p-3 rounded border border-gray-200"
                  >
                    <div className="flex-shrink-0">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        +{event.score}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{getEventLabel(event.event_type)}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {getSourceLabel(event.source)} • {new Date(event.occurred_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {event.url && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {event.url}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
