/**
 * Distributor User Management
 * Admin page to manage distributor users across all companies
 * SECURITY: Directors only
 */

import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorUsersClient from '@/components/admin/DistributorUsersClient';

export default async function DistributorsPage() {
  // SECURITY: Directors only
  const director = await isDirector();

  if (!director) {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Fetch all distributor companies
  const { data: companies } = await supabase
    .from('companies')
    .select('company_id, company_name, type')
    .eq('type', 'distributor')
    .order('company_name');

  // Fetch all distributor users
  const { data: users } = await supabase
    .from('distributor_users')
    .select('*')
    .order('company_id, created_at');

  // Fetch all contacts for distributor companies
  const { data: contacts } = await supabase
    .from('contacts')
    .select('contact_id, company_id, full_name, email, role')
    .in('company_id', (companies || []).map(c => c.company_id))
    .order('company_id, full_name')
    .limit(10000);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distributor Users</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage user access to the distributor portal
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How It Works</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>Admin users</strong> can manage their company's users and place orders</li>
            <li><strong>User</strong> role can place orders and view history</li>
            <li><strong>Viewer</strong> role can only view orders (no ordering)</li>
            <li>When you create a user, they receive an email invitation to set their password</li>
            <li>Admin users can invite additional team members from the distributor portal</li>
          </ul>
        </div>

        <DistributorUsersClient
          companies={companies || []}
          users={users || []}
          contacts={contacts || []}
        />

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/admin/distributors/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Distributor Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
