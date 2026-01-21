/**
 * POST /api/admin/invoices/bulk-sync
 * Sync all invoice statuses from Stripe to local database
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
    // SECURITY: Only directors can bulk sync
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch all invoices with Stripe IDs
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select('invoice_id, stripe_invoice_id, payment_status')
      .not('stripe_invoice_id', 'is', null)
      .limit(500); // Process up to 500 invoices

    if (fetchError) {
      console.error('[bulk-sync] Failed to fetch invoices:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch invoices from database' },
        { status: 500 }
      );
    }

    if (!invoices || invoices.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No invoices to sync',
        total: 0,
        updated: 0,
        errors: 0,
      });
    }

    console.log(`[bulk-sync] Starting sync for ${invoices.length} invoices`);

    let updated = 0;
    let errors = 0;
    const results: any[] = [];

    // Process in batches to avoid rate limits
    for (const invoice of invoices) {
      try {
        // Fetch from Stripe
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id!);

        // Map Stripe status to our payment_status
        let mappedStatus = 'unpaid';
        if (stripeInvoice.status === 'paid') {
          mappedStatus = 'paid';
        } else if (stripeInvoice.status === 'void' || stripeInvoice.status === 'uncollectible') {
          mappedStatus = 'void';
        } else if (stripeInvoice.status === 'open' || stripeInvoice.status === 'draft') {
          mappedStatus = 'unpaid';
        }

        const inSync = invoice.payment_status === mappedStatus;

        // If not in sync, update database
        if (!inSync) {
          const updateData: any = {
            payment_status: mappedStatus,
            status: stripeInvoice.status,
          };

          if (stripeInvoice.status === 'void') {
            updateData.voided_at = new Date().toISOString();
          } else if (stripeInvoice.status === 'paid') {
            updateData.paid_at = stripeInvoice.status_transitions.paid_at
              ? new Date(stripeInvoice.status_transitions.paid_at * 1000).toISOString()
              : new Date().toISOString();
          }

          const { error: updateError } = await supabase
            .from('invoices')
            .update(updateData)
            .eq('invoice_id', invoice.invoice_id);

          if (updateError) {
            console.error(`[bulk-sync] Failed to update invoice ${invoice.invoice_id}:`, updateError);
            errors++;
          } else {
            updated++;
            results.push({
              invoice_id: invoice.invoice_id,
              stripe_invoice_id: invoice.stripe_invoice_id,
              old_status: invoice.payment_status,
              new_status: mappedStatus,
            });
          }
        }
      } catch (stripeError: any) {
        console.error(`[bulk-sync] Stripe error for invoice ${invoice.invoice_id}:`, stripeError.message);
        errors++;
      }

      // Small delay to avoid rate limits (Stripe allows 100 req/sec)
      if (invoices.indexOf(invoice) % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[bulk-sync] Completed: ${updated} updated, ${errors} errors out of ${invoices.length} total`);

    return NextResponse.json({
      success: true,
      message: `Synced ${invoices.length} invoices`,
      total: invoices.length,
      updated,
      errors,
      results: results.slice(0, 20), // Return first 20 changes for display
    });

  } catch (err: any) {
    console.error('[bulk-sync] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
