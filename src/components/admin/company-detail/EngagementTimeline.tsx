/**
 * Engagement Timeline
 * Shows recent engagement events (last 30 days) grouped by contact
 */

'use client';

interface EngagementEvent {
  event_id: string;
  occurred_at: string;
  event_type: string;
  event_name: string;
  url?: string;
  meta?: any;
  contact_id?: string;
  contacts?: {
    full_name: string;
    email: string;
  };
}

interface EngagementTimelineProps {
  events: EngagementEvent[];
}

export default function EngagementTimeline({ events }: EngagementTimelineProps) {
  // Get event icon based on type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'portal_view':
        return '👁️';
      case 'email_open':
        return '📧';
      case 'email_click':
        return '🔗';
      case 'document_download':
        return '📥';
      case 'form_submit':
        return '📝';
      case 'page_view':
        return '📄';
      default:
        return '•';
    }
  };

  // Get event color based on type
  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'portal_view':
        return 'text-blue-600';
      case 'email_open':
      case 'email_click':
        return 'text-purple-600';
      case 'document_download':
        return 'text-green-600';
      case 'form_submit':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.occurred_at).toLocaleDateString('en-GB');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, EngagementEvent[]>);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Recent Activity ({events.length})
      </h2>
      <p className="text-xs text-gray-500 mb-4">Last 30 days</p>

      {events.length === 0 ? (
        <p className="text-gray-600 text-sm">No recent engagement</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(eventsByDate).map(([date, dateEvents]) => (
            <div key={date}>
              <div className="text-sm font-semibold text-gray-700 mb-2">{date}</div>
              <div className="space-y-2 ml-4">
                {dateEvents.map((event) => (
                  <div key={event.event_id} className="flex items-start gap-3 text-sm">
                    <span className={`text-lg ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                    </span>
                    <div className="flex-1">
                      <div className="text-gray-900">
                        {event.event_name || event.event_type}
                      </div>
                      <div className="text-xs text-gray-600">
                        {event.contacts?.full_name || 'Unknown contact'}
                        {' • '}
                        {new Date(event.occurred_at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {event.url && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {event.url}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
