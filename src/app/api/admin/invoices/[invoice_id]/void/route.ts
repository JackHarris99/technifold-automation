/**
 * POST /api/admin/invoices/[invoice_id]/void
 * Void an invoice via Stripe API and update local database
 * SECURITY: Directors and admins only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector, getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe-client';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ invoice_id: string }> }
) {
  try {
    // SECURITY: Only directors can void invoices
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
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
    const currentUser = await getCurrentUser();

    // Get invoice details
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        invoice_id,
        invoice_number,
        stripe_invoice_id,
        payment_status,
        total_amount,
        company_id,
        companies (
          company_name
        )
      `)
      .eq('invoice_id', invoice_id)
      .single();

    if (fetchError || !invoice) {
      console.error('[void-invoice] Invoice fetch error:', fetchError);
      console.error('[void-invoice] Invoice ID:', invoice_id);
      return NextResponse.json(
        { error: 'Invoice not found', details: fetchError?.message },
        { status: 404 }
      );
    }

    // Extract company name safely
    const companyName = (invoice.companies as any)?.company_name || 'Unknown Company';

    // Check if already voided
    if (invoice.payment_status === 'void') {
      return NextResponse.json(
        { error: 'Invoice is already voided' },
        { status: 400 }
      );
    }

    // Check if invoice has been paid
    if (invoice.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot void a paid invoice. Issue a refund instead.' },
        { status: 400 }
      );
    }

    // Check if invoice has a stripe_invoice_id
    if (!invoice.stripe_invoice_id) {
      return NextResponse.json(
        { error: 'Invoice does not have a Stripe invoice ID. Cannot void via Stripe.' },
        { status: 400 }
      );
    }

    // Fetch current status from Stripe to verify it's voidable
    console.log(`[void-invoice] Fetching invoice status from Stripe: ${invoice.stripe_invoice_id}`);
    let stripeInvoice;
    try {
      stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
      console.log(`[void-invoice] Stripe invoice status: ${stripeInvoice.status}`);
    } catch (stripeError: any) {
      console.error('[void-invoice] Failed to retrieve invoice from Stripe:', stripeError);
      return NextResponse.json(
        {
          error: 'Failed to retrieve invoice from Stripe',
          details: stripeError.message,
        },
        { status: 500 }
      );
    }

    // Check if invoice is in a voidable state (only "open" invoices can be voided)
    if (stripeInvoice.status !== 'open') {
      console.error(`[void-invoice] Invoice status is "${stripeInvoice.status}", not "open". Cannot void.`);
      return NextResponse.json(
        {
          error: `Cannot void invoice with status "${stripeInvoice.status}". Only "open" invoices can be voided.`,
          details: stripeInvoice.status === 'paid'
            ? 'This invoice has been paid. Issue a refund instead.'
            : stripeInvoice.status === 'void'
            ? 'This invoice is already voided.'
            : stripeInvoice.status === 'draft'
            ? 'This invoice is still a draft. Delete or finalize it first.'
            : `Invoice status: ${stripeInvoice.status}`,
        },
        { status: 400 }
      );
    }

    // Void the invoice in Stripe
    console.log(`[void-invoice] Calling Stripe API to void invoice: ${invoice.stripe_invoice_id}`);
    try {
      await stripe.invoices.voidInvoice(invoice.stripe_invoice_id);
      console.log(`[void-invoice] Stripe invoice voided successfully: ${invoice.stripe_invoice_id}`);
    } catch (stripeError: any) {
      console.error('[void-invoice] Stripe API error:', stripeError);
      console.error('[void-invoice] Stripe error type:', stripeError.type);
      console.error('[void-invoice] Stripe error code:', stripeError.code);
      console.error('[void-invoice] Stripe error message:', stripeError.message);
      return NextResponse.json(
        {
          error: 'Failed to void invoice in Stripe',
          details: stripeError.message,
          stripe_error_type: stripeError.type,
        },
        { status: 500 }
      );
    }

    // Update local database (both invoices and orders tables)
    const { error: updateInvoiceError } = await supabase
      .from('invoices')
      .update({
        payment_status: 'void',
        status: 'void',
        voided_at: new Date().toISOString(),
      })
      .eq('invoice_id', invoice_id);

    if (updateInvoiceError) {
      console.error('[void-invoice] Failed to update invoices table:', updateInvoiceError);
      // Continue - webhook will fix this
    } else {
      console.log(`[void-invoice] Invoice ${invoice_id} updated in database`);
    }

    // Also update orders table if exists (legacy compatibility)
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        invoice_status: 'void',
        invoice_voided_at: new Date().toISOString(),
      })
      .eq('stripe_invoice_id', invoice.stripe_invoice_id);

    if (updateOrderError) {
      console.error('[void-invoice] Failed to update orders table:', updateOrderError);
      // Non-critical - may not have corresponding order
    }

    // Log the action
    if (currentUser) {
      const logResult = await supabase.from('activity_log').insert({
        user_id: currentUser.user_id,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        action_type: 'invoice_voided',
        entity_type: 'invoice',
        entity_id: invoice_id,
        description: `Voided invoice ${invoice.invoice_number || invoice_id.slice(0, 8)} for ${companyName} (£${invoice.total_amount})`,
        metadata: {
          stripe_invoice_id: invoice.stripe_invoice_id,
          company_id: invoice.company_id,
          amount: invoice.total_amount,
        },
      });

      if (logResult.error) {
        console.error('[void-invoice] Failed to log activity:', logResult.error);
        // Non-critical, continue
      }
    }

    console.log(`[void-invoice] Invoice ${invoice_id} voided by ${currentUser?.full_name}`);

    return NextResponse.json({
      success: true,
      message: 'Invoice voided successfully',
      invoice_id,
      stripe_invoice_id: invoice.stripe_invoice_id,
    });

  } catch (err: any) {
    console.error('[void-invoice] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
