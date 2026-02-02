/**
 * Distributor Management Page
 * Bulk edit pricing tiers and manage portal access
 */

import { getSupabaseClient } from '@/lib/supabase';
import DistributorManagementClient from '@/components/admin/DistributorManagementClient';

async function fetchAllDistributors() {
  const supabase = getSupabaseClient();

  // Fetch distributors
  const { data: distributors, error } = await supabase
    .from('companies')
    .select('*')
    .eq('type', 'distributor')
    .order('company_name');

  if (error) {
    console.error('Error fetching distributors:', error);
    return [];
  }

  // Fetch all contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('contact_id, company_id, email, full_name');

  // Fetch all distributor users
  const { data: users } = await supabase
    .from('distributor_users')
    .select('user_id, company_id, email, invitation_token');

  // Build maps
  const contactsByCompany = new Map<string, any[]>();
  contacts?.forEach(c => {
    if (!contactsByCompany.has(c.company_id)) {
      contactsByCompany.set(c.company_id, []);
    }
    contactsByCompany.get(c.company_id)!.push(c);
  });

  const usersByCompany = new Map<string, any[]>();
  users?.forEach(u => {
    if (!usersByCompany.has(u.company_id)) {
      usersByCompany.set(u.company_id, []);
    }
    usersByCompany.get(u.company_id)!.push(u);
  });

  // Enrich distributors
  return (distributors || []).map(d => ({
    ...d,
    contacts: contactsByCompany.get(d.company_id) || [],
    users: usersByCompany.get(d.company_id) || [],
  }));
}

export default async function DistributorManagementPage() {
  const distributors = await fetchAllDistributors();

  return <DistributorManagementClient distributors={distributors} />;
}
