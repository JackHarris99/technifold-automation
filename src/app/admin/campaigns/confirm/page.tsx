/**
 * Knowledge Confirmation Dashboard
 * Sales team reviews and confirms machine knowledge learned from campaigns
 */

import { AdminHeader } from '@/components/admin/AdminHeader';
import ConfirmationQueue from '@/components/admin/campaigns/ConfirmationQueue';
import { getSupabaseClient } from '@/lib/supabase';

export const metadata = {
  title: 'Confirm Machine Knowledge | Technifold Admin',
  description: 'Review and confirm customer machine details learned from campaigns',
};

async function getConfirmationQueue() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('knowledge_confirmation_queue')
      .select(`
        *,
        companies:company_id (company_name),
        contacts:contact_id (first_name, last_name, email, role),
        machine_taxonomy:machine_taxonomy_id (*)
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching confirmation queue:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getConfirmationQueue:', error);
    return [];
  }
}

async function getStats() {
  try {
    const supabase = getSupabaseClient();

    const { data: pending } = await supabase
      .from('knowledge_confirmation_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: confirmed } = await supabase
      .from('knowledge_confirmation_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    const { data: thisWeek } = await supabase
      .from('knowledge_confirmation_queue')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    return {
      pending: (pending as any)?.count || 0,
      confirmed: (confirmed as any)?.count || 0,
      thisWeek: (thisWeek as any)?.count || 0,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { pending: 0, confirmed: 0, thisWeek: 0 };
  }
}

export default async function ConfirmationPage() {
  const [queue, stats] = await Promise.all([
    getConfirmationQueue(),
    getStats(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Confirm Machine Knowledge</h1>
          <p className="mt-2 text-gray-600">
            Review customer clicks and confirm machine details for accurate targeting
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
            <div className="text-sm font-medium text-yellow-700">Pending Review</div>
            <div className="mt-2 text-3xl font-semibold text-yellow-900">
              {stats.pending}
            </div>
            <div className="mt-1 text-xs text-yellow-600">needs confirmation</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
            <div className="text-sm font-medium text-green-700">Confirmed</div>
            <div className="mt-2 text-3xl font-semibold text-green-900">
              {stats.confirmed}
            </div>
            <div className="mt-1 text-xs text-green-600">all time</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
            <div className="text-sm font-medium text-blue-700">This Week</div>
            <div className="mt-2 text-3xl font-semibold text-blue-900">
              {stats.thisWeek}
            </div>
            <div className="mt-1 text-xs text-blue-600">new learnings</div>
          </div>
        </div>

        {/* Confirmation Queue */}
        <ConfirmationQueue queue={queue} />
      </main>
    </div>
  );
}
