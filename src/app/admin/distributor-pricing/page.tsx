/**
 * Distributor Pricing Management
 * Manage tiered pricing for distributor products
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorPricingClient from '@/components/admin/DistributorPricingClient';

export default async function DistributorPricingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
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
              <h1 className="text-3xl font-bold text-gray-900">Distributor Pricing</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage tiered pricing for distributor products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How Distributor Pricing Works</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Set custom distributor prices below. If no price is set, the base product price is used.</li>
            <li>These prices apply to all distributors in the portal.</li>
            <li>Only products marked as "show in distributor portal" will be visible to distributors.</li>
            <li>Distributors can place orders and receive Stripe invoices for payment.</li>
          </ul>
        </div>

        <DistributorPricingClient
          products={products || []}
          distributorPricing={distributorPricing || []}
        />

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/admin/sales" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Sales Center
          </Link>
        </div>
      </div>
    </div>
  );
}
