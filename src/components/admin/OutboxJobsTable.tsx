/**
 * Outbox Jobs Table Component
 * Displays outbox jobs with retry action
 */

'use client';

import { useState } from 'react';

interface OutboxJob {
  job_id: string;
  job_type: string;
  status: string;
  payload: any;
  attempts: number;
  created_at: string;
  scheduled_for: string;
  locked_until: string | null;
  last_error: string | null;
  completed_at: string | null;
}

interface OutboxJobsTableProps {
  jobs: OutboxJob[];
}

export default function OutboxJobsTable({ jobs }: OutboxJobsTableProps) {
  const [retrying, setRetrying] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const handleRetry = async (jobId: string) => {
    setRetrying(jobId);
    try {
      const response = await fetch('/api/admin/outbox/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      });

      if (!response.ok) {
        throw new Error('Failed to retry job');
      }

      alert('Job retry scheduled successfully!');
      window.location.reload();
    } catch (err) {
      alert('Failed to retry job');
      console.error('Retry error:', err);
    } finally {
      setRetrying(null);
    }
  };

  const toggleExpanded = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <p className="text-gray-500">No jobs found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attempts
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scheduled For
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jobs.map((job) => (
            <>
              <tr key={job.job_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleExpanded(job.job_id)}
                    className="text-sm font-mono text-blue-600 hover:text-blue-900"
                  >
                    {job.job_id.substring(0, 8)}...
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {job.job_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      job.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : job.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.attempts} / 5
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job.scheduled_for).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {job.status === 'failed' && job.attempts < 5 && (
                    <button
                      onClick={() => handleRetry(job.job_id)}
                      disabled={retrying === job.job_id}
                      className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                    >
                      {retrying === job.job_id ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                </td>
              </tr>

              {/* Expanded Details Row */}
              {expandedJob === job.job_id && (
                <tr className="bg-gray-50">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Full Job ID</h4>
                        <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                          {job.job_id}
                        </code>
                      </div>

                      {job.last_error && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Last Error</h4>
                          <div className="text-xs bg-red-50 text-red-700 px-3 py-2 rounded border border-red-200">
                            {job.last_error}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Payload</h4>
                        <pre className="text-xs bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                          {JSON.stringify(job.payload, null, 2)}
                        </pre>
                      </div>

                      {job.locked_until && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Locked Until</h4>
                          <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                            {new Date(job.locked_until).toLocaleString()}
                          </code>
                        </div>
                      )}

                      {job.completed_at && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Completed At</h4>
                          <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                            {new Date(job.completed_at).toLocaleString()}
                          </code>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
