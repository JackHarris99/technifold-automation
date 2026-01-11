/**
 * GET/POST /api/admin/tools/sync
 * One-time sync: Copy all tools from company_product_history to company_tools
 * This fixes any tools that were manually added and are missing from company_tools
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

async function syncTools() {
  try {
    const supabase = getSupabaseClient();

    // 1. Fetch all tools from company_product_history
    const { data: tools, error: fetchError } = await supabase
      .from('company_product_history')
      .select('company_id, product_code, first_purchased_at, last_purchased_at, total_quantity')
      .eq('product_type', 'tool');

    if (fetchError) {
      console.error('[tools/sync] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
    }

    if (!tools || tools.length === 0) {
      return NextResponse.json({ message: 'No tools found to sync', synced: 0 });
    }

    // 2. Upsert each tool into company_tools
    let synced = 0;
    let errors = 0;

    for (const tool of tools) {
      const { error: upsertError } = await supabase
        .from('company_tools')
        .upsert(
          {
            company_id: tool.company_id,
            tool_code: tool.product_code,
            first_seen_at: tool.first_purchased_at,
            last_seen_at: tool.last_purchased_at,
            total_units: tool.total_quantity || 1,
          },
          {
            onConflict: 'company_id,tool_code',
            ignoreDuplicates: false,
          }
        );

      if (upsertError) {
        console.error('[tools/sync] Upsert error for', tool.product_code, ':', upsertError);
        errors++;
      } else {
        synced++;
      }
    }

    console.log(`[tools/sync] Synced ${synced} tools, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Synced ${synced} tools from company_product_history to company_tools`,
      synced,
      errors,
      total: tools.length,
    });
  } catch (error) {
    console.error('[tools/sync] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return syncTools();
}

export async function POST() {
  return syncTools();
}
