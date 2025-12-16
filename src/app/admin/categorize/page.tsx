/**
 * Company Categorization Tool
 * /admin/categorize
 * Quick review and categorize companies before territory assignment
 */

import { getSupabaseClient } from '@/lib/supabase';
import CategoryTable from '@/components/admin/CategoryTable';
import AdminLayout from '@/components/admin/AdminLayout';

export default async function CategorizePage() {
  const supabase = getSupabaseClient();

  // Get all companies with order metrics, sorted by value
  const { data: companies } = await supabase
    .rpc('get_companies_with_metrics')
    .order('lifetime_value', { ascending: false });

  // If RPC doesn't exist yet, use raw query
  const companiesData = companies || [];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Categorization</h1>
          <p className="text-gray-600 mt-2">
            Review and categorize companies before territory assignment
          </p>
        </div>

        <CategoryTable companies={companiesData} />
      </div>
    </div>
    </AdminLayout>
  );
}
