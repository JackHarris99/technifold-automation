/**
 * Outbox Jobs Page - Admin Control Plane
 * Monitor and manage async job queue
 */

import { getSupabaseClient } from '@/lib/supabase';
import OutboxJobsTable from '@/components/admin/OutboxJobsTable';

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

export default async function OutboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || 'all';
  const typeFilter = params.type || 'all';

  const supabase = getSupabaseClient();

  // Fetch outbox jobs
  let dbQuery = supabase
    .from('outbox')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (statusFilter !== 'all') {
    dbQuery = dbQuery.eq('status', statusFilter);
  }

  if (typeFilter !== 'all') {
    dbQuery = dbQuery.eq('job_type', typeFilter);
  }

  const { data: jobs, error } = await dbQuery;

  if (error) {
    console.error('[outbox-page] Error fetching jobs:', error);
  }

  const outboxJobs: OutboxJob[] = (jobs || []) as OutboxJob[];

  // Calculate stats
  const pendingCount = outboxJobs.filter(j => j.status === 'pending').length;
  const failedCount = outboxJobs.filter(j => j.status === 'failed').length;
  const completedCount = outboxJobs.filter(j => j.status === 'completed').length;

  // Get unique job types
  const jobTypes = Array.from(new Set(outboxJobs.map(j => j.job_type)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Outbox Jobs</h1>
        <p className="mt-2 text-sm text-gray-700">
          Monitor and manage async job processing queue
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{outboxJobs.length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">{pendingCount}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{failedCount}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{completedCount}</dd>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          name="status"
          defaultValue={statusFilter}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value === 'all') {
              url.searchParams.delete('status');
            } else {
              url.searchParams.set('status', e.target.value);
            }
            window.location.href = url.toString();
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="completed">Completed</option>
        </select>

        <select
          name="type"
          defaultValue={typeFilter}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value === 'all') {
              url.searchParams.delete('type');
            } else {
              url.searchParams.set('type', e.target.value);
            }
            window.location.href = url.toString();
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">All Types</option>
          {jobTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Jobs Table */}
      <OutboxJobsTable jobs={outboxJobs} />

      {/* Footer Stats */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {outboxJobs.length} jobs
      </div>
    </div>
  );
}
