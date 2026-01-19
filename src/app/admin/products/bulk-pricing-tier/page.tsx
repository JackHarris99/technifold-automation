/**
 * Bulk Pricing Tier Management
 * Search/filter consumables and update pricing tiers in bulk
 * Directors only
 */

import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BulkPricingTierClient from '@/components/admin/BulkPricingTierClient';

export default async function BulkPricingTierPage() {
  const director = await isDirector();

  if (!director) {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Fetch all consumables with pricing tier info
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, type, category, pricing_tier, price, active')
    .eq('type', 'consumable')
    .order('product_code');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Pricing Tier Management</h1>
          <p className="text-gray-600 mt-2">
            Search for consumables, select multiple, and update their quote pricing tiers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How Pricing Tiers Work</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>No Tier:</strong> Standard pricing with no volume discounts (use for screws, standard items)</li>
            <li><strong>Standard Tier:</strong> Total quantity across all standard items determines unit price</li>
            <li><strong>Premium Tier:</strong> Per-SKU quantity determines percentage discount</li>
            <li><strong>Note:</strong> Pricing tiers only affect consumables quote builder, NOT distributor portals</li>
          </ul>
        </div>

        <BulkPricingTierClient products={products || []} />
      </div>
    </div>
  );
}
