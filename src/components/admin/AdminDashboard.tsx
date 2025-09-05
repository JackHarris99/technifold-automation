import { Company } from '@/types';
import { AdminHeader } from './AdminHeader';
import { CompanyList } from './CompanyList';

interface AdminDashboardProps {
  companies: Company[];
}

export function AdminDashboard({ companies }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Technifold Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage company portal links, track orders, and send email campaigns
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Company Portal Links</h2>
            <p className="text-sm text-gray-500 mt-1">
              {companies.length} companies with permanent portal access
            </p>
          </div>
          
          <CompanyList companies={companies} />
        </div>
      </main>
    </div>
  );
}