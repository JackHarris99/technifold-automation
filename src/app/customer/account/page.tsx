/**
 * Customer Account Settings Page
 * Edit contact info, company info, and password
 * /customer/account
 */

import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';
import AccountClient from './AccountClient';

export default async function CustomerAccountPage() {
  // Check authentication
  const session = await getCustomerSession();

  if (!session) {
    redirect('/customer/login');
  }

  const supabase = getSupabaseClient();

  // Fetch contact details
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('contact_id, first_name, last_name, email, phone')
    .eq('contact_id', session.contact_id)
    .single();

  if (contactError) {
    console.error('[Customer Account] Error fetching contact:', contactError);
  }

  // Fetch company details
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select(`
      company_id,
      company_name,
      billing_address_line_1,
      billing_address_line_2,
      billing_city,
      billing_state_province,
      billing_postal_code,
      billing_country,
      vat_number
    `)
    .eq('company_id', session.company_id)
    .single();

  if (companyError) {
    console.error('[Customer Account] Error fetching company:', companyError);
  }

  return (
    <AccountClient
      contact={contact || null}
      company={company || null}
      userName={session.first_name}
    />
  );
}
