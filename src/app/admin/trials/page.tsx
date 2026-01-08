'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getViewMode } from '@/lib/viewMode';

interface TrialIntent {
  id: string;
  token: string;
  company_id: string;
  contact_id: string;
  machine_id: string;
  created_at: string;
  // Joined data
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  machine_brand: string | null;
  machine_model: string | null;
  machine_type: string | null;
}

export default function TrialsAdminPage() {
  const [trials, setTrials] = useState<TrialIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'converted'>('all');

  useEffect(() => {
    loadTrials();
  }, []);

  async function loadTrials() {
    setLoading(true);
    try {
      const viewMode = getViewMode();
      const params = new URLSearchParams();
      if (viewMode === 'my_customers') params.set('viewMode', 'my_customers');

      const response = await fetch(`/api/admin/trials/list?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load trials');
      }

      setTrials(data.trials || []);
    } catch (error: any) {
      console.error('[Trials] Exception:', error);
      alert(`Failed to load trials: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  function getTrialStatus(createdAt: string): 'active' | 'expired' {
    const created = new Date(createdAt);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation > 7 ? 'expired' : 'active';
  }

  function getDaysRemaining(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(7 - daysSinceCreation));
  }

  const filteredTrials = filter === 'all'
    ? trials
    : trials.filter(trial => getTrialStatus(trial.created_at) === filter);

  function getStatusBadge(createdAt: string) {
    const status = getTrialStatus(createdAt);
    const daysRemaining = getDaysRemaining(createdAt);

    if (status === 'expired') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          EXPIRED
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ACTIVE
        </span>
        <span className="text-xs text-gray-500">{daysRemaining} days left</span>
      </div>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatMachineType(type: string | null): string {
    if (!type) return '—';
    return type
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async function resendTrialEmail(trial: TrialIntent) {
    if (!confirm(`Resend trial email to ${trial.contact_email}?`)) return;

    try {
      const response = await fetch('/api/trial/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trial_intent_id: trial.id,
          token: trial.token,
          email: trial.contact_email,
          contact_name: trial.contact_name,
          machine_brand: trial.machine_brand,
          machine_model: trial.machine_model,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend email');
      }

      alert('Trial email resent successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trial intents...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trial Intents</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track trial offer links sent to prospects
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex gap-2">
            {['all', 'active', 'expired'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-2 text-xs opacity-75">
                    ({trials.filter(t =>
                      f === 'active'
                        ? getTrialStatus(t.created_at) === 'active'
                        : getTrialStatus(t.created_at) === 'expired'
                    ).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Trials Table */}
        {filteredTrials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No {filter !== 'all' ? filter : ''} trial intents found
            </h3>
            <p className="text-gray-500">
              Trial intents are created when prospects request a trial from machine pages
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrials.map((trial) => (
                  <tr key={trial.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trial.contact_name || '—'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {trial.contact_email || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trial.company_name || '—'}
                      </div>
                      {trial.company_id && (
                        <Link
                          href={`/admin/company/${trial.company_id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View company
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trial.machine_brand} {trial.machine_model}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatMachineType(trial.machine_type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(trial.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(trial.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        {trial.contact_email && getTrialStatus(trial.created_at) === 'active' && (
                          <button
                            onClick={() => resendTrialEmail(trial)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Resend
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const baseUrl = window.location.origin;
                            const offerUrl = `${baseUrl}/offer?token=${trial.token}`;
                            navigator.clipboard.writeText(offerUrl);
                            alert('Offer link copied to clipboard!');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Copy Link
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        {trials.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Trial Intents</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{trials.length}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Active (7 days)</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {trials.filter(t => getTrialStatus(t.created_at) === 'active').length}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Expired</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-600">
                  {trials.filter(t => getTrialStatus(t.created_at) === 'expired').length}
                </dd>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
