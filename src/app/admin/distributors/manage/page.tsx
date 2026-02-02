/**
 * Distributor Management Page
 * Bulk edit pricing tiers and manage portal access
 */

import { getSupabaseClient } from '@/lib/supabase';
import DistributorManagementClient from '@/components/admin/DistributorManagementClient';

async function fetchAllDistributors() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('type', 'distributor')
    .order('company_name');

  if (error) {
    console.error('Error fetching distributors:', error);
    return [];
  }

  return data || [];
}

export default async function DistributorManagementPage() {
  const distributors = await fetchAllDistributors();

  return <DistributorManagementClient distributors={distributors} />;
}
