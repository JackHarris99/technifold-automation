'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';

interface Subscription {
  subscription_id: string;
  stripe_subscription_id: string | null;
  company_id: string;
  company_name: string;
  contact_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  monthly_price: number;
  currency: string;
  tools: string[];
  status: string;
  trial_end_date: string | null;
  next_billing_date: string | null;
  ratchet_max: number | null;
  created_at: string;
  trial_days_remaining: number;
  tool_count: number;
}

interface SubscriptionAnomaly {
  subscription_id: string;
  stripe_subscription_id: string | null;
  company_id: string;
  company_name: string;
  contact_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  monthly_price: number;
  ratchet_max: number;
  currency: string;
  status: string;
  violation_amount: number;
  violation_percentage: number;
  created_at: string;
  updated_at: string;
}

export default function SubscriptionsAdminPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [anomalies, setAnomalies] = useState<SubscriptionAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trial' | 'active' | 'past_due' | 'cancelled'>('all');
  const [showAnomalies, setShowAnomalies] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    setLoading(true);
    try {
      const supabase = createClient();

      // Load subscriptions
      const { data, error } = await supabase
        .from('v_active_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Subscriptions] Load error:', error);
        alert(`Failed to load subscriptions: ${error.message}`);
        return;
      }

      setSubscriptions(data || []);

      // Load anomalies (ratchet violations)
      const { data: anomalyData, error: anomalyError } = await supabase
        .from('v_subscription_anomalies')
        .select('*')
        .order('updated_at', { ascending: false });

      if (anomalyError) {
        console.warn('[Subscriptions] Anomaly load error:', anomalyError);
        // Don't fail if view doesn't exist yet
      } else {
        setAnomalies(anomalyData || []);
      }
    } catch (error) {
      console.error('[Subscriptions] Exception:', error);
      alert('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }

  const filteredSubscriptions = filter === 'all'
    ? subscriptions
    : subscriptions.filter(sub => sub.status === filter);

  function getStatusBadge(status: string) {
    const styles = {
      trial: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      past_due: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  }

  function formatCurrency(amount: number, currency: string = 'GBP') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage tool rental subscriptions and track recurring revenue
              </p>
            </div>
            <Link
              href="/admin/subscriptions/create"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Create Subscription
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-6 flex gap-2 flex-wrap">
            {['all', 'trial', 'active', 'past_due', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f as typeof filter); setShowAnomalies(false); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === f && !showAnomalies
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                {f !== 'all' && (
                  <span className="ml-2 text-xs opacity-75">
                    ({subscriptions.filter(sub => sub.status === f).length})
                  </span>
                )}
              </button>
            ))}
            {/* Anomalies Button */}
            <button
              onClick={() => setShowAnomalies(!showAnomalies)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showAnomalies
                  ? 'bg-red-600 text-white'
                  : anomalies.length > 0
                    ? 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100'
                    : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              Anomalies
              {anomalies.length > 0 && (
                <span className={`ml-2 text-xs ${showAnomalies ? 'opacity-75' : 'bg-red-600 text-white px-1.5 py-0.5 rounded-full'}`}>
                  {anomalies.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Anomalies Table */}
        {showAnomalies && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800">Ratchet Violations</h3>
              </div>
              <p className="text-sm text-red-700 mt-1">
                These subscriptions have a monthly price below their ratchet maximum. Prices should only increase, never decrease.
              </p>
            </div>

            {anomalies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-green-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Anomalies Found</h3>
                <p className="text-gray-500">All subscriptions are within their ratchet limits</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Current Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Ratchet Max</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Violation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {anomalies.map((anomaly) => (
                      <tr key={anomaly.subscription_id} className="hover:bg-red-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{anomaly.company_name}</div>
                          {anomaly.stripe_subscription_id && (
                            <div className="text-xs text-gray-500 font-mono">{anomaly.stripe_subscription_id.substring(0, 20)}...</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{anomaly.contact_name || '—'}</div>
                          <div className="text-xs text-gray-500">{anomaly.contact_email || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-red-600">
                            {formatCurrency(anomaly.monthly_price, anomaly.currency)}/mo
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(anomaly.ratchet_max, anomaly.currency)}/mo
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-red-600">
                            -{formatCurrency(anomaly.violation_amount, anomaly.currency)}
                          </div>
                          <div className="text-xs text-red-500">
                            {anomaly.violation_percentage}% below
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(anomaly.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/admin/subscriptions/${anomaly.subscription_id}`} className="text-blue-600 hover:text-blue-900">
                            Investigate
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Subscriptions Table */}
        {!showAnomalies && filteredSubscriptions.length === 0 ? (
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
              No {filter !== 'all' ? filter : ''} subscriptions found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first subscription
            </p>
            <Link
              href="/admin/subscriptions/create"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Create Subscription
            </Link>
          </div>
        ) : !showAnomalies ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tools
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Billing
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.subscription_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.company_name}
                          </div>
                          {subscription.stripe_subscription_id && (
                            <div className="text-xs text-gray-500 font-mono">
                              {subscription.stripe_subscription_id.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subscription.contact_name || '—'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {subscription.contact_email || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {subscription.tool_count} {subscription.tool_count === 1 ? 'tool' : 'tools'}
                      </div>
                      {subscription.tools && subscription.tools.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {subscription.tools.slice(0, 2).join(', ')}
                          {subscription.tools.length > 2 && ` +${subscription.tools.length - 2} more`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(subscription.monthly_price, subscription.currency)}/mo
                      </div>
                      {subscription.ratchet_max && subscription.ratchet_max > subscription.monthly_price && (
                        <div className="text-xs text-gray-500">
                          Peak: {formatCurrency(subscription.ratchet_max, subscription.currency)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(subscription.status)}
                        {subscription.status === 'trial' && subscription.trial_days_remaining > 0 && (
                          <span className="text-xs text-gray-500">
                            {subscription.trial_days_remaining} days left
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.status === 'trial'
                        ? formatDate(subscription.trial_end_date)
                        : formatDate(subscription.next_billing_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/subscriptions/${subscription.subscription_id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Summary Stats */}
        {subscriptions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Subscriptions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{subscriptions.length}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Active Trials</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                  {subscriptions.filter(s => s.status === 'trial').length}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Active Paying</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {subscriptions.filter(s => s.status === 'active').length}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Monthly MRR</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(
                    subscriptions
                      .filter(s => s.status === 'active')
                      .reduce((sum, s) => sum + s.monthly_price, 0)
                  )}
                </dd>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}
