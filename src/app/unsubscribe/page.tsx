/**
 * Unsubscribe Page
 * Allow prospects to opt out of marketing emails
 */

import { getSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-[#e8e8e8] p-8 max-w-md w-full text-center">
          <h1 className="text-[24px] font-[700] text-[#0a0a0a] mb-4">Invalid Link</h1>
          <p className="text-[14px] text-[#64748b]">
            This unsubscribe link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const supabase = getSupabaseClient();

  // Look up contact by token (check both campaign_sends and prospect_contacts)
  let prospectContactId = null;
  let email = null;

  // Try campaign send token first
  const { data: send } = await supabase
    .from('campaign_sends')
    .select('prospect_contact_id, email_address')
    .eq('token', token)
    .single();

  if (send) {
    prospectContactId = send.prospect_contact_id;
    email = send.email_address;
  } else {
    // Try prospect contact token
    const { data: contact } = await supabase
      .from('prospect_contacts')
      .select('prospect_contact_id, email')
      .eq('token', token)
      .single();

    if (contact) {
      prospectContactId = contact.prospect_contact_id;
      email = contact.email;
    }
  }

  if (!prospectContactId) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-[#e8e8e8] p-8 max-w-md w-full text-center">
          <h1 className="text-[24px] font-[700] text-[#0a0a0a] mb-4">Contact Not Found</h1>
          <p className="text-[14px] text-[#64748b]">
            We couldn't find a contact associated with this link.
          </p>
        </div>
      </div>
    );
  }

  // Check current subscription status
  const { data: contact } = await supabase
    .from('prospect_contacts')
    .select('marketing_status')
    .eq('prospect_contact_id', prospectContactId)
    .single();

  const alreadyUnsubscribed = contact?.marketing_status === 'unsubscribed';

  // If not already unsubscribed, update status
  if (!alreadyUnsubscribed) {
    await supabase
      .from('prospect_contacts')
      .update({
        marketing_status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('prospect_contact_id', prospectContactId);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border border-[#e8e8e8] p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-[24px] font-[700] text-[#0a0a0a] mb-2">
            {alreadyUnsubscribed ? 'Already Unsubscribed' : 'Successfully Unsubscribed'}
          </h1>
          <p className="text-[14px] text-[#64748b] mb-6">
            {alreadyUnsubscribed
              ? `The email address ${email} is already unsubscribed from our marketing emails.`
              : `The email address ${email} has been unsubscribed from our marketing emails.`}
          </p>
          <div className="bg-[#f8fafc] rounded-lg p-4 text-[13px] text-[#64748b]">
            You will no longer receive marketing communications from Technifold.
            You may still receive transactional emails related to your account or orders.
          </div>
        </div>
        <div className="mt-6 text-center">
          <a
            href="https://technifold.com"
            className="text-[13px] text-blue-600 hover:text-blue-700 font-[600]"
          >
            Visit Technifold.com
          </a>
        </div>
      </div>
    </div>
  );
}
