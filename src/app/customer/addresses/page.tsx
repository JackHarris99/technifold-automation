/**
 * Customer Address Management Page
 * Manage shipping addresses
 * /customer/addresses
 */

import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';
import AddressesClient from './AddressesClient';

export default async function CustomerAddressesPage() {
  // Check authentication
  const session = await getCustomerSession();

  if (!session) {
    redirect('/customer/login');
  }

  const supabase = getSupabaseClient();

  // Fetch addresses
  const { data: addresses, error } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('company_id', session.company_id)
    .order('is_default', { ascending: false });

  if (error) {
    console.error('[Customer Addresses] Error fetching addresses:', error);
  }

  return (
    <AddressesClient
      addresses={addresses || []}
      userName={session.first_name}
    />
  );
}
