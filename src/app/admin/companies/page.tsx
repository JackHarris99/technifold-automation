/**
 * Companies List - Territory Filtered
 * Directors see all, sales reps see their companies
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CompaniesPageWrapper from '@/components/admin/CompaniesPageWrapper';
import { getSalesRepFromViewMode, type ViewMode } from '@/lib/viewMode';

export const revalidate = 0; // Disable caching, always fetch fresh data

export default async function CompaniesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get view mode from cookies
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get('view_mode');
  const viewModeValue = viewModeCookie?.value || 'all';

  // Parse view mode
  let viewMode: ViewMode = 'all';
  if (viewModeValue === 'my_customers') viewMode = 'my_customers';
  else if (viewModeValue === 'view_as_lee') viewMode = 'view_as_lee';
  else if (viewModeValue === 'view_as_steve') viewMode = 'view_as_steve';
  else if (viewModeValue === 'view_as_callum') viewMode = 'view_as_callum';

  // Determine which sales rep to filter by
  const filterBySalesRep = getSalesRepFromViewMode(viewMode, user.sales_rep_id);

  const supabase = getSupabaseClient();

  // Fetch companies (bypass 1000 row limit with batching)
  let allCompanies: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('companies')
      .select('company_id, company_name, account_owner, category, country, billing_city, billing_postal_code, billing_address_line_1, last_invoice_at, sage_customer_code')
      .eq('type', 'customer')  // ONLY customers (not prospects, distributors, press, suppliers)
      .neq('status', 'dead')  // Exclude dead customers
      .order('company_name')
      .range(start, start + batchSize - 1);

    // Apply sales rep filter
    if (filterBySalesRep) {
      query = query.eq('account_owner', filterBySalesRep);
    }

    const { data: batch, error } = await query;

    if (error) {
      console.error('[Companies] Query error:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allCompanies = allCompanies.concat(batch);
      start += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  const companies = allCompanies;
  const totalCompanies = companies.length;

  return <CompaniesPageWrapper companies={companies} totalCompanies={totalCompanies} viewMode={viewMode} />;
}
