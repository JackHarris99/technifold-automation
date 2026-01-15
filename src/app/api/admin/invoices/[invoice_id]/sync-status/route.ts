/**
 * POST /api/admin/invoices/[invoice_id]/sync-status
 * Sync invoice status from Stripe to local database
 * Shows current Stripe status and updates local DB if needed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe-client';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ invoice_id: string }> }
) {
  try {
    // SECURITY: Require authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { invoice_id } = await context.params;

    if (!invoice_id) {
      return NextResponse.json(
        { error: 'invoice_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get invoice from database
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('invoice_id, stripe_invoice_id, payment_status, status')
      .eq('invoice_id', invoice_id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (!invoice.stripe_invoice_id) {
      return NextResponse.json(
        {
          error: 'Invoice has no Stripe invoice ID',
          local_status: invoice.payment_status,
          stripe_status: null,
          in_sync: true, // No Stripe invoice to compare with
        }
      );
    }

    // Fetch from Stripe
    let stripeInvoice;
    try {
      stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
    } catch (stripeError: any) {
      return NextResponse.json(
        {
          error: 'Failed to retrieve invoice from Stripe',
          details: stripeError.message,
          local_status: invoice.payment_status,
        },
        { status: 500 }
      );
    }

    // Map Stripe status to our payment_status
    let mappedStatus = 'unpaid';
    if (stripeInvoice.status === 'paid') {
      mappedStatus = 'paid';
    } else if (stripeInvoice.status === 'void') {
      mappedStatus = 'void';
    } else if (stripeInvoice.status === 'uncollectible') {
      mappedStatus = 'void'; // Treat uncollectible as void
    } else if (stripeInvoice.status === 'open') {
      mappedStatus = 'unpaid';
    } else if (stripeInvoice.status === 'draft') {
      mappedStatus = 'unpaid'; // Draft invoices are unpaid
    }

    const inSync = invoice.payment_status === mappedStatus;

    // If not in sync, update database
    let updated = false;
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
        .eq('invoice_id', invoice_id);

      if (updateError) {
        console.error('[sync-status] Failed to update invoice:', updateError);
      } else {
        updated = true;
        console.log(`[sync-status] Synced invoice ${invoice_id}: ${invoice.payment_status} → ${mappedStatus}`);
      }
    }

    return NextResponse.json({
      success: true,
      invoice_id,
      local_status_before: invoice.payment_status,
      local_status_after: updated ? mappedStatus : invoice.payment_status,
      stripe_status: stripeInvoice.status,
      in_sync: updated ? true : inSync,
      updated,
      stripe_invoice_id: invoice.stripe_invoice_id,
    });

  } catch (err: any) {
    console.error('[sync-status] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
