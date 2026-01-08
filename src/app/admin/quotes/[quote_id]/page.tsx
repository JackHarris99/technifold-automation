/**
 * Individual Quote Detail Page
 * Shows quote details, line items, notes, and activity timeline
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

interface QuoteNote {
  note_id: string;
  user_name: string;
  note_text: string;
  created_at: string;
}

interface QuoteDetail {
  quote_id: string;
  company_id: string;
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
  created_by_name: string;
  line_items: any[];
  notes: QuoteNote[];
}

export default function QuoteDetailPage({ params }: { params: Promise<{ quote_id: string }> }) {
  const { quote_id } = use(params);
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchQuoteDetail();
  }, [quote_id]);

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
        <div className="text-center text-gray-500">Loading quote...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Quote not found</div>
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
            <p className="text-sm text-gray-600 mt-1">
              Quote #{quote.quote_id.slice(0, 8)} • Created by {quote.created_by_name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                £{quote.total_amount?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">
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
                <div className="text-gray-600">Sent</div>
                <div className="font-semibold text-gray-900">{formatDate(quote.sent_at)}</div>
              </div>
              <div>
                <div className="text-gray-600">Last Viewed</div>
                <div className="font-semibold text-gray-900">{formatDate(quote.viewed_at)}</div>
              </div>
              <div>
                <div className="text-gray-600">Expires</div>
                <div className="font-semibold text-gray-900">{formatDate(quote.expires_at)}</div>
              </div>
              <div>
                <div className="text-gray-600">Contact</div>
                <div className="font-semibold text-gray-900">
                  {quote.contact_name || 'No contact'}
                  {quote.contact_email && (
                    <div className="text-xs text-gray-600">{quote.contact_email}</div>
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
                    <div className="text-sm text-gray-600">{item.product_code}</div>
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
                <div className="text-sm text-gray-500 text-center py-4">
                  No notes yet. Add the first one above.
                </div>
              ) : (
                quote.notes.map((note) => (
                  <div key={note.note_id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-gray-900">{note.user_name}</div>
                      <div className="text-xs text-gray-600">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>

            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                📧 Resend Quote
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
                ✅ Mark as Won
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                ❌ Mark as Lost
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                📞 Log Call
              </button>
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
                    <div className="text-xs text-gray-600">{formatDate(quote.accepted_at)}</div>
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
                    <div className="text-xs text-gray-600">{formatDate(quote.viewed_at)}</div>
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
                    <div className="text-xs text-gray-600">{formatDate(quote.sent_at)}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">📝</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Quote Created</div>
                  <div className="text-xs text-gray-600">{formatDate(quote.created_at)}</div>
                  <div className="text-xs text-gray-500">by {quote.created_by_name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
