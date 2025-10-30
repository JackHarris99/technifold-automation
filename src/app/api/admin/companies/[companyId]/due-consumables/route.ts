/**
 * GET /api/admin/companies/[companyId]/due-consumables
 * Get THIS company's overdue consumables from all three views
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await context.params;
    const supabase = getSupabaseClient();

    // Query all three reorder views for this company
    const [res90, res180, res365] = await Promise.all([
      supabase.from('vw_due_consumable_reminders_90').select('*').eq('company_id', companyId),
      supabase.from('vw_due_consumable_reminders_180').select('*').eq('company_id', companyId),
      supabase.from('vw_due_consumable_reminders_365').select('*').eq('company_id', companyId)
    ]);

    // Combine and deduplicate by consumable_code
    const allItems = [
      ...(res90.data || []).map(i => ({ ...i, urgency: '90_days' })),
      ...(res180.data || []).map(i => ({ ...i, urgency: '180_days' })),
      ...(res365.data || []).map(i => ({ ...i, urgency: '365_days' }))
    ];

    // Deduplicate (keep highest urgency)
    const itemsMap = new Map();
    allItems.forEach(item => {
      const existing = itemsMap.get(item.consumable_code);
      if (!existing || urgencyRank(item.urgency) < urgencyRank(existing.urgency)) {
        itemsMap.set(item.consumable_code, item);
      }
    });

    const items = Array.from(itemsMap.values()).sort((a, b) =>
      urgencyRank(a.urgency) - urgencyRank(b.urgency)
    );

    return NextResponse.json({ items });
  } catch (err) {
    console.error('[admin/companies/due-consumables] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch due items' }, { status: 500 });
  }
}

function urgencyRank(urgency: string): number {
  if (urgency === '90_days') return 1;
  if (urgency === '180_days') return 2;
  return 3;
}
