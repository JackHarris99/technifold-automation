/**
 * GET /api/machines/by-brand?brand=XYZ
 * Returns machines for a specific brand
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand');

    if (!brand) {
      return NextResponse.json({ error: 'Brand parameter required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('machines')
      .select('machine_id, brand, model, display_name, slug')
      .eq('brand', brand)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('[machines/by-brand] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
    }

    return NextResponse.json({ machines: data || [] });
  } catch (err) {
    console.error('[machines/by-brand] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
