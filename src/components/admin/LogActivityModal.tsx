/**
 * Activity Logging Modal
 * Reusable modal for logging calls, visits, emails, follow-ups, meetings
 * Works for both contextual (quote/invoice) and generic activities
 */

'use client';

import { useState } from 'react';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  activityType: 'call' | 'visit' | 'email' | 'followup' | 'meeting';
  context?: 'quote_followup' | 'invoice_chase' | 'general';
  // Optional: link to specific quote or invoice
  quoteId?: string;
  invoiceId?: string;
  // Optional: pre-selected contact
  contactId?: string;
  // Available contacts for this company
  contacts?: Array<{ contact_id: string; full_name: string; email: string | null }>;
  onSuccess?: () => void;
}

const ACTIVITY_LABELS = {
  call: 'Phone Call',
  visit: 'Customer Visit',
  email: 'Email',
  followup: 'Follow-up',
  meeting: 'Meeting',
};

const ACTIVITY_ICONS = {
  call: '📞',
  visit: '🚗',
  email: '✉️',
  followup: '🔄',
  meeting: '🤝',
};

const CALL_OUTCOMES = [
  { value: 'success', label: 'Successful conversation' },
  { value: 'voicemail', label: 'Left voicemail' },
  { value: 'no_answer', label: 'No answer' },
  { value: 'scheduled_callback', label: 'Scheduled callback' },
  { value: 'other', label: 'Other' },
];

const EMAIL_OUTCOMES = [
  { value: 'sent', label: 'Email sent' },
  { value: 'received_reply', label: 'Received reply' },
  { value: 'bounced', label: 'Bounced' },
];

const VISIT_OUTCOMES = [
  { value: 'productive', label: 'Productive meeting' },
  { value: 'demonstration', label: 'Product demonstration' },
  { value: 'site_inspection', label: 'Site inspection' },
  { value: 'not_available', label: 'Contact not available' },
];

const FOLLOWUP_OUTCOMES = [
  { value: 'answered_questions', label: 'Answered questions' },
  { value: 'sent_information', label: 'Sent additional information' },
  { value: 'scheduled_next_step', label: 'Scheduled next step' },
];

const MEETING_OUTCOMES = [
  { value: 'completed', label: 'Meeting completed' },
  { value: 'postponed', label: 'Meeting postponed' },
  { value: 'cancelled', label: 'Meeting cancelled' },
];

export function LogActivityModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  activityType,
  context = 'general',
  quoteId,
  invoiceId,
  contactId: preSelectedContactId,
  contacts = [],
  onSuccess,
}: LogActivityModalProps) {
  const [contactId, setContactId] = useState(preSelectedContactId || '');
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activityLabel = ACTIVITY_LABELS[activityType];
  const activityIcon = ACTIVITY_ICONS[activityType];

  // Get appropriate outcomes based on activity type
  let outcomeOptions: Array<{ value: string; label: string }> = [];
  if (activityType === 'call') outcomeOptions = CALL_OUTCOMES;
  else if (activityType === 'email') outcomeOptions = EMAIL_OUTCOMES;
  else if (activityType === 'visit') outcomeOptions = VISIT_OUTCOMES;
  else if (activityType === 'followup') outcomeOptions = FOLLOWUP_OUTCOMES;
  else if (activityType === 'meeting') outcomeOptions = MEETING_OUTCOMES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/activity/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_id: contactId || null,
          activity_type: activityType,
          context,
          outcome,
          notes,
          quote_id: quoteId,
          invoice_id: invoiceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log activity');
      }

      // Success!
      onSuccess?.();
      onClose();

      // Reset form
      setContactId(preSelectedContactId || '');
      setOutcome('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form
      setContactId(preSelectedContactId || '');
      setOutcome('');
      setNotes('');
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {activityIcon} Log {activityLabel}
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-700 mt-1">{companyName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Contact Selection */}
          {contacts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Contact (Optional)
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">-- General (no specific contact) --</option>
                {contacts.map((contact) => (
                  <option key={contact.contact_id} value={contact.contact_id}>
                    {contact.full_name} {contact.email ? `(${contact.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Outcome */}
          {outcomeOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Outcome
              </label>
              <div className="space-y-2">
                {outcomeOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="outcome"
                      value={option.value}
                      checked={outcome === option.value}
                      onChange={(e) => setOutcome(e.target.value)}
                      className="mr-2 text-blue-600"
                      required
                    />
                    <span className="text-sm text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add any additional details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
