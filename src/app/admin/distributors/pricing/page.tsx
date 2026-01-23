/**
 * Distributor Pricing Management
 * Manage standard tiered pricing for distributor products
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorPricingClient from '@/components/admin/DistributorPricingClient';

export default async function DistributorPricingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch all products
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, price, type, category, active')
    .order('type')
    .order('category')
    .order('description');

  // Fetch all distributor pricing
  const { data: distributorPricing } = await supabase
    .from('distributor_pricing')
    .select('*')
    .order('product_code');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Standard Distributor Pricing</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage default tiered pricing for all distributors
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
        {/* Info */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-teal-900 mb-2">How Standard Distributor Pricing Works</h3>
          <ul className="text-sm text-teal-800 space-y-1 list-disc list-inside">
            <li>Set default distributor prices below. If no price is set, the base product price is used.</li>
            <li>These prices apply to all distributors unless they have company-specific custom pricing.</li>
            <li>Only products marked as "show in distributor portal" will be visible to distributors.</li>
            <li>For distributor-specific pricing, use the Custom Pricing section.</li>
          </ul>
        </div>

        <DistributorPricingClient
          products={products || []}
          distributorPricing={distributorPricing || []}
        />

        {/* Additional Actions */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/admin/distributors/custom-pricing"
            className="text-teal-600 hover:text-teal-800 font-medium"
          >
            → Manage Custom Pricing per Distributor
          </Link>
        </div>
      </div>
    </div>
  );
}
