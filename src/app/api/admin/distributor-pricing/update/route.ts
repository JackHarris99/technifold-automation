/**
 * POST /api/admin/distributor-pricing/update
 * Update distributor pricing (upsert)
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';

interface PricingUpdate {
  product_code: string;
  tier: string;
  price: number;
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
        // If price is 0 or null, delete the tier pricing (fall back to standard)
        if (!item.price || item.price <= 0) {
          const { error: deleteError } = await supabase
            .from('distributor_pricing')
            .delete()
            .eq('product_code', item.product_code)
            .eq('tier', item.tier);

          if (deleteError) {
            console.error('[distributor-pricing-update] Delete error:', deleteError);
            errors++;
          } else {
            updated++;
          }
          continue;
        }

        // Upsert (insert or update)
        const { error: upsertError } = await supabase
          .from('distributor_pricing')
          .upsert({
            product_code: item.product_code,
            tier: item.tier,
            price: item.price,
            currency: item.currency || 'GBP',
            active: item.active !== false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'product_code,tier',
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
      message: `Updated ${updated} pricing records`,
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
