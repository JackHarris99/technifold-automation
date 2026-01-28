/**
 * Bulk Product Editor - Unified Page
 * Combines: Bulk Pricing Tier + Bulk Attributes
 */

import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BulkEditClient from '@/components/admin/BulkEditClient';

export default async function BulkEditPage() {
  const director = await isDirector();

  if (!director) {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Fetch all products for both tabs (no limit - fetch everything)
  const { data: products, count } = await supabase
    .from('products')
    .select('product_code, description, type, category, pricing_tier, price, active, extra', { count: 'exact' })
    .order('product_code')
    .range(0, 100000);

  console.log(`[Bulk Edit] Loaded ${products?.length || 0} products (total: ${count})`);

  return <BulkEditClient products={products || []} />;
}
