/**
 * GET /api/machines/all
 * Get all machines for admin dropdowns
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('machines')
    .select('machine_id, brand, model, display_name, type, slug')
    .order('display_name');

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json({ machines: data || [] });
}
