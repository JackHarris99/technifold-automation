/**
 * Engagements Page
 * /admin/engagements - All engagement events filtered by global view mode
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import EngagementsTable from '@/components/admin/EngagementsTable';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function EngagementsPage() {
  const supabase = getSupabaseClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Get view mode from cookies
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get('view_mode');
  const viewMode = viewModeCookie?.value === 'my_customers' ? 'my_customers' : 'all';

  // Fetch all engagement events
  let query = supabase
    .from('engagement_events')
    .select(`
      event_id,
      occurred_at,
      event_type,
      event_name,
      source,
      company_id,
      contact_id,
      offer_key,
      campaign_key,
      url,
      value,
      currency,
      companies:company_id(company_name, account_owner),
      contacts:contact_id(full_name, email)
    `)
    .order('occurred_at', { ascending: false });

  const { data: allEngagements } = await query.limit(1000);

  // Filter by account ownership if in "my_customers" mode
  let filteredEngagements = allEngagements || [];
  if (viewMode === 'my_customers') {
    filteredEngagements = filteredEngagements.filter(event =>
      event.companies?.account_owner === currentUser.sales_rep_id
    );
  }

  // Get unique engagement types for filtering
  const engagementTypes = [...new Set(filteredEngagements.map(e => e.event_type).filter(Boolean) || [])].sort();

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Engagement Events
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredEngagements.length} events • {viewMode === 'my_customers' ? 'My Customers Only' : 'All Companies (Team View)'}
          </p>
        </div>

        <EngagementsTable
          engagements={filteredEngagements}
          engagementTypes={engagementTypes}
          isDirector={viewMode === 'all'}
          currentRepId={currentUser.sales_rep_id}
        />
      </div>
    </div>
  );
}
