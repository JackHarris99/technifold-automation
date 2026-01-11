/**
 * Engagements Table Component
 * Filterable engagement history with type and rep filters
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface EngagementEvent {
  event_id: string;
  occurred_at: string;
  event_type: string;
  event_name: string;
  source: string;
  company_id: string;
  contact_id: string | null;
  offer_key: string | null;
  campaign_key: string | null;
  url: string | null;
  value: number | null;
  currency: string | null;
  companies: { company_name: string; account_owner: string | null } | null;
  contacts: { full_name: string; email: string } | null;
}

interface EngagementsTableProps {
  engagements: EngagementEvent[];
  engagementTypes: string[];
  isDirector: boolean;
  currentRepId: string;
}

export default function EngagementsTable({
  engagements,
  engagementTypes,
  isDirector,
  currentRepId
}: EngagementsTableProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique sales reps for director filter
  const salesReps = useMemo(() => {
    const reps = new Set<string>();
    engagements.forEach(e => {
      if (e.companies?.account_owner) {
        reps.add(e.companies.account_owner);
      }
    });
    return Array.from(reps).sort();
  }, [engagements]);

  // Filter engagements
  const filtered = useMemo(() => {
    let result = engagements;

    // Sales reps only see their companies
    if (!isDirector) {
      result = result.filter(e => e.companies?.account_owner === currentRepId);
    }

    // Director rep filter
    if (isDirector && repFilter !== 'all') {
      result = result.filter(e => e.companies?.account_owner === repFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(e => e.event_type === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.companies?.company_name?.toLowerCase().includes(term) ||
        e.contacts?.full_name?.toLowerCase().includes(term) ||
        e.event_name?.toLowerCase().includes(term) ||
        e.url?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [engagements, isDirector, currentRepId, repFilter, typeFilter, searchTerm]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view': return '👁️';
      case 'portal_view': return '🏠';
      case 'lead_captured': return '🎯';
      case 'email_sent': return '📧';
      case 'email_opened': return '📬';
      case 'email_clicked': return '🖱️';
      case 'order_created': return '🛒';
      case 'payment_completed': return '💳';
      default: return '📊';
    }
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      'vercel': 'bg-blue-100 text-blue-700',
      'stripe': 'bg-purple-100 text-purple-700',
      'zoho': 'bg-orange-100 text-orange-700',
      'admin': 'bg-green-100 text-green-700',
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Engagement Type Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Engagement Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="all">All Types ({engagements.length})</option>
              {engagementTypes.map(type => (
                <option key={type} value={type}>
                  {getEventIcon(type)} {type.replace(/_/g, ' ')} ({engagements.filter(e => e.event_type === type).length})
                </option>
              ))}
            </select>
          </div>

          {/* Director: Rep Filter */}
          {isDirector && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Sales Rep</label>
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
              >
                <option value="all">All Reps</option>
                {salesReps.map(rep => (
                  <option key={rep} value={rep}>{rep}</option>
                ))}
              </select>
            </div>
          )}

          {/* Search */}
          <div className={isDirector ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-bold text-gray-900 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Company name, contact, event..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="w-full px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
              <div className="text-sm text-blue-600">Showing</div>
              <div className="text-2xl font-bold text-blue-700">{filtered.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement List */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="text-gray-800 text-5xl mb-4">📊</div>
          <p className="text-gray-800 text-lg font-semibold">No engagements found</p>
          <p className="text-gray-700 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <div key={event.event_id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className="text-3xl">{getEventIcon(event.event_type)}</div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/admin/company/${event.company_id}`}
                        className="font-bold text-gray-900 hover:text-blue-600 truncate"
                      >
                        {event.companies?.company_name || event.company_id}
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSourceBadge(event.source)}`}>
                        {event.source}
                      </span>
                      {event.companies?.account_owner && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {event.companies.account_owner}
                        </span>
                      )}
                    </div>

                    <div className="text-gray-900 font-semibold mb-1">
                      {event.event_name.replace(/_/g, ' ')}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-800">
                      <span>📅 {new Date(event.occurred_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>

                      {event.contacts && (
                        <>
                          <span>•</span>
                          <span>👤 {event.contacts.full_name}</span>
                        </>
                      )}

                      {event.campaign_key && (
                        <>
                          <span>•</span>
                          <span>📢 {event.campaign_key}</span>
                        </>
                      )}

                      {event.value && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-green-600">
                            £{event.value.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>

                    {event.url && (
                      <div className="mt-2 text-xs text-gray-700 font-mono truncate">
                        🔗 {event.url}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
