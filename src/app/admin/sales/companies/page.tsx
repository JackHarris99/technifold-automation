/**
 * Sales Center - My Companies (Territory Filtered)
 * Shows ONLY companies assigned to current user
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TerritoryCompanyList from '@/components/admin/TerritoryCompanyList';

export default async function SalesCenterCompaniesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Territory</h1>
          <p className="text-gray-600 mt-2">
            Companies assigned to {currentUser.full_name}
          </p>
        </div>

        <TerritoryCompanyList userId={currentUser.id} userName={currentUser.full_name || currentUser.email} />
      </div>
    </div>
  );
}
