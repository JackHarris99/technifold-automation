/**
 * Supplier Orders Page
 * View and manage purchase orders to suppliers
 */

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function SupplierOrdersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage purchase orders and supplier deliveries
              </p>
            </div>
            <Link
              href="/admin/suppliers/dashboard"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Coming Soon Message */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Management Coming Soon</h2>
          <p className="text-gray-700 mb-6">
            This feature is currently being developed. You'll be able to create and track purchase orders here.
          </p>
          <div className="text-left max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Planned Features:</h3>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Create purchase orders</li>
              <li>Track delivery status</li>
              <li>Manage invoices and payments</li>
              <li>Monitor supplier performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
