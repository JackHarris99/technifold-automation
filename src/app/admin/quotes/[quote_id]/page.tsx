/**
 * Individual Quote Detail Page
 * Shows quote details, line items, notes, and activity timeline
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { LogActivityModal } from '@/components/admin/LogActivityModal';

interface QuoteNote {
  note_id: string;
  user_name: string;
  note_text: string;
  created_at: string;
}

interface EngagementEvent {
  event_id: string;
  contact_id: string;
  contact_name: string;
  contact_email: string | null;
  event_type: string;
  event_name: string;
  created_at: string;
  meta: any;
}

interface QuoteDetail {
  quote_id: string;
  company_id: string;
  contact_id: string | null;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  quote_type: 'static' | 'interactive';
  pricing_mode: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  created_by_name: string;
  line_items: any[];
  notes: QuoteNote[];
  engagement_events: EngagementEvent[];
}

export default function QuoteDetailPage({ params }: { params: Promise<{ quote_id: string }> }) {
  const { quote_id } = use(params);
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Activity logging state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<'call' | 'visit' | 'email' | 'followup' | 'meeting'>('call');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchQuoteDetail();
  }, [quote_id]);

  // Generate quote URL when quote data is loaded
  useEffect(() => {
    if (quote && quote.company_id && quote.contact_id) {
      generateQuoteUrl();
    }
  }, [quote]);

  async function fetchQuoteDetail() {
    try {
      const response = await fetch(`/api/admin/quotes/${quote_id}`);
      const data = await response.json();

      if (data.success) {
        setQuote(data.quote);
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!newNote.trim()) return;

    setSavingNote(true);
    try {
      const response = await fetch(`/api/admin/quotes/${quote_id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: newNote }),
      });

      const data = await response.json();

      if (data.success) {
        setNewNote('');
        fetchQuoteDetail(); // Refresh to show new note
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSavingNote(false);
    }
  }

  async function handleMarkAsWon() {
    if (!confirm('Mark this quote as WON? This will record the deal as closed.')) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/quotes/${quote_id}/update-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'won' }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Quote marked as WON! Congratulations on closing the deal!');
        fetchQuoteDetail(); // Refresh to show updated status
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to mark as won:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleMarkAsLost() {
    setShowLostModal(true);
  }

  async function confirmMarkAsLost() {
    if (!lostReason.trim()) {
      alert('Please provide a reason for marking this quote as lost.');
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/quotes/${quote_id}/update-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'lost',
          lost_reason: lostReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Quote marked as LOST. Better luck next time!');
        setShowLostModal(false);
        setLostReason('');
        fetchQuoteDetail(); // Refresh to show updated status
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to mark as lost:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  function openActivityModal(type: 'call' | 'visit' | 'email' | 'followup' | 'meeting') {
    setActivityType(type);
    setShowActivityModal(true);
  }

  function handleActivitySuccess() {
    fetchQuoteDetail(); // Refresh to show new activity in timeline
  }

  async function generateQuoteUrl() {
    if (!quote) return;

    try {
      const response = await fetch('/api/admin/quotes/regenerate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quote.quote_id,
          company_id: quote.company_id,
          contact_id: quote.contact_id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQuoteUrl(data.url);
      }
    } catch (error) {
      console.error('Failed to generate quote URL:', error);
    }
  }

  async function handleResendQuote() {
    if (!quote || !quote.contact_email) {
      alert('Cannot send quote: Contact email is missing. Please assign a contact to this quote first.');
      return;
    }

    if (!quote.contact_id) {
      alert('Cannot send quote: No contact assigned. Please assign a contact to this quote first.');
      return;
    }

    const action = quote.sent_at ? 'Resend' : 'Send';
    if (!confirm(`${action} quote to ${quote.contact_email}?`)) {
      return;
    }

    setResendingEmail(true);
    try {
      const response = await fetch('/api/admin/quote/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: quote.company_id,
          contact_id: quote.contact_id,
          quote_id: quote.quote_id,
          quote_url: quoteUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✓ Quote ${quote.sent_at ? 'resent' : 'sent'} successfully to ${quote.contact_email}`);
        fetchQuoteDetail(); // Refresh to update sent_at timestamp
      } else {
        alert(`Failed to ${action.toLowerCase()}: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to send quote:', error);
      alert('Error sending quote');
    } finally {
      setResendingEmail(false);
    }
  }

  function copyQuoteUrl() {
    if (quoteUrl) {
      navigator.clipboard.writeText(quoteUrl);
      alert('✓ Quote link copied to clipboard!');
    }
  }

  function getStatusBadge() {
    if (!quote) return null;

    const now = new Date();
    const expiresAt = quote.expires_at ? new Date(quote.expires_at) : null;
    const isExpired = expiresAt && expiresAt < now;

    if (isExpired) {
      return <span className="px-3 py-1 text-sm font-semibold rounded bg-gray-200 text-gray-700">🔴 Expired</span>;
    }

    if (quote.accepted_at) {
      return <span className="px-3 py-1 text-sm font-semibold rounded bg-green-100 text-green-700">✅ Accepted</span>;
    }

    if (quote.viewed_at) {
      const daysSinceViewed = Math.floor((now.getTime() - new Date(quote.viewed_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceViewed === 0) {
        return <span className="px-3 py-1 text-sm font-semibold rounded bg-green-100 text-green-700">🟢 Active</span>;
      } else if (daysSinceViewed <= 3) {
        return <span className="px-3 py-1 text-sm font-semibold rounded bg-blue-100 text-blue-700">🟢 Viewed</span>;
      } else {
        return <span className="px-3 py-1 text-sm font-semibold rounded bg-orange-100 text-orange-700">🟠 Follow-up Needed</span>;
      }
    }

    if (quote.sent_at) {
      const daysSinceSent = Math.floor((now.getTime() - new Date(quote.sent_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceSent >= 7) {
        return <span className="px-3 py-1 text-sm font-semibold rounded bg-red-100 text-red-700">🔴 Stale</span>;
      } else {
        return <span className="px-3 py-1 text-sm font-semibold rounded bg-yellow-100 text-yellow-700">🟡 Sent</span>;
      }
    }

    return <span className="px-3 py-1 text-sm font-semibold rounded bg-gray-200 text-gray-700">📝 Draft</span>;
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-700">Loading quote...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-700">Quote not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/quotes"
          className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Back to Quotes
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {quote.company_name}
            </h1>
            <p className="text-sm text-gray-800 mt-1">
              Quote #{quote.quote_id.slice(0, 8)} • Created by {quote.created_by_name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                £{quote.total_amount?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-800">
                {quote.quote_type === 'interactive' ? 'Interactive' : 'Static'} Quote
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quote Details</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-800">Sent</div>
                <div className="font-semibold text-gray-900">{formatDate(quote.sent_at)}</div>
              </div>
              <div>
                <div className="text-gray-800">Last Viewed</div>
                <div className="font-semibold text-gray-900">{formatDate(quote.viewed_at)}</div>
              </div>
              <div>
                <div className="text-gray-800">Expires</div>
                <div className="font-semibold text-gray-900">{formatDate(quote.expires_at)}</div>
              </div>
              <div>
                <div className="text-gray-800">Contact</div>
                <div className="font-semibold text-gray-900">
                  {quote.contact_name || 'No contact'}
                  {quote.contact_email && (
                    <div className="text-xs text-gray-800">{quote.contact_email}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href={`/admin/company/${quote.company_id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Company Profile →
              </Link>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Line Items ({quote.line_items.length})
            </h2>

            <div className="space-y-3">
              {quote.line_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.description}</div>
                    <div className="text-sm text-gray-800">{item.product_code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {item.quantity} × £{item.unit_price?.toFixed(2)}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      £{item.line_total?.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Internal Notes</h2>

            {/* Add Note Form */}
            <div className="mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this quote..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={3}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim() || savingNote}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNote ? 'Saving...' : 'Add Note'}
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {quote.notes.length === 0 ? (
                <div className="text-sm text-gray-700 text-center py-4">
                  No notes yet. Add the first one above.
                </div>
              ) : (
                quote.notes.map((note) => (
                  <div key={note.note_id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-gray-900">{note.user_name}</div>
                      <div className="text-xs text-gray-800">
                        {formatDate(note.created_at)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {note.note_text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Engagement Events */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Contact Engagement ({quote.engagement_events.length})
            </h2>

            <div className="space-y-3">
              {quote.engagement_events.length === 0 ? (
                <div className="text-sm text-gray-700 text-center py-4">
                  No engagement events yet. Events are tracked when contacts view the quote.
                </div>
              ) : (
                quote.engagement_events.map((event) => (
                  <div key={event.event_id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">
                        {event.event_type === 'quote_view' ? '👁️' : '📧'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          {event.contact_name}
                        </div>
                        <div className="text-xs text-gray-800">
                          {formatDate(event.created_at)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-800 mb-1">
                        {event.contact_email}
                      </div>
                      <div className="text-sm text-gray-700">
                        {event.event_name === 'quote_portal_view' ? 'Viewed quote' : event.event_name}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>

            <div className="space-y-2">
              {quoteUrl && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Quote Link</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={quoteUrl}
                      readOnly
                      className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono"
                    />
                    <button
                      onClick={copyQuoteUrl}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
              <Link
                href={`/admin/quotes/${quote_id}/preview`}
                target="_blank"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 block text-center"
              >
                🔍 Preview as Customer
              </Link>
              <button
                onClick={handleResendQuote}
                disabled={resendingEmail || !quote.contact_email}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!quote.contact_email ? 'Contact email required' : ''}
              >
                {resendingEmail ? '⏳ Sending...' : quote.sent_at ? '📧 Resend Quote' : '📧 Send Quote'}
              </button>
              <button
                onClick={handleMarkAsWon}
                disabled={updatingStatus}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Mark as Won
              </button>
              <button
                onClick={handleMarkAsLost}
                disabled={updatingStatus}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Mark as Lost
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Follow-up Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => openActivityModal('call')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  📞 Log Call About Quote
                </button>
                <button
                  onClick={() => openActivityModal('email')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  ✉️ Log Email Follow-up
                </button>
                <button
                  onClick={() => openActivityModal('meeting')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  🤝 Log Meeting
                </button>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity</h2>

            <div className="space-y-4">
              {quote.accepted_at && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">✅</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Quote Accepted</div>
                    <div className="text-xs text-gray-800">{formatDate(quote.accepted_at)}</div>
                  </div>
                </div>
              )}

              {quote.viewed_at && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👁️</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Quote Viewed</div>
                    <div className="text-xs text-gray-800">{formatDate(quote.viewed_at)}</div>
                  </div>
                </div>
              )}

              {quote.sent_at && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">📧</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Quote Sent</div>
                    <div className="text-xs text-gray-800">{formatDate(quote.sent_at)}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">📝</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Quote Created</div>
                  <div className="text-xs text-gray-800">{formatDate(quote.created_at)}</div>
                  <div className="text-xs text-gray-700">by {quote.created_by_name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Lost Modal */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mark Quote as Lost</h3>

            <p className="text-sm text-gray-800 mb-4">
              Please provide a reason why this quote was lost. This helps us improve our sales process.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason <span className="text-red-600">*</span>
              </label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select a reason...</option>
                <option value="Price too high">Price too high</option>
                <option value="Went with competitor">Went with competitor</option>
                <option value="Budget constraints">Budget constraints</option>
                <option value="Timing not right">Timing not right</option>
                <option value="No longer interested">No longer interested</option>
                <option value="Requirements changed">Requirements changed</option>
                <option value="No response from customer">No response from customer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLostModal(false);
                  setLostReason('');
                }}
                disabled={updatingStatus}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsLost}
                disabled={!lostReason.trim() || updatingStatus}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? 'Saving...' : 'Mark as Lost'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logging Modal */}
      {quote && (
        <LogActivityModal
          isOpen={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          companyId={quote.company_id}
          companyName={quote.company_name}
          activityType={activityType}
          context="quote_followup"
          quoteId={quote_id}
          onSuccess={handleActivitySuccess}
        />
      )}
    </div>
  );
}
