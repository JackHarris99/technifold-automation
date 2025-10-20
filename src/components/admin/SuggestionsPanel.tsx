/**
 * Suggestions Panel Component
 * Shows AI-driven next best actions for customer engagement
 */

'use client';

import { useEffect, useState } from 'react';

interface Suggestion {
  company_id: string;
  action_type: string;
  action_label: string;
  reason: string;
  priority_score: number;
  action_meta: Record<string, any>;
}

export function SuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/suggestions');
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>All caught up! No new suggestions at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Suggested Actions ({suggestions.length})
        </h3>
        <button
          onClick={fetchSuggestions}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.company_id}-${suggestion.action_type}-${index}`}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Priority indicator */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getPriorityColor(suggestion.priority_score)}`}>
              <span className="text-sm font-bold">{suggestion.priority_score}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">
                  {suggestion.action_label}
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getActionTypeStyle(suggestion.action_type)}`}>
                  {formatActionType(suggestion.action_type)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {suggestion.reason}
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(suggestion)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {getActionButtonText(suggestion.action_type)}
                </button>
                <button
                  onClick={() => viewCustomer(suggestion.company_id)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getPriorityColor(score: number): string {
  if (score >= 90) return 'bg-red-100 text-red-700';
  if (score >= 75) return 'bg-orange-100 text-orange-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-blue-100 text-blue-700';
}

function getActionTypeStyle(actionType: string): string {
  switch (actionType) {
    case 'reorder_reminder': return 'bg-purple-100 text-purple-700';
    case 'engagement_needed': return 'bg-orange-100 text-orange-700';
    case 'portal_invite': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function formatActionType(actionType: string): string {
  return actionType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getActionButtonText(actionType: string): string {
  switch (actionType) {
    case 'reorder_reminder': return 'Send Reminder';
    case 'engagement_needed': return 'Send Email';
    case 'portal_invite': return 'Send Invite';
    default: return 'Take Action';
  }
}

function handleAction(suggestion: Suggestion) {
  // TODO: Implement action handling (e.g., open email composer, create offer link)
  console.log('Taking action:', suggestion);
  alert(`Action: ${suggestion.action_label}\n\nThis would open an email composer or create a tokenized offer link.`);
}

function viewCustomer(companyId: string) {
  window.location.href = `/admin/customer/${companyId}`;
}
