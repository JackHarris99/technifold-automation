/**
 * Request Quote Button
 * Captures quote request and redirects to quote page
 */

'use client';

import { useState } from 'react';

interface RequestQuoteButtonProps {
  token: string;
  machineSlug?: string;
}

export default function RequestQuoteButton({ token, machineSlug }: RequestQuoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestQuote = async () => {
    setIsLoading(true);

    try {
      // Create quote request in database
      const response = await fetch('/api/marketing/request-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, machine_slug: machineSlug }),
      });

      if (!response.ok) {
        throw new Error('Failed to create quote request');
      }

      // Redirect to quote page
      window.location.href = `/q/${token}`;
    } catch (error) {
      console.error('Error requesting quote:', error);
      setIsLoading(false);
      // Still redirect even if tracking fails
      window.location.href = `/q/${token}`;
    }
  };

  return (
    <button
      onClick={handleRequestQuote}
      disabled={isLoading}
      className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 hover:shadow-lg transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Loading...' : 'Request Quote'}
    </button>
  );
}
