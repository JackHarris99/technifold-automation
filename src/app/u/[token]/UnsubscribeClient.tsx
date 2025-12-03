/**
 * Unsubscribe Client Component
 * Handles the unsubscribe confirmation UI and action
 */

'use client';

import { useState } from 'react';

interface UnsubscribeClientProps {
  token: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  alreadyUnsubscribed: boolean;
}

export default function UnsubscribeClient({
  token,
  contactId,
  contactName,
  contactEmail,
  companyName,
  alreadyUnsubscribed,
}: UnsubscribeClientProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    alreadyUnsubscribed ? 'success' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const handleUnsubscribe = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unsubscribe');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Already unsubscribed or just completed
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {alreadyUnsubscribed ? 'Already Unsubscribed' : 'Successfully Unsubscribed'}
          </h1>
          <p className="text-gray-600 mb-2">
            <strong>{contactEmail}</strong>
          </p>
          <p className="text-gray-600 mb-8">
            {alreadyUnsubscribed
              ? 'This email address was already unsubscribed from marketing communications.'
              : 'You have been unsubscribed from marketing emails from Technifold USA.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You will still receive important transactional emails about your orders and account.
          </p>
          <a
            href="https://technifoldusa.com"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Technifold USA
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Unsubscribe from Marketing Emails
        </h1>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Email address:</p>
          <p className="font-medium text-gray-900">{contactEmail}</p>
          {contactName && (
            <>
              <p className="text-sm text-gray-600 mt-2 mb-1">Name:</p>
              <p className="font-medium text-gray-900">{contactName}</p>
            </>
          )}
          {companyName && (
            <>
              <p className="text-sm text-gray-600 mt-2 mb-1">Company:</p>
              <p className="font-medium text-gray-900">{companyName}</p>
            </>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          Click the button below to unsubscribe from marketing emails. You will still receive
          important transactional emails about your orders and account.
        </p>

        {status === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleUnsubscribe}
          disabled={status === 'loading'}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading' ? 'Unsubscribing...' : 'Unsubscribe'}
        </button>

        <p className="mt-6 text-sm text-gray-500">
          Changed your mind?{' '}
          <a href="https://technifoldusa.com/contact" className="text-blue-600 hover:text-blue-700">
            Contact us
          </a>{' '}
          to resubscribe.
        </p>
      </div>
    </div>
  );
}
