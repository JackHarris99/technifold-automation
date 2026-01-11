/**
 * Log Call Action Page
 * Tokenized magic link for quickly logging a call from email notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';

interface CallContext {
  user_name: string;
  company_name: string;
  company_id: string;
  quote_id?: string;
  contact_name?: string;
}

export default function LogCallPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [context, setContext] = useState<CallContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [callNotes, setCallNotes] = useState('');
  const [outcome, setOutcome] = useState<'positive' | 'neutral' | 'negative' | 'no_answer'>('neutral');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      const response = await fetch(`/api/action/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Invalid or expired link');
        setLoading(false);
        return;
      }

      setContext(data.context);
      setLoading(false);
    } catch (err) {
      setError('Failed to validate link');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/action/log-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          call_notes: callNotes,
          outcome,
          follow_up_needed: followUpNeeded,
          follow_up_date: followUpDate || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaved(true);
        setCallNotes('');
      } else {
        alert(data.error || 'Failed to log call');
      }
    } catch (err) {
      alert('Failed to log call');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-lg text-gray-800">Validating link...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-800 mb-6">{error}</p>
          <Link
            href="/admin/sales"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Sales Center
          </Link>
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Call Logged</h1>
          <p className="text-gray-800 mb-6">
            Your call with {context?.company_name} has been recorded.
          </p>
          <div className="space-y-2">
            {context?.company_id && (
              <Link
                href={`/admin/company/${context.company_id}`}
                className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Company Profile
              </Link>
            )}
            <Link
              href="/admin/sales"
              className="block w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Sales Center
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">📞</div>
            <h1 className="text-2xl font-bold text-gray-900">Log Call</h1>
          </div>
          <div className="text-sm text-gray-800">
            {context?.user_name} • {context?.company_name}
          </div>
          {context?.contact_name && (
            <div className="text-sm text-gray-700 mt-1">
              Contact: {context.contact_name}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Call Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Call Notes *
            </label>
            <textarea
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="What was discussed? Any key points or concerns..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={6}
              required
            />
          </div>

          {/* Outcome */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Call Outcome
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome('positive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  outcome === 'positive'
                    ? 'bg-green-100 border-2 border-green-500 text-green-700'
                    : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                😊 Positive
              </button>
              <button
                type="button"
                onClick={() => setOutcome('neutral')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  outcome === 'neutral'
                    ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                😐 Neutral
              </button>
              <button
                type="button"
                onClick={() => setOutcome('negative')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  outcome === 'negative'
                    ? 'bg-red-100 border-2 border-red-500 text-red-700'
                    : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                😞 Negative
              </button>
              <button
                type="button"
                onClick={() => setOutcome('no_answer')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  outcome === 'no_answer'
                    ? 'bg-gray-200 border-2 border-gray-500 text-gray-700'
                    : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                📵 No Answer
              </button>
            </div>
          </div>

          {/* Follow-up */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={followUpNeeded}
                onChange={(e) => setFollowUpNeeded(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">
                Follow-up needed
              </span>
            </label>

            {followUpNeeded && (
              <div className="mt-3">
                <label className="block text-sm text-gray-800 mb-1">
                  Follow-up date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!callNotes.trim() || saving}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Logging Call...' : '✓ Log Call'}
          </button>
        </form>
      </div>
    </div>
  );
}
