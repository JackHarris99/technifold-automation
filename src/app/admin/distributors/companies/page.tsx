/**
 * Distributor Companies
 * List and manage all distributor companies
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorCompaniesClient from '@/components/admin/distributors/DistributorCompaniesClient';

export default async function DistributorCompaniesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch all distributor companies
  const { data: distributors } = await supabase
    .from('companies')
    .select(`
      company_id,
      company_name,
      sage_customer_code,
      country,
      account_opened_at,
      status,
      distributor_email,
      created_at,
      updated_at
    `)
    .eq('type', 'distributor')
    .order('company_name');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distributor Companies</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage all distributor companies and their settings
              </p>
            </div>
            <Link
              href="/admin/distributors/dashboard"
              className="text-teal-600 hover:text-teal-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Box */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-teal-900 mb-2">About Distributor Companies</h3>
          <ul className="text-sm text-teal-800 space-y-1 list-disc list-inside">
            <li>Distributors can access a dedicated portal to place orders</li>
            <li>Each distributor gets custom pricing (standard or company-specific)</li>
            <li>Orders require approval before being fulfilled</li>
            <li>Commission is tracked based on sales volume</li>
          </ul>
        </div>

        <DistributorCompaniesClient distributors={distributors || []} />
      </div>
    </div>
  );
}
