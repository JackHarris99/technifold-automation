/**
 * Company Console Landing - Select a company
 */

import { getSupabaseClient } from '@/lib/supabase';
import CompanyQuickFind from '@/components/admin/CompanyQuickFind';

export default async function CompanyConsoleLanding() {
  const supabase = getSupabaseClient();

  // Get recent companies for quick access
  const { data: recentCompanies } = await supabase
    .from('companies')
    .select('company_id, company_name, account_owner, updated_at')
    .order('updated_at', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Company Console
          </h1>
          <p className="text-xl text-gray-600">
            Select a company to manage machines, send marketing, and track engagement
          </p>
        </div>

        <CompanyQuickFind recentCompanies={recentCompanies || []} />
      </div>
    </div>
  );
}
