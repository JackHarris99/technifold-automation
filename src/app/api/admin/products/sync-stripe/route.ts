/**
 * POST /api/admin/products/sync-stripe
 * Sync products to Stripe for invoicing and quote automation
 * Creates Stripe products and prices for all products in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-client';
import { getSupabaseClient } from '@/lib/supabase';

interface SyncResult {
  product_code: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  stripe_product_id?: string;
  stripe_price_id?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Optional body params
    const body = await request.json().catch(() => ({}));
    const { product_codes, force_update = false } = body as {
      product_codes?: string[];
      force_update?: boolean;
    };

    // Fetch products to sync
    let query = supabase
      .from('products')
      .select('product_code, description, price, currency, type, category, stripe_product_id, stripe_price_id_default');

    if (product_codes && product_codes.length > 0) {
      query = query.in('product_code', product_codes);
    }

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch products', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        message: 'No products to sync',
        results: [],
      });
    }

    const results: SyncResult[] = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Skip if already has Stripe IDs and not forcing update
        if (product.stripe_product_id && product.stripe_price_id_default && !force_update) {
          results.push({
            product_code: product.product_code,
            status: 'skipped',
            stripe_product_id: product.stripe_product_id,
            stripe_price_id: product.stripe_price_id_default,
          });
          skipped++;
          continue;
        }

        // Skip products without a price
        if (!product.price || product.price <= 0) {
          results.push({
            product_code: product.product_code,
            status: 'skipped',
            error: 'No price set',
          });
          skipped++;
          continue;
        }

        let stripeProductId = product.stripe_product_id;
        let stripePriceId = product.stripe_price_id_default;
        let wasCreated = false;

        // Create or update Stripe product
        if (!stripeProductId) {
          // Create new Stripe product
          const stripeProduct = await stripe.products.create({
            name: product.description || product.product_code,
            metadata: {
              product_code: product.product_code,
              type: product.type || 'unknown',
              category: product.category || 'uncategorized',
            },
            active: true,
          });
          stripeProductId = stripeProduct.id;
          wasCreated = true;
        } else if (force_update) {
          // Update existing Stripe product
          await stripe.products.update(stripeProductId, {
            name: product.description || product.product_code,
            metadata: {
              product_code: product.product_code,
              type: product.type || 'unknown',
              category: product.category || 'uncategorized',
            },
          });
        }

        // Create new price (prices are immutable in Stripe, so we always create new ones if price changed)
        const currency = (product.currency || 'GBP').toLowerCase();
        const priceInCents = Math.round(product.price * 100);

        // Check if we need a new price
        let needsNewPrice = !stripePriceId || force_update;

        if (stripePriceId && force_update) {
          // Check if price amount changed
          try {
            const existingPrice = await stripe.prices.retrieve(stripePriceId);
            if (existingPrice.unit_amount !== priceInCents) {
              needsNewPrice = true;
              // Archive old price
              await stripe.prices.update(stripePriceId, { active: false });
            } else {
              needsNewPrice = false;
            }
          } catch {
            needsNewPrice = true;
          }
        }

        if (needsNewPrice) {
          const stripePrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: priceInCents,
            currency,
            metadata: {
              product_code: product.product_code,
            },
          });
          stripePriceId = stripePrice.id;
        }

        // Update database with Stripe IDs
        const { error: updateError } = await supabase
          .from('products')
          .update({
            stripe_product_id: stripeProductId,
            stripe_price_id_default: stripePriceId,
          })
          .eq('product_code', product.product_code);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        results.push({
          product_code: product.product_code,
          status: wasCreated ? 'created' : 'updated',
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
        });

        if (wasCreated) {
          created++;
        } else {
          updated++;
        }

      } catch (err) {
        console.error(`[sync-stripe] Error syncing ${product.product_code}:`, err);
        results.push({
          product_code: product.product_code,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        errors++;
      }
    }

    return NextResponse.json({
      message: `Sync complete: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`,
      summary: { created, updated, skipped, errors, total: products.length },
      results,
    });

  } catch (error) {
    console.error('[sync-stripe] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/products/sync-stripe
 * Get sync status - how many products need syncing
 */
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Count products by sync status
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('product_code, price, stripe_product_id, stripe_price_id_default');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    const total = allProducts?.length || 0;
    const synced = allProducts?.filter(p => p.stripe_product_id && p.stripe_price_id_default).length || 0;
    const unsynced = allProducts?.filter(p => !p.stripe_product_id || !p.stripe_price_id_default).length || 0;
    const noPriceSet = allProducts?.filter(p => !p.price || p.price <= 0).length || 0;
    const readyToSync = unsynced - noPriceSet;

    return NextResponse.json({
      total,
      synced,
      unsynced,
      noPriceSet,
      readyToSync,
      syncPercentage: total > 0 ? Math.round((synced / total) * 100) : 0,
    });

  } catch (error) {
    console.error('[sync-stripe] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
