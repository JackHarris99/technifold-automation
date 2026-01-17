/**
 * Distributor Invitation Acceptance Page
 * Users click email link, land here, and set their password
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import AcceptInvitationClient from '@/components/distributor/AcceptInvitationClient';

interface AcceptInvitationPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function AcceptInvitationPage({ searchParams }: AcceptInvitationPageProps) {
  const params = await searchParams;
  const { token } = params;

  if (!token) {
    notFound();
  }

  const supabase = getSupabaseClient();

  // Verify token and get user details
  const { data: user, error } = await supabase
    .from('distributor_users')
    .select('*, companies(company_name)')
    .eq('invitation_token', token)
    .single();

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h1>
          <p className="text-gray-800 mb-8">
            This invitation link is invalid or has expired.
          </p>
          <a
            href="/distributor/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check if token expired
  const expiresAt = user.invitation_expires_at ? new Date(user.invitation_expires_at) : null;
  if (expiresAt && expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation Expired</h1>
          <p className="text-gray-800 mb-8">
            This invitation has expired. Please contact your administrator to resend the invitation.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // Check if user already set password
  if (user.password_hash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Set Up</h1>
          <p className="text-gray-800 mb-8">
            You've already set your password. Please login to continue.
          </p>
          <a
            href="/distributor/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <AcceptInvitationClient
      user={user}
      companyName={user.companies?.company_name || 'Unknown Company'}
      token={token}
    />
  );
}
