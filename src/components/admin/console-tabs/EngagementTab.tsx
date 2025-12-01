/**
 * Engagement Tab - Timeline of customer interactions
 * Shows all engagement events for this company
 */

'use client';

import { useState, useEffect } from 'react';

interface EngagementEvent {
  event_id: string;
  occurred_at: string;
  event_name: string;
  contact_id?: string;
  contact_name?: string;
  source: string;
  url?: string;
  campaign_key?: string;
  offer_key?: string;
  value?: number;
  currency?: string;
  meta?: any;
}

interface EngagementTabProps {
  companyId: string;
  contacts: any[];
}

export default function EngagementTab({ companyId, contacts }: EngagementTabProps) {
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, [companyId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/engagement-feed?company_id=${companyId}&limit=200`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch engagement events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactName = (contactId?: string) => {
    if (!contactId) return 'Company-level';
    const contact = contacts.find(c => c.contact_id === contactId);
    return contact?.full_name || contact?.email || 'Unknown Contact';
  };

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'offer_view':
      case 'portal_visit':
        return '👁️';
      case 'email_opened':
        return '📧';
      case 'email_clicked':
        return '🖱️';
      case 'checkout_started':
        return '🛒';
      case 'checkout_completed':
        return '✅';
      default:
        return '📍';
    }
  };

  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case 'checkout_completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'checkout_started':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'email_opened':
      case 'email_clicked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offer_view':
      case 'portal_visit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.event_name === filter);

  const eventTypes = [...new Set(events.map(e => e.event_name))];

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading engagement timeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Engagement Timeline</h2>
          <p className="text-gray-600 mt-1">All interactions with this customer</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Events ({events.length})</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type} ({events.filter(e => e.event_name === type).length})
              </option>
            ))}
          </select>

          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">No engagement events found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <div key={event.event_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2 ${getEventColor(event.event_name)}`}>
                    {getEventIcon(event.event_name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.event_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                        <p className="text-sm text-gray-600">{getContactName(event.contact_id)}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{new Date(event.occurred_at).toLocaleDateString()}</div>
                        <div>{new Date(event.occurred_at).toLocaleTimeString()}</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-sm">
                      {event.campaign_key && (
                        <div className="text-gray-700">
                          <span className="font-medium">Campaign:</span> {event.campaign_key}
                        </div>
                      )}
                      {event.offer_key && (
                        <div className="text-gray-700">
                          <span className="font-medium">Offer:</span> {event.offer_key}
                        </div>
                      )}
                      {event.url && (
                        <div className="text-gray-500 truncate">
                          <span className="font-medium">URL:</span> {event.url}
                        </div>
                      )}
                      {event.value && (
                        <div className="text-green-700 font-semibold">
                          Value: {event.currency}{event.value.toFixed(2)}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Source: {event.source}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredEvents.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      )}
    </div>
  );
}
