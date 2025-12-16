/**
 * GET /api/products/tools
 * Get all tools for admin multi-select
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  const supabase = getSupabaseClient();

  let query = supabase
    .from('products')
    .select('product_code, description, category')
    .eq('type', 'tool')
    .eq('active', true)
    .order('description')
    .limit(100); // Reasonable limit

  // Add search filter if provided
  if (search) {
    query = query.or(`description.ilike.*${search}*,product_code.ilike.*${search}*`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json({ tools: data || [] });
}
