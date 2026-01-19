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

  // Fetch all tool-consumable relationships in batches (Supabase 1000 row limit)
  let allRelationships: any[] = [];
  let relStart = 0;
  const relBatchSize = 1000;
  let hasMoreRels = true;

  while (hasMoreRels) {
    const { data: batch, error } = await supabase
      .from('tool_consumable_map')
      .select('tool_code, consumable_code')
      .order('tool_code')
      .range(relStart, relStart + relBatchSize - 1);

    if (error) {
      console.error('[tool-consumables] Error fetching relationships:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allRelationships = allRelationships.concat(batch);
      relStart += relBatchSize;
      hasMoreRels = batch.length === relBatchSize;
    } else {
      hasMoreRels = false;
    }
  }

  const relationships = allRelationships;

  console.log('[tool-consumables/page] Fetched', relationships?.length || 0, 'relationships from DB');
  if (relationships && relationships.length > 0) {
    console.log('[tool-consumables/page] Sample relationships:', relationships.slice(0, 3));
  }

  // Fetch all tools (products with rental_price_monthly)
  const { data: tools, error: toolsError } = await supabase
    .from('products')
    .select('*')
    .not('rental_price_monthly', 'is', null)
    .order('product_code');

  console.log('[tool-consumables/page] Fetched', tools?.length || 0, 'tools from DB');
  if (tools && tools.length > 0) {
    console.log('[tool-consumables/page] Sample tool product_codes:', tools.slice(0, 3).map(t => t.product_code));
  }

  // Check if the tool codes match between tables
  if (relationships && tools && relationships.length > 0 && tools.length > 0) {
    const relToolCodes = new Set(relationships.map(r => r.tool_code));
    const productCodes = new Set(tools.map(t => t.product_code));
    const relOnly = [...relToolCodes].filter(code => !productCodes.has(code)).slice(0, 5);
    const productsOnly = [...productCodes].filter(code => !relToolCodes.has(code)).slice(0, 5);

    if (relOnly.length > 0) {
      console.log('[tool-consumables/page] ⚠️ Tool codes in relationships but NOT in products:', relOnly);
    }
    if (productsOnly.length > 0) {
      console.log('[tool-consumables/page] ℹ️ Tool codes in products but NOT in relationships:', productsOnly);
    }
  }

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

  if (toolsError) {
    console.error('Error fetching tools:', toolsError);
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
