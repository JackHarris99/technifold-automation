/**
 * Company Console Landing - Redirect to first company
 */

import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { getUserRepFilter } from '@/lib/auth';

export default async function CompanyConsoleLanding() {
  const supabase = getSupabaseClient();

  // Get the most recent company (all users see all companies)
  const { data: companies } = await supabase
    .from('companies')
    .select('company_id')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (companies && companies.length > 0) {
    redirect(`/admin/company/${companies[0].company_id}`);
  }

  // Fallback if no companies exist
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Companies Found</h1>
        <p className="text-gray-600">Please add companies to the database to use the Company Console.</p>
      </div>
    </div>
  );
}
