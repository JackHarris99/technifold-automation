/**
 * Engagements Page
 * /admin/engagements - All engagement events filtered by global view mode
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import EngagementsTable from '@/components/admin/EngagementsTable';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getViewModeFromCookies, getSalesRepFromViewMode } from '@/lib/viewMode';

export default async function EngagementsPage() {
  const supabase = getSupabaseClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Get view mode from cookies
  const viewMode = await getViewModeFromCookies();
  const salesRepId = getSalesRepFromViewMode(viewMode, currentUser.sales_rep_id || '');

  // Fetch all engagement events with pagination
  let allEngagements: any[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch } = await supabase
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
      .order('occurred_at', { ascending: false })
      .range(offset, offset + batchSize - 1);

    if (!batch || batch.length === 0) {
      hasMore = false;
    } else {
      allEngagements = [...allEngagements, ...batch];
      if (batch.length < batchSize) {
        hasMore = false;
      }
      offset += batchSize;
    }
  }

  // Filter by account ownership based on view mode
  let filteredEngagements = allEngagements || [];
  if (salesRepId) {
    filteredEngagements = filteredEngagements.filter(event =>
      event.companies?.account_owner === salesRepId
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
          <p className="text-gray-800 mt-2">
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
