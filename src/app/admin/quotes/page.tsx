/**
 * Quotes Management Page
 * Shows all quotes with filtering, status tracking, and quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getViewMode, addViewModeToUrl } from '@/lib/viewMode';

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  total_amount: number;
  payment_status: string;
  paid_at: string | null;
  due_date: string | null;
  status: string;
  invoice_pdf_url: string | null;
}

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
  invoice: Invoice | null;
  invoice_id: string | null;
  preview_url: string;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showLostModal, setShowLostModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [markingLost, setMarkingLost] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  async function fetchQuotes() {
    setLoading(true);
    try {
      const viewMode = getViewMode();
      const params = new URLSearchParams();
      // Send view mode to API (supports all Director view modes)
      if (viewMode !== 'all') params.set('viewMode', viewMode);
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

  function openLostModal(quote: Quote) {
    setSelectedQuote(quote);
    setLostReason('');
    setShowLostModal(true);
  }

  async function markQuoteAsLost() {
    if (!selectedQuote || !lostReason.trim()) {
      alert('Please select a reason');
      return;
    }

    setMarkingLost(true);
    try {
      const response = await fetch(`/api/admin/quotes/${selectedQuote.quote_id}/mark-lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lost_reason: lostReason }),
      });

      const data = await response.json();

      if (data.success) {
        setShowLostModal(false);
        setSelectedQuote(null);
        setLostReason('');
        fetchQuotes(); // Refresh list
      } else {
        alert('Failed to mark as lost: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to mark as lost:', error);
      alert('Error marking quote as lost');
    } finally {
      setMarkingLost(false);
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

  function getQuoteStatus(quote: Quote): { label: string; description: string; type: 'draft' | 'sent' | 'viewed' | 'accepted' | 'paid' | 'expired' | 'lost' } {
    const now = new Date();

    // Check if marked as lost
    if (quote.lost_at) {
      return { label: 'Lost', description: quote.lost_reason || 'Marked as lost', type: 'lost' };
    }

    // Check if expired
    if (quote.expires_at && new Date(quote.expires_at) < now) {
      return { label: 'Expired', description: formatDate(quote.expires_at), type: 'expired' };
    }

    // Check if invoice is paid
    if (quote.invoice?.paid_at) {
      return { label: 'Paid', description: formatDate(quote.invoice.paid_at), type: 'paid' };
    }

    // Check if invoice generated (accepted)
    if (quote.accepted_at) {
      return { label: 'Invoice Generated', description: formatDate(quote.accepted_at), type: 'accepted' };
    }

    // Check if viewed
    if (quote.viewed_at) {
      return { label: 'Viewed', description: getTimeAgo(quote.viewed_at), type: 'viewed' };
    }

    // Check if sent
    if (quote.sent_at) {
      return { label: 'Sent', description: getTimeAgo(quote.sent_at), type: 'sent' };
    }

    // Draft
    return { label: 'Draft', description: 'Not sent yet', type: 'draft' };
  }

  function getNextAction(quote: Quote): { action: string; priority: 'low' | 'medium' | 'high' | 'none' } {
    const now = new Date();

    // If paid, no action needed
    if (quote.invoice?.paid_at) {
      return { action: 'Quote completed - invoice paid', priority: 'none' };
    }

    // If invoice exists but not paid, check if overdue
    if (quote.invoice && !quote.invoice.paid_at) {
      if (quote.invoice.due_date && new Date(quote.invoice.due_date) < now) {
        const daysOverdue = Math.floor((now.getTime() - new Date(quote.invoice.due_date).getTime()) / 86400000);
        return { action: `Invoice overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} - chase payment`, priority: 'high' };
      }
      return { action: 'Awaiting invoice payment', priority: 'medium' };
    }

    // If expired
    if (quote.expires_at && new Date(quote.expires_at) < now) {
      return { action: 'Quote expired - create new quote if customer interested', priority: 'low' };
    }

    // If viewed but no action
    if (quote.viewed_at) {
      const daysSinceViewed = Math.floor((now.getTime() - new Date(quote.viewed_at).getTime()) / 86400000);
      if (daysSinceViewed >= 5) {
        return { action: `Follow up - customer viewed ${daysSinceViewed} days ago`, priority: 'high' };
      } else if (daysSinceViewed >= 3) {
        return { action: `Consider follow up - viewed ${daysSinceViewed} days ago`, priority: 'medium' };
      }
      return { action: 'Wait for customer response', priority: 'low' };
    }

    // If sent but not viewed
    if (quote.sent_at) {
      const daysSinceSent = Math.floor((now.getTime() - new Date(quote.sent_at).getTime()) / 86400000);
      if (daysSinceSent >= 7) {
        return { action: `Not opened in ${daysSinceSent} days - send reminder`, priority: 'high' };
      } else if (daysSinceSent >= 3) {
        return { action: `Not opened yet (${daysSinceSent} days) - consider reminder`, priority: 'medium' };
      }
      return { action: 'Wait for customer to open quote', priority: 'low' };
    }

    // Draft
    return { action: 'Draft - complete and send to customer', priority: 'medium' };
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
    draft: quotes.filter(q => !q.sent_at && !q.lost_at).length,
    active: quotes.filter(q => q.sent_at && !q.accepted_at && !q.invoice?.paid_at && !q.lost_at).length,
    invoiced: quotes.filter(q => q.accepted_at && !q.invoice?.paid_at && !q.lost_at).length,
    paid: quotes.filter(q => q.invoice?.paid_at).length,
    lost: quotes.filter(q => q.lost_at).length,
    needAction: quotes.filter(q => {
      if (q.lost_at) return false; // Don't count lost quotes
      const action = getNextAction(q);
      return action.priority === 'high' || action.priority === 'medium';
    }).length,
    totalValue: quotes.reduce((sum, q) => sum + (q.total_amount || 0), 0),
    paidValue: quotes.filter(q => q.invoice?.paid_at).reduce((sum, q) => sum + (q.total_amount || 0), 0),
    lostValue: quotes.filter(q => q.lost_at).reduce((sum, q) => sum + (q.total_amount || 0), 0),
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
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">Total Quotes</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600 mt-1">£{stats.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">Drafts</div>
          <div className="text-2xl font-bold text-gray-700">{stats.draft}</div>
          <div className="text-xs text-gray-500 mt-1">Not sent yet</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-xs font-medium text-blue-700 uppercase mb-1">Active</div>
          <div className="text-2xl font-bold text-blue-900">{stats.active}</div>
          <div className="text-xs text-blue-600 mt-1">Awaiting response</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-xs font-medium text-purple-700 uppercase mb-1">Invoiced</div>
          <div className="text-2xl font-bold text-purple-900">{stats.invoiced}</div>
          <div className="text-xs text-purple-600 mt-1">Payment pending</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-xs font-medium text-green-700 uppercase mb-1">Won (Paid)</div>
          <div className="text-2xl font-bold text-green-900">{stats.paid}</div>
          <div className="text-xs text-green-600 mt-1">£{stats.paidValue.toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-xs font-medium text-orange-700 uppercase mb-1">Lost</div>
          <div className="text-2xl font-bold text-orange-900">{stats.lost}</div>
          <div className="text-xs text-orange-600 mt-1">£{stats.lostValue.toLocaleString()}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-xs font-medium text-red-700 uppercase mb-1">Need Action</div>
          <div className="text-2xl font-bold text-red-900">{stats.needAction}</div>
          <div className="text-xs text-red-600 mt-1">Require follow-up</div>
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

      {/* Quotes List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-700">
            Loading quotes...
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-700">
            No quotes found
          </div>
        ) : (
          quotes.map((quote) => {
            const status = getQuoteStatus(quote);
            const nextAction = getNextAction(quote);

            return (
              <div key={quote.quote_id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Link
                          href={`/admin/company/${quote.company_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {quote.company_name}
                        </Link>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          quote.account_owner === 'current_user'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {quote.account_owner === 'current_user' ? 'My Customer' : quote.created_by_name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {quote.contact_name || 'No contact'} • Quote #{quote.quote_id.slice(0, 8)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        £{quote.total_amount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {quote.quote_type === 'interactive' ? 'Interactive' : 'Static'} Quote
                      </div>
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                    {/* Quote Status */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Quote Status</div>
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold ${
                        status.type === 'paid' ? 'bg-green-100 text-green-800' :
                        status.type === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        status.type === 'viewed' ? 'bg-purple-100 text-purple-800' :
                        status.type === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                        status.type === 'expired' ? 'bg-red-100 text-red-800' :
                        status.type === 'lost' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{status.description}</div>
                    </div>

                    {/* Invoice Status */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Invoice Status</div>
                      {quote.invoice ? (
                        <>
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold ${
                            quote.invoice.paid_at ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {quote.invoice.paid_at ? 'Paid ✓' : 'Awaiting Payment'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {quote.invoice.invoice_number} • £{quote.invoice.total_amount?.toLocaleString()}
                          </div>
                          {quote.quote_type === 'interactive' && quote.invoice.total_amount !== quote.total_amount && (
                            <div className="text-xs text-amber-600 mt-1 italic">
                              ⚠️ Invoice total may differ - customer adjusted interactive quote
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-gray-500">No invoice yet</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {quote.quote_type === 'interactive'
                              ? 'Customer can adjust quantities before generating'
                              : 'Pending customer action'
                            }
                          </div>
                        </>
                      )}
                    </div>

                    {/* Timeline */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Timeline</div>
                      <div className="text-xs text-gray-700 space-y-0.5">
                        {quote.sent_at && <div>• Sent {getTimeAgo(quote.sent_at)}</div>}
                        {quote.viewed_at && <div>• Viewed {getTimeAgo(quote.viewed_at)}</div>}
                        {quote.accepted_at && <div>• Invoice created {getTimeAgo(quote.accepted_at)}</div>}
                        {quote.invoice?.paid_at && <div>• Paid {getTimeAgo(quote.invoice.paid_at)}</div>}
                        {!quote.sent_at && <div className="text-gray-400">Not sent yet</div>}
                      </div>
                    </div>
                  </div>

                  {/* Next Action Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        nextAction.priority === 'high' ? 'bg-red-500' :
                        nextAction.priority === 'medium' ? 'bg-orange-500' :
                        nextAction.priority === 'low' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {nextAction.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={quote.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        👁️ Preview
                      </a>
                      <button
                        onClick={() => handleEditQuote(quote.quote_id)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      {quote.invoice?.invoice_pdf_url && (
                        <a
                          href={quote.invoice.invoice_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                        >
                          📄 Invoice PDF
                        </a>
                      )}
                      {!quote.lost_at && !quote.invoice?.paid_at && (
                        <button
                          onClick={() => openLostModal(quote)}
                          className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                        >
                          Mark Lost
                        </button>
                      )}
                      <button
                        onClick={() => deleteQuote(quote.quote_id, quote.company_name)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {!loading && quotes.length > 0 && (
        <div className="mt-4 text-sm text-gray-800 text-center">
          Showing {quotes.length} quotes • Total pipeline value: £{stats.totalValue.toLocaleString()}
        </div>
      )}

      {/* Mark as Lost Modal */}
      {showLostModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mark Quote as Lost</h3>

            <p className="text-sm text-gray-700 mb-4">
              Quote for <span className="font-semibold">{selectedQuote.company_name}</span> • £{selectedQuote.total_amount.toLocaleString()}
            </p>

            <p className="text-sm text-gray-600 mb-4">
              Select the reason why this quote was lost. This helps improve our sales process and is tracked in the company timeline.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lost Reason <span className="text-red-600">*</span>
              </label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select a reason...</option>
                <option value="Price too high">Price too high</option>
                <option value="Went with competitor">Went with competitor</option>
                <option value="Budget constraints">Budget constraints</option>
                <option value="Timing not right">Timing not right</option>
                <option value="No longer interested">No longer interested</option>
                <option value="Requirements changed">Requirements changed</option>
                <option value="No response from customer">No response from customer</option>
                <option value="Product not suitable">Product not suitable</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLostModal(false);
                  setSelectedQuote(null);
                  setLostReason('');
                }}
                disabled={markingLost}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={markQuoteAsLost}
                disabled={!lostReason.trim() || markingLost}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {markingLost ? 'Saving...' : 'Mark as Lost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
