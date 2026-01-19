/**
 * Tool-Consumable Relationships Admin Page
 * Manage which consumables are compatible with which tools
 */

import { getSupabaseClient } from '@/lib/supabase';
import ToolConsumableManagementV2 from '@/components/admin/ToolConsumableManagementV2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ToolConsumablesAdminPage() {
  const supabase = getSupabaseClient();

  // Fetch all tool-consumable relationships
  const { data: relationships, error: relError } = await supabase
    .from('tool_consumable_map')
    .select('tool_code, consumable_code')
    .order('tool_code');

  console.log('[tool-consumables/page] Fetched relationships count:', relationships?.length || 0);
  if (relError) {
    console.error('[tool-consumables/page] Error fetching relationships:', relError);
  }

  // Fetch all tools (products with rental_price_monthly)
  const { data: tools, error: toolsError } = await supabase
    .from('products')
    .select('*')
    .not('rental_price_monthly', 'is', null)
    .order('product_code');

  // Fetch all consumables in batches (Supabase 1000 row limit)
  let allConsumables: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'consumable')
      .order('category', { ascending: true })
      .order('product_code', { ascending: true })
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('[tool-consumables] Error fetching consumables:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allConsumables = allConsumables.concat(batch);
      start += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  const consumables = allConsumables;

  if (relError || toolsError) {
    console.error('Error fetching data:', { relError, toolsError });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <ToolConsumableManagementV2
          relationships={relationships || []}
          tools={tools || []}
          consumables={consumables || []}
        />
      </div>
    </div>
  );
}
