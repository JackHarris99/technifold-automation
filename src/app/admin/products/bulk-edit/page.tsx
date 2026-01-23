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

  // Fetch all products for both tabs
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, type, category, pricing_tier, price, active, extra')
    .order('product_code')
    .limit(10000);

  return <BulkEditClient products={products || []} />;
}
