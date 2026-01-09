/**
 * GET /api/admin/products/list?type=consumable&limit=100&offset=0&sort=category
 * List products with filtering, pagination, and sorting
 * Designed for browsing product catalogs in quote builders and invoice creator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Filters
  const typeParam = searchParams.get('type'); // tool, consumable, part, accessory
  const categoryParam = searchParams.get('category');
  const activeOnly = searchParams.get('active') !== 'false'; // default true

  // Pagination
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500); // max 500
  const offset = parseInt(searchParams.get('offset') || '0');

  // Sorting
  const sortBy = searchParams.get('sort') || 'category'; // category, description, price
  const sortOrder = searchParams.get('order') || 'asc'; // asc, desc

  const supabase = getSupabaseClient();

  // Build query
  let query = supabase
    .from('products')
    .select('product_code, description, price, currency, type, category, image_url, pricing_tier', { count: 'exact' });

  // Apply filters
  if (activeOnly) {
    query = query.eq('active', true);
  }

  if (typeParam) {
    query = query.eq('type', typeParam);
  }

  if (categoryParam) {
    query = query.eq('category', categoryParam);
  }

  // Apply sorting
  const sortColumn = sortBy === 'description' ? 'description' :
                     sortBy === 'price' ? 'price' : 'category';
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Secondary sort by description for consistent ordering within groups
  if (sortBy !== 'description') {
    query = query.order('description', { ascending: true });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[API] Product list error:', error);
    return NextResponse.json({
      error: 'Failed to load products',
      products: [],
      pagination: {
        total: 0,
        limit,
        offset,
        has_more: false
      }
    }, { status: 500 });
  }

  return NextResponse.json({
    products: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (offset + limit) < (count || 0)
    }
  });
}
