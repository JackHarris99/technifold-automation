/**
 * Confirmation Queue Component
 * Sales team reviews and confirms/rejects machine knowledge
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QueueItem {
  id: string;
  company_id: string;
  contact_id: string | null;
  machine_taxonomy_id: string;
  learned_from_campaign: string;
  evidence_type: string;
  evidence_details: any;
  confidence_score: number;
  priority: number;
  created_at: string;
  companies: { company_name: string };
  contacts: { first_name: string; last_name: string; email: string; role: string } | null;
  machine_taxonomy: {
    id: string;
    display_name: string;
    level: number;
  };
}

interface ConfirmationQueueProps {
  queue: QueueItem[];
}

export default function ConfirmationQueue({ queue }: ConfirmationQueueProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleConfirm = async (item: QueueItem) => {
    setProcessing(item.id);

    try {
      const response = await fetch('/api/admin/campaigns/confirm-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_id: item.id,
          action: 'confirm',
          company_id: item.company_id,
          machine_taxonomy_id: item.machine_taxonomy_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm');
      }

      alert('Machine knowledge confirmed!');
      window.location.reload();
    } catch (error) {
      console.error('Error confirming:', error);
      alert('Failed to confirm. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (item: QueueItem) => {
    const reason = prompt('Why is this incorrect? (optional)');

    setProcessing(item.id);

    try {
      const response = await fetch('/api/admin/campaigns/confirm-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_id: item.id,
          action: 'reject',
          notes: reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject');
      }

      alert('Rejected successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 10) return 'bg-red-100 text-red-800';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (queue.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
        <p className="mt-1 text-sm text-gray-500">
          No pending machine knowledge to confirm.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Pending Confirmations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review customer clicks and confirm machine details
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {queue.map((item) => (
          <div key={item.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              {/* Left Side: Company & Machine Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    href={`/admin/customer/${item.company_id}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                  >
                    {item.companies.company_name}
                  </Link>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                    Priority: {item.priority}
                  </span>
                </div>

                {/* Machine Selection */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Selected Machine:</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {item.machine_taxonomy.display_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Level {item.machine_taxonomy.level} - {item.evidence_type}
                  </div>
                </div>

                {/* Contact Info */}
                {item.contacts && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">Contact:</span>{' '}
                      {item.contacts.first_name} {item.contacts.last_name}
                    </div>
                    {item.contacts.role && (
                      <div>
                        <span className="font-medium">Role:</span>{' '}
                        <span className="capitalize">{item.contacts.role}</span>
                      </div>
                    )}
                    {item.contacts.email && (
                      <a href={`mailto:${item.contacts.email}`} className="text-blue-600 hover:text-blue-800">
                        {item.contacts.email}
                      </a>
                    )}
                  </div>
                )}

                {/* Evidence Details */}
                <div className="mt-3 bg-gray-50 rounded p-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Evidence:</div>
                  <div className="text-sm text-gray-600">
                    Clicked "{item.evidence_details?.clicked_option || 'Unknown'}" in campaign {item.learned_from_campaign}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-600">Confidence:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                    <div
                      className={`h-2 rounded-full ${item.confidence_score >= 80 ? 'bg-green-600' : item.confidence_score >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                      style={{ width: `${item.confidence_score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getConfidenceColor(item.confidence_score)}`}>
                    {item.confidence_score}%
                  </span>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="ml-6 flex flex-col gap-2">
                <button
                  onClick={() => handleConfirm(item)}
                  disabled={processing === item.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
                >
                  {processing === item.id ? 'Processing...' : 'Confirm ✓'}
                </button>
                <button
                  onClick={() => handleReject(item)}
                  disabled={processing === item.id}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 text-sm font-medium"
                >
                  Reject
                </button>
                <Link
                  href={`/admin/customer/${item.company_id}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium text-center"
                >
                  View Customer
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
