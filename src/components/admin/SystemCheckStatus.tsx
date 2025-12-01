/**
 * System Check Status Messages - Client Component
 * Displays success/error messages from URL params
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SystemCheckStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const jobId = searchParams.get('job_id');
  const processed = searchParams.get('processed');
  const failed = searchParams.get('failed');
  const url = searchParams.get('url');

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        router.replace('/admin/system-check');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, router]);

  if (!success && !error) {
    return null;
  }

  return (
    <div className="mb-6">
      {success === 'offer_enqueued' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-start">
          <svg
            className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold">Offer enqueued successfully!</p>
            {jobId && <p className="text-sm mt-1">Job ID: {jobId}</p>}
          </div>
        </div>
      )}

      {success === 'outbox_run' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-start">
          <svg
            className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold">Outbox worker completed!</p>
            <p className="text-sm mt-1">
              Processed: {processed || 0} | Failed: {failed || 0}
            </p>
          </div>
        </div>
      )}

      {success === 'checkout_started' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-start">
          <svg
            className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold">Checkout session created!</p>
            {url && (
              <p className="text-sm mt-1 break-all">
                URL: <code className="bg-green-100 px-1 rounded">{decodeURIComponent(url)}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex items-start">
          <svg
            className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold">Error occurred</p>
            <p className="text-sm mt-1">{decodeURIComponent(error)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
