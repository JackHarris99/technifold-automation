/**
 * POST /api/admin/product-catalogs/delete
 * Delete custom product catalog for a company (reverts to default)
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only directors can delete catalogs
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company_id } = body as { company_id: string };

    if (!company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Delete all catalog entries for this company
    const { error: deleteError } = await supabase
      .from('company_product_catalog')
      .delete()
      .eq('company_id', company_id);

    if (deleteError) {
      console.error('[product-catalogs-delete] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete catalog', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`[product-catalogs-delete] Deleted custom catalog for company ${company_id}`);

    return NextResponse.json({
      success: true,
      message: 'Custom catalog deleted. Company will now use default catalog.',
    });

  } catch (err: any) {
    console.error('[product-catalogs-delete] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
