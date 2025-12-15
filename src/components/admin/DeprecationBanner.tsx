/**
 * Deprecation Banner
 * Reusable warning banner for deprecated admin pages
 */

'use client';

import Link from 'next/link';

interface DeprecationBannerProps {
  message: string;
  replacementUrl?: string;
  replacementLabel?: string;
  reason?: string;
}

export default function DeprecationBanner({
  message,
  replacementUrl,
  replacementLabel = 'View New Page',
  reason,
}: DeprecationBannerProps) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-bold text-yellow-800">
            DEPRECATED PAGE
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="font-semibold">{message}</p>
            {reason && (
              <p className="mt-1 text-xs">{reason}</p>
            )}
          </div>
          {replacementUrl && (
            <div className="mt-3">
              <Link
                href={replacementUrl}
                className="inline-flex items-center px-3 py-2 border border-yellow-600 text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                {replacementLabel} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
