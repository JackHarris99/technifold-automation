/**
 * POST /api/admin/distributor-pricing/update
 * Update distributor pricing (column-based structure)
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';

interface PricingUpdate {
  product_code: string;
  standard_price?: number | null;
  gold_price?: number | null;
  currency: string;
  active: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only directors can update distributor pricing
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { pricing } = body as { pricing: PricingUpdate[] };

    if (!pricing || !Array.isArray(pricing) || pricing.length === 0) {
      return NextResponse.json(
        { error: 'No pricing updates provided' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    let updated = 0;
    let errors = 0;

    for (const item of pricing) {
      try {
        // Upsert (insert or update) - single row per product with tier columns
        const { error: upsertError } = await supabase
          .from('distributor_pricing')
          .upsert({
            product_code: item.product_code,
            standard_price: item.standard_price ?? null,
            gold_price: item.gold_price ?? null,
            currency: item.currency || 'GBP',
            active: item.active !== false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'product_code',
          });

        if (upsertError) {
          console.error('[distributor-pricing-update] Upsert error:', upsertError);
          errors++;
        } else {
          updated++;
        }
      } catch (err: any) {
        console.error('[distributor-pricing-update] Error processing item:', err);
        errors++;
      }
    }

    console.log(`[distributor-pricing-update] Completed: ${updated} updated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} product${updated !== 1 ? 's' : ''}`,
      updated,
      errors,
    });

  } catch (err: any) {
    console.error('[distributor-pricing-update] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
