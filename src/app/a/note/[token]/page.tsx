/**
 * Add Note Action Page
 * Tokenized magic link for quickly adding a note to a quote from email notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';

interface NoteContext {
  user_name: string;
  company_name: string;
  company_id: string;
  quote_id: string;
  contact_name?: string;
}

export default function AddNotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [context, setContext] = useState<NoteContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [noteText, setNoteText] = useState('');
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

      // Verify this is a note action with quote_id
      if (data.payload.action_type !== 'add_note' || !data.payload.quote_id) {
        setError('Invalid action type');
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
      const response = await fetch('/api/action/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          note_text: noteText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaved(true);
        setNoteText('');
      } else {
        alert(data.error || 'Failed to add note');
      }
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-lg text-gray-600">Validating link...</div>
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
          <p className="text-gray-600 mb-6">{error}</p>
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
          <h1 className="text-xl font-bold text-gray-900 mb-2">Note Added</h1>
          <p className="text-gray-600 mb-6">
            Your note has been added to the quote for {context?.company_name}.
          </p>
          <div className="space-y-2">
            {context?.quote_id && (
              <Link
                href={`/admin/quotes/${context.quote_id}`}
                className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Quote
              </Link>
            )}
            {context?.company_id && (
              <Link
                href={`/admin/company/${context.company_id}`}
                className="block w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                View Company Profile
              </Link>
            )}
            <Link
              href="/admin/sales"
              className="block w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
            <div className="text-2xl">📝</div>
            <h1 className="text-2xl font-bold text-gray-900">Add Note</h1>
          </div>
          <div className="text-sm text-gray-600">
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
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note *
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your note about this quote..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={8}
              required
            />
            <div className="text-xs text-gray-700 mt-2">
              This note will be visible to all sales team members.
            </div>
          </div>

          <button
            type="submit"
            disabled={!noteText.trim() || saving}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Adding Note...' : '✓ Add Note'}
          </button>
        </form>
      </div>
    </div>
  );
}
