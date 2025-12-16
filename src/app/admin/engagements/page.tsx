/**
 * Engagements Page
 * /admin/engagements - All engagement events filtered by ownership
 * Sales reps: Only their companies
 * Directors: All companies with rep filter
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser, isDirector } from '@/lib/auth';
import EngagementsTable from '@/components/admin/EngagementsTable';

export default async function EngagementsPage() {
  const supabase = getSupabaseClient();
  const currentUser = await getCurrentUser();
  const isDir = await isDirector();

  if (!currentUser) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
            <a href="/admin/login" className="text-blue-600 hover:underline">Go to Login</a>
          </div>
        </div>
    );
  }

  // Build query based on role
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

  // Sales reps only see their companies' engagements
  if (!isDir && currentUser.rep_id) {
    // We need to filter by companies.account_owner
    // Since we can't directly filter on joined tables in Supabase,
    // we'll fetch all and filter client-side or use a view
    // For now, let's fetch all and filter in component
  }

  const { data: allEngagements } = await query.limit(1000);

  // Get unique engagement types for filtering
  const engagementTypes = [...new Set(allEngagements?.map(e => e.event_type).filter(Boolean) || [])].sort();

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isDir ? 'All Engagements' : 'My Engagements'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isDir
              ? 'Complete engagement history across all companies and territories'
              : `Engagement history for companies owned by ${currentUser.rep_name}`
            }
          </p>
        </div>

        <EngagementsTable
          engagements={allEngagements || []}
          engagementTypes={engagementTypes}
          isDirector={isDir}
          currentRepId={currentUser.rep_id}
        />
      </div>
    </div>
  );
}
