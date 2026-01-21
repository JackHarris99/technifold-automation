/**
 * POST /api/admin/invoices/sync-stripe-product-history
 * One-time script to:
 * 1. Re-import line items for existing Stripe invoices (that are missing them)
 * 2. Manually trigger product history sync for all paid Stripe invoices
 * This populates company_product_history, company_consumables, and company_tools
 * Directors only
 */

export const maxDuration = 300; // 5 minutes for this endpoint
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { stripe } from '@/lib/stripe-client';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only directors can run this
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    console.log('[sync-stripe-product-history] Starting Stripe invoice line items import and sync');

    // Find all Stripe invoices
    const { data: stripeInvoices, error: fetchError } = await supabase
      .from('invoices')
      .select('invoice_id, stripe_invoice_id, company_id, invoice_date, payment_status')
      .eq('invoice_type', 'stripe')
      .not('stripe_invoice_id', 'is', null)
      .limit(500);

    if (fetchError) {
      console.error('[sync-stripe-product-history] Failed to fetch invoices:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch invoices from database' },
        { status: 500 }
      );
    }

    if (!stripeInvoices || stripeInvoices.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No Stripe invoices found',
        line_items_imported: 0,
        product_history_synced: 0,
      });
    }

    console.log(`[sync-stripe-product-history] Found ${stripeInvoices.length} Stripe invoices`);

    let lineItemsImported = 0;
    let lineItemsSkipped = 0;
    let productHistorySynced = 0;
    let errors = 0;

    for (const invoice of stripeInvoices) {
      try {
        // Check if line items already exist and if they need fixing
        const { data: existingItems, error: checkError } = await supabase
          .from('invoice_items')
          .select('line_number, product_code, description')
          .eq('invoice_id', invoice.invoice_id);

        if (checkError) {
          console.error(`[sync-stripe-product-history] Error checking items for invoice ${invoice.invoice_id}:`, checkError);
          errors++;
          continue;
        }

        // Check if items need re-import:
        // 1. No items exist, OR
        // 2. Items have NULL line_number (broken), OR
        // 3. Items have extractable product codes in descriptions but product_code is NULL
        const needsReimport = !existingItems || existingItems.length === 0 ||
          existingItems.some(item => item.line_number === null ||
            (item.product_code === null && (item.description?.includes(' - ') || item.description?.match(/^[A-Z0-9-]+$/i))));

        // If line items exist and look good, skip re-import
        if (!needsReimport) {
          lineItemsSkipped++;

          // But still sync to product history if paid
          if (invoice.payment_status === 'paid') {
            await syncInvoiceToProductHistory(supabase, invoice.invoice_id, invoice.company_id, invoice.invoice_date);
            productHistorySynced++;
          }
          continue;
        }

        // Fetch line items from Stripe
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id!, {
          expand: ['lines'],
        });

        if (!stripeInvoice.lines || stripeInvoice.lines.data.length === 0) {
          console.log(`[sync-stripe-product-history] Invoice ${invoice.stripe_invoice_id} has no line items in Stripe`);
          continue;
        }

        // Delete existing broken items (all NULL)
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.invoice_id);

        // Import line items with smart product code extraction
        const lineItems = await Promise.all(stripeInvoice.lines.data.map(async (line, index) => {
          const description = line.description || `Stripe product: ${line.price?.product}` || 'Stripe subscription';

          // Try to extract product code from description
          let extractedProductCode: string | null = null;

          // Method 1: Check if description starts with "CODE - Description" format
          if (description.includes(' - ')) {
            const potentialCode = description.split(' - ')[0].trim();

            // Check if this matches a product (case-insensitive)
            const { data: matchedProduct } = await supabase
              .from('products')
              .select('product_code')
              .ilike('product_code', potentialCode)
              .single();

            if (matchedProduct) {
              extractedProductCode = matchedProduct.product_code; // Use correct capitalization
            }
          }

          // Method 2: Check if the entire description is just a product code (case-insensitive)
          if (!extractedProductCode) {
            const { data: matchedProduct } = await supabase
              .from('products')
              .select('product_code')
              .ilike('product_code', description.trim())
              .single();

            if (matchedProduct) {
              extractedProductCode = matchedProduct.product_code; // Use correct capitalization
            }
          }

          return {
            invoice_id: invoice.invoice_id,
            product_code: extractedProductCode,
            line_number: index + 1,
            description: description,
            quantity: line.quantity || 1,
            unit_price: (line.price?.unit_amount || 0) / 100,
            line_total: (line.amount || 0) / 100,
          };
        }));

        const { error: insertError } = await supabase
          .from('invoice_items')
          .insert(lineItems);

        if (insertError) {
          console.error(`[sync-stripe-product-history] Failed to insert line items for ${invoice.invoice_id}:`, insertError);
          errors++;
          continue;
        }

        lineItemsImported++;

        // Sync to product history if paid
        if (invoice.payment_status === 'paid') {
          await syncInvoiceToProductHistory(supabase, invoice.invoice_id, invoice.company_id, invoice.invoice_date);
          productHistorySynced++;
        }

        // Rate limit protection
        if (stripeInvoices.indexOf(invoice) % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (err: any) {
        console.error(`[sync-stripe-product-history] Error processing invoice ${invoice.invoice_id}:`, err.message);
        errors++;
      }
    }

    console.log(`[sync-stripe-product-history] ===== SYNC SUMMARY =====`);
    console.log(`[sync-stripe-product-history] Total Stripe invoices: ${stripeInvoices.length}`);
    console.log(`[sync-stripe-product-history] Line items imported: ${lineItemsImported}`);
    console.log(`[sync-stripe-product-history] Line items skipped (already exist): ${lineItemsSkipped}`);
    console.log(`[sync-stripe-product-history] Product history synced: ${productHistorySynced}`);
    console.log(`[sync-stripe-product-history] Errors: ${errors}`);
    console.log(`[sync-stripe-product-history] ===========================`);

    return NextResponse.json({
      success: true,
      message: `Processed ${stripeInvoices.length} Stripe invoices. ${lineItemsImported} line items imported, ${productHistorySynced} synced to product history.`,
      total_invoices: stripeInvoices.length,
      line_items_imported: lineItemsImported,
      line_items_skipped: lineItemsSkipped,
      product_history_synced: productHistorySynced,
      errors,
    });

  } catch (err: any) {
    console.error('[sync-stripe-product-history] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * Manually trigger product history sync for an invoice
 * Replicates the logic from sync_invoice_to_product_history trigger
 */
async function syncInvoiceToProductHistory(
  supabase: any,
  invoiceId: string,
  companyId: string,
  invoiceDate: string
) {
  // Get all line items with product codes
  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select(`
      product_code,
      quantity,
      products (
        product_code,
        type
      )
    `)
    .eq('invoice_id', invoiceId)
    .not('product_code', 'is', null); // Skip items without product codes

  if (itemsError || !items || items.length === 0) {
    return; // No items to sync (all NULL product_codes)
  }

  // Upsert each item into company_product_history
  for (const item of items) {
    const productType = item.products?.type || 'other';

    const { error: upsertError } = await supabase.rpc('upsert_company_product_history', {
      p_company_id: companyId,
      p_product_code: item.product_code,
      p_product_type: productType,
      p_purchase_date: invoiceDate,
      p_quantity: item.quantity,
    });

    if (upsertError) {
      console.error(`[sync] Failed to upsert product history for ${item.product_code}:`, upsertError);
    }
  }
}
