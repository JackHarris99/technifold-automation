/**
 * Customer Portal Page  
 * Login-based reorder portal (replaces token-based /r/[token])
 * /customer/portal
 */

import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customerAuth';
import { generatePortalPayload } from '@/lib/portal-payload';
import { getSupabaseClient } from '@/lib/supabase';
import { PortalPage } from '@/components/PortalPage';

export default async function CustomerPortalPage() {
  // Check authentication
  const session = await getCustomerSession();

  if (!session) {
    redirect('/customer/login');
  }

  // Fetch contact details if contact_id exists
  let contact = null;
  if (session.contact_id) {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('contacts')
      .select('contact_id, email, first_name, last_name, full_name')
      .eq('contact_id', session.contact_id)
      .single();

    if (data) {
      contact = {
        contact_id: data.contact_id,
        email: data.email,
        full_name: data.full_name || `${data.first_name} ${data.last_name}`,
      };
    }
  }

  // Generate portal data (reuses existing logic)
  const payload = await generatePortalPayload(session.company_id);

  if (!payload) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h1>
          <p className="text-gray-700">
            You don't have any previous orders yet. Contact us to place your first order!
          </p>
        </div>
      </div>
    );
  }

  // Render portal (reuses existing PortalPage component)
  // For logged-in portal, we use a special token format that the API will recognize
  const sessionToken = `session:${session.company_id}`;

  return (
    <PortalPage
      payload={payload}
      contact={contact || undefined}
      token={sessionToken}
      isLoggedIn={true}
      userName={session.first_name}
    />
  );
}
