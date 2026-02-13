/**
 * Customer Portal Access via Permanent Link
 * /customer/access?token={portal_token}
 * Creates session from permanent portal token
 */

import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { createCustomerSession } from '@/lib/customerAuth';

interface PageProps {
  searchParams: { token?: string };
}

export default async function CustomerAccessPage({ searchParams }: PageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-700">
            This portal access link is missing the required token.
          </p>
          <a
            href="/customer/login"
            className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Go to Login Page
          </a>
        </div>
      </div>
    );
  }

  const supabase = getSupabaseClient();

  // Find user by portal_token
  const { data: user, error } = await supabase
    .from('customer_users')
    .select('*')
    .eq('portal_token', token)
    .eq('is_active', true)
    .single();

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-700 mb-4">
            This portal access link is no longer valid. Please contact us for a new link.
          </p>
          <a
            href="/customer/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Try Password Login
          </a>
        </div>
      </div>
    );
  }

  // Check if token has expired
  if (user.portal_token_expires_at && new Date(user.portal_token_expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-700 mb-4">
            This portal access link has expired. Please contact us for a new link.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Or login with your password if you've set one:
          </p>
          <a
            href="/customer/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Login with Password
          </a>
        </div>
      </div>
    );
  }

  // Create customer session
  await createCustomerSession({
    user_id: user.user_id,
    company_id: user.company_id,
    contact_id: user.contact_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  });

  // Redirect to customer portal
  redirect('/customer/portal');
}
