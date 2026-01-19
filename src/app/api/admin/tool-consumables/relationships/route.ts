/**
 * GET /api/admin/tool-consumables/relationships
 * Returns all tool-consumable relationships for coverage dashboard
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: relationships, error } = await supabase
      .from('tool_consumable_map')
      .select('tool_code, consumable_code')
      .order('tool_code');

    if (error) {
      console.error('[tool-consumables/relationships] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ relationships: relationships || [] });
  } catch (error) {
    console.error('[tool-consumables/relationships] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
