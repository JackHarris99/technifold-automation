/**
 * Individual Tool-Consumable Management Page
 * Shows all consumables for a specific tool with images
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ToolConsumableDetail from '@/components/admin/ToolConsumableDetail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ tool_code: string }>;
}

export default async function ToolConsumableDetailPage({ params }: PageProps) {
  const { tool_code } = await params;
  const supabase = getSupabaseClient();

  // Fetch the tool
  const { data: tool, error: toolError } = await supabase
    .from('products')
    .select('*')
    .eq('product_code', tool_code)
    .single();

  if (toolError || !tool) {
    notFound();
  }

  // Fetch existing relationships for this tool
  const { data: relationships } = await supabase
    .from('tool_consumable_map')
    .select('consumable_code')
    .eq('tool_code', tool_code);

  const linkedConsumableCodes = (relationships || []).map(r => r.consumable_code);

  // Fetch all linked consumables with details
  let linkedConsumables: any[] = [];
  if (linkedConsumableCodes.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('product_code', linkedConsumableCodes)
      .order('category', { ascending: true })
      .order('product_code', { ascending: true });

    linkedConsumables = data || [];
  }

  // Fetch all available consumables for adding
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
      console.error('[tool-consumable-detail] Error fetching consumables:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ToolConsumableDetail
        tool={tool}
        linkedConsumables={linkedConsumables}
        allConsumables={allConsumables}
        linkedConsumableCodes={linkedConsumableCodes}
      />
    </div>
  );
}
