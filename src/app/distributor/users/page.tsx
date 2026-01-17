/**
 * Distributor User Management
 * Allows distributor admins to manage their team
 */

import { getCurrentDistributor } from '@/lib/distributorAuth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import DistributorUsersClient from '@/components/distributor/DistributorUsersClient';

export default async function DistributorUsersPage() {
  const distributor = await getCurrentDistributor();

  if (!distributor) {
    redirect('/distributor/login');
  }

  // Only admins can manage users
  if (distributor.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-800 mb-6">
            Only administrators can manage users. Please contact your account admin if you need access.
          </p>
          <a
            href="/distributor"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const supabase = getSupabaseClient();

  // Fetch all users for this company
  const { data: users } = await supabase
    .from('distributor_users')
    .select('*')
    .eq('company_id', distributor.company_id)
    .order('created_at');

  return (
    <DistributorUsersClient
      companyName={distributor.company_name}
      companyId={distributor.company_id}
      users={users || []}
    />
  );
}
