/**
 * GET /api/machines/all
 * Get all machines for cascading selects
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('machines')
      .select('machine_id, brand, model, display_name, slug, type')
      .order('brand, model')
      .limit(2000);

    if (error) {
      console.error('[machines/all] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
    }

    return NextResponse.json({ machines: data || [] });
  } catch (err) {
    console.error('[machines/all] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
