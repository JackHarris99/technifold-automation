/**
 * Quotes Management Page
 * Shows all quotes with filtering, status tracking, and quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getViewMode, addViewModeToUrl } from '@/lib/viewMode';

interface Quote {
  quote_id: string;
  company_id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  created_by: string;
  created_by_name: string;
  quote_type: 'static' | 'interactive';
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'expired';
  total_amount: number;
  created_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  last_activity: string | null;
  account_owner: string | null;
  free_shipping?: boolean;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  async function fetchQuotes() {
    setLoading(true);
    try {
      const viewMode = getViewMode();
      const params = new URLSearchParams();
      if (viewMode === 'my_customers') params.set('viewMode', 'my_customers');
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/quotes/list?${params}`);

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        setQuotes([]);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setQuotes(data.quotes || []);
      } else {
        console.error('API returned error:', data.error);
        setQuotes([]);
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuote(quoteId: string, companyName: string) {
    if (!confirm(`Are you sure you want to delete this quote for ${companyName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Quote deleted successfully');
        fetchQuotes(); // Refresh the list
      } else {
        alert('Failed to delete quote: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to delete quote:', error);
      alert('Failed to delete quote');
    }
  }

  async function handleEditQuote(quoteId: string) {
    try {
      // Fetch quote details to determine which builder to use
      const response = await fetch(`/api/admin/quotes/${quoteId}`);

      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        alert(`Failed to load quote: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log('Quote data:', data);

      if (!data.success || !data.quote) {
        alert('Failed to load quote details: ' + (data.error || 'Unknown error'));
        return;
      }

      const lineItems = data.quote.line_items || [];

      if (lineItems.length === 0) {
        // No line items - default to tools builder (can add items there)
        alert('This quote has no items yet. Opening tools builder.');
        window.location.href = `/admin/quote-builder/tools?edit=${quoteId}`;
        return;
      }

      // Check product types in line items
      const hasTools = lineItems.some((item: any) => item.product_type === 'tool');
      const hasConsumables = lineItems.some((item: any) => item.product_type === 'consumable');

      // Route to appropriate builder
      if (hasTools && !hasConsumables) {
        // Tools only
        window.location.href = `/admin/quote-builder/tools?edit=${quoteId}`;
      } else if (hasConsumables && !hasTools) {
        // Consumables only
        window.location.href = `/admin/quote-builder/consumables?edit=${quoteId}`;
      } else {
        // Mixed or unknown - default to tools builder
        alert('This quote contains mixed product types. Defaulting to tools builder.');
        window.location.href = `/admin/quote-builder/tools?edit=${quoteId}`;
      }
    } catch (error) {
      console.error('Failed to determine quote type:', error);
      alert('Error loading quote for editing: ' + error);
    }
  }

  function getStatusBadge(quote: Quote) {
    const now = new Date();
    const expiresAt = quote.expires_at ? new Date(quote.expires_at) : null;
    const isExpired = expiresAt && expiresAt < now;

    if (isExpired) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">🔴 Expired</span>;
    }

    if (quote.accepted_at) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">✅ Accepted</span>;
    }

    if (quote.viewed_at) {
      const daysSinceViewed = Math.floor((now.getTime() - new Date(quote.viewed_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceViewed === 0) {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">🟢 Active</span>;
      } else if (daysSinceViewed <= 3) {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">🟢 Viewed</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-700">🟠 Follow-up</span>;
      }
    }

    if (quote.sent_at) {
      const daysSinceSent = Math.floor((now.getTime() - new Date(quote.sent_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceSent >= 7) {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">🔴 Stale</span>;
      } else if (daysSinceSent >= 3) {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">🟡 Not Viewed</span>;
      } else {
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">🟡 Sent</span>;
      }
    }

    return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">📝 Draft</span>;
  }

  function getTimeAgo(dateString: string | null) {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  const stats = {
    total: quotes.length,
    sent: quotes.filter(q => q.sent_at && !q.viewed_at).length,
    viewed: quotes.filter(q => q.viewed_at && !q.accepted_at).length,
    accepted: quotes.filter(q => q.accepted_at).length,
    needFollowUp: quotes.filter(q => {
      if (!q.sent_at || q.accepted_at) return false;
      const daysSinceSent = Math.floor((new Date().getTime() - new Date(q.sent_at).getTime()) / 86400000);
      if (!q.viewed_at) return daysSinceSent >= 3;
      const daysSinceViewed = Math.floor((new Date().getTime() - new Date(q.viewed_at).getTime()) / 86400000);
      return daysSinceViewed >= 5;
    }).length,
    totalValue: quotes.reduce((sum, q) => sum + (q.total_amount || 0), 0),
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        <p className="text-sm text-gray-800 mt-1">
          Track and manage all customer quotes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-800">Total Quotes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-sm text-yellow-700">Sent</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.sent}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700">Viewed</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{stats.viewed}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700">Accepted</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.accepted}</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-700">Need Follow-up</div>
          <div className="text-2xl font-bold text-orange-900 mt-1">{stats.needFollowUp}</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg border-2 border-blue-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-800">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="accepted">Accepted</option>
            <option value="expired">Expired</option>
            <option value="need_followup">Need Follow-up</option>
          </select>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-700">Loading quotes...</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-gray-700">No quotes found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Viewed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotes.map((quote) => (
                <tr key={quote.quote_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      quote.account_owner === 'current_user'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {quote.account_owner === 'current_user' ? 'Me' : quote.created_by_name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/company/${quote.company_id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {quote.company_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {quote.contact_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    £{quote.total_amount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {getTimeAgo(quote.sent_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {getTimeAgo(quote.viewed_at)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(quote)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/quotes/${quote.quote_id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEditQuote(quote.quote_id)}
                        className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuote(quote.quote_id, quote.company_name)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {!loading && quotes.length > 0 && (
        <div className="mt-4 text-sm text-gray-800 text-center">
          Showing {quotes.length} quotes • Total pipeline value: £{stats.totalValue.toLocaleString()}
        </div>
      )}
    </div>
  );
}
