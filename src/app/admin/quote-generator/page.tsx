/**
 * Redirect to new Quote Builder
 * This page is deprecated - use /admin/quote-builder instead
 */

'use client';

import { useEffect } from 'react';

export default function QuoteGeneratorRedirect() {
  useEffect(() => {
    window.location.href = '/admin/quote-builder';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
        <p className="text-gray-600">
          This page has moved to <a href="/admin/quote-builder" className="text-blue-600 hover:text-blue-700">Quote Builder</a>
        </p>
      </div>
    </div>
  );
}
