/**
 * Unsubscribe Route
 * /u/[token] - HMAC-signed token for email unsubscribe
 * Updates contact's marketing_status to 'unsubscribed'
 */

import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import UnsubscribeClient from './UnsubscribeClient';

interface UnsubscribePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function UnsubscribePage({ params }: UnsubscribePageProps) {
  const { token } = await params;

  // 1. Verify HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-8">
            This unsubscribe link is no longer valid. Please contact us if you'd like to unsubscribe.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  const { contact_id, company_id, email } = payload;
  const supabase = getSupabaseClient();

  // 2. Fetch contact details
  let contact = null;
  let company = null;

  if (contact_id) {
    const { data } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email, marketing_status')
      .eq('contact_id', contact_id)
      .single();
    contact = data;
  }

  if (company_id) {
    const { data } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', company_id)
      .single();
    company = data;
  }

  // 3. Track page view
  await supabase.from('engagement_events').insert({
    contact_id: contact_id || null,
    company_id: company_id || null,
    event_type: 'unsubscribe_page_view',
    event_name: 'unsubscribe_page_view',
    source: 'email_link',
    url: `/u/${token}`,
    meta: {
      contact_email: contact?.email || email,
      company_name: company?.company_name,
    }
  });

  return (
    <UnsubscribeClient
      token={token}
      contactId={contact_id}
      contactName={contact?.full_name || ''}
      contactEmail={contact?.email || email || ''}
      companyName={company?.company_name || ''}
      alreadyUnsubscribed={contact?.marketing_status === 'unsubscribed'}
    />
  );
}

export async function generateMetadata() {
  return {
    title: 'Unsubscribe - Technifold',
    description: 'Manage your email preferences',
  };
}
