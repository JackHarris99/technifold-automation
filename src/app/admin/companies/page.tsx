/**
 * Companies List - Territory Filtered
 * Directors see all, sales reps see their companies
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CompaniesPageWrapper from '@/components/admin/CompaniesPageWrapper';

export default async function CompaniesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get view mode from cookies
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get('view_mode');
  const viewMode = viewModeCookie?.value === 'my_customers' ? 'my_customers' : 'all';

  const supabase = getSupabaseClient();

  // Fetch companies (bypass 1000 row limit with batching)
  let allCompanies: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('companies')
      .select('company_id, company_name, account_owner, category, country, last_invoice_at')
      .neq('status', 'dead')  // Exclude dead customers
      .order('company_name')
      .range(start, start + batchSize - 1);

    // Apply "My Customers" filter
    if (viewMode === 'my_customers') {
      query = query.eq('account_owner', user.sales_rep_id);
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
