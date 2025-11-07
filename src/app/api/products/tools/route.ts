/**
 * GET /api/products/tools
 * Get all tools for admin multi-select
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('product_code, description, category')
    .eq('type', 'tool')
    .eq('active', true)
    .order('description');

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json({ tools: data || [] });
}
