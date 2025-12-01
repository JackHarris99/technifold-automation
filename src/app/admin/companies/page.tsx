/**
 * Company List Page
 * /admin/companies
 * All companies with sortable columns, color-coded by rep
 */

import CompanyListTable from '@/components/admin/CompanyListTable';

export default function CompanyListPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Companies</h1>
          <p className="text-gray-600 mt-2">
            View all territories - color-coded by account owner
          </p>
        </div>

        <CompanyListTable />
      </div>
    </div>
  );
}
