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
        {/* DEPRECATION NOTICE */}
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-orange-900 mb-3">⚠️ This Page is Deprecated - Using Dynamic Tier-Based Pricing</h3>
          <div className="text-sm text-orange-800 space-y-2">
            <p className="font-semibold">
              Distributor pricing is now calculated dynamically based on each distributor's pricing tier:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Tier 1 (40% off):</strong> Distributor pays 60% of base product price</li>
              <li><strong>Tier 2 (30% off):</strong> Distributor pays 70% of base product price</li>
              <li><strong>Tier 3 (20% off):</strong> Distributor pays 80% of base product price</li>
            </ul>
            <p className="mt-3 font-semibold">
              When you change a product's base price, all distributor prices update automatically.
            </p>
            <p className="mt-2">
              To set custom pricing for specific distributors, use the <Link href="/admin/distributors/custom-pricing" className="underline font-semibold">Custom Pricing</Link> page or the distributor's company page.
            </p>
          </div>
        </div>

        {/* Legacy Info - Old System (No Longer Used) */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6 opacity-60">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Legacy: Old Static Pricing System (Not Used)</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>This table below shows old static prices that are no longer used</li>
            <li>All pricing is now calculated dynamically from base product price × tier discount</li>
            <li>This data is kept for reference only</li>
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
