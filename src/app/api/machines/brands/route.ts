/**
 * GET /api/machines/brands
 * Returns distinct machine brands for public machine finder
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Get distinct brands, ordered alphabetically
    const { data, error } = await supabase
      .from('machines')
      .select('brand')
      .order('brand', { ascending: true })
      .limit(2000);

    if (error) {
      console.error('[machines/brands] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }

    // Extract unique brands
    const brands = [...new Set(data?.map(m => m.brand).filter(Boolean))];

    return NextResponse.json({ brands });
  } catch (err) {
    console.error('[machines/brands] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
