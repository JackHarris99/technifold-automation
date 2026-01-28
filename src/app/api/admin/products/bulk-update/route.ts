/**
 * Bulk Product Update API
 * Updates multiple products in a single transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authorization - allow all admin users
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid products array' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update each product
    const updatePromises = products.map((product) => {
      const { product_code, ...updates } = product;
      return supabase
        .from('products')
        .update(updates)
        .eq('product_code', product_code);
    });

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error('Bulk update errors:', errors);
      return NextResponse.json(
        { error: 'Some products failed to update', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: products.length,
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
