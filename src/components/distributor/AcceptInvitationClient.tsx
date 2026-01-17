'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AcceptInvitationClientProps {
  user: {
    user_id: string;
    email: string;
    full_name: string;
    role: string;
  };
  companyName: string;
  token: string;
}

export default function AcceptInvitationClient({
  user,
  companyName,
  token,
}: AcceptInvitationClientProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/distributor/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      // Redirect to login
      alert('Password set successfully! Please login to continue.');
      router.push('/distributor/login');
    } catch (err: any) {
      console.error('Error setting password:', err);
      setError(err.message || 'Failed to set password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Technifold
            </h1>
            <p className="text-gray-800">
              Set your password to access the distributor portal
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-700">
              <div className="font-semibold text-gray-900">{user.full_name}</div>
              <div>{user.email}</div>
              <div className="mt-2">
                <span className="text-gray-700">Company: </span>
                <span className="font-medium text-gray-900">{companyName}</span>
              </div>
              <div>
                <span className="text-gray-700">Role: </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'user' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Create Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Re-enter password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Setting Password...' : 'Set Password & Continue'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-700 mt-6">
          Need help? <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact support</a>
        </p>
      </div>
    </div>
  );
}
