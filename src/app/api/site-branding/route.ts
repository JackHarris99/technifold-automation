/**
 * GET /api/site-branding
 * Get all site branding logos
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('site_branding')
    .select('*')
    .order('brand_key');

  if (error) {
    console.error('[site-branding] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json({ brands: data || [] });
}
