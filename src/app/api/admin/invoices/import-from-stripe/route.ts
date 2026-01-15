/**
 * POST /api/admin/invoices/import-from-stripe
 * Import invoices from Stripe that don't exist in local database
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { stripe } from '@/lib/stripe-client';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only directors can import invoices
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    console.log('[import-from-stripe] Starting invoice import from Stripe');

    // Get all existing stripe_invoice_ids to check for duplicates
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('stripe_invoice_id')
      .not('stripe_invoice_id', 'is', null);

    const existingStripeIds = new Set(
      (existingInvoices || []).map(inv => inv.stripe_invoice_id)
    );

    console.log(`[import-from-stripe] Found ${existingStripeIds.size} existing invoices in database`);

    // Fetch invoices from Stripe (paginated)
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    let totalFetched = 0;
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const importedInvoices: any[] = [];

    while (hasMore) {
      const stripeInvoices = await stripe.invoices.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['data.customer', 'data.lines'],
      });

      totalFetched += stripeInvoices.data.length;
      console.log(`[import-from-stripe] Fetched ${stripeInvoices.data.length} invoices from Stripe (total: ${totalFetched})`);

      for (const stripeInvoice of stripeInvoices.data) {
        try {
          // Skip if already exists
          if (existingStripeIds.has(stripeInvoice.id)) {
            skipped++;
            continue;
          }

          // Skip draft invoices
          if (stripeInvoice.status === 'draft') {
            skipped++;
            continue;
          }

          // Find company by Stripe customer ID
          const customerId = typeof stripeInvoice.customer === 'string'
            ? stripeInvoice.customer
            : stripeInvoice.customer?.id;

          if (!customerId) {
            console.error(`[import-from-stripe] Invoice ${stripeInvoice.id} has no customer`);
            errors++;
            continue;
          }

          const { data: company } = await supabase
            .from('companies')
            .select('company_id, company_name')
            .eq('stripe_customer_id', customerId)
            .single();

          if (!company) {
            console.error(`[import-from-stripe] No company found for customer ${customerId} (invoice ${stripeInvoice.id})`);
            errors++;
            continue;
          }

          // Map Stripe status to our payment_status
          let paymentStatus = 'unpaid';
          if (stripeInvoice.status === 'paid') {
            paymentStatus = 'paid';
          } else if (stripeInvoice.status === 'void' || stripeInvoice.status === 'uncollectible') {
            paymentStatus = 'void';
          } else if (stripeInvoice.status === 'open') {
            paymentStatus = 'unpaid';
          }

          // Create invoice record
          const invoiceData = {
            company_id: company.company_id,
            stripe_invoice_id: stripeInvoice.id,
            invoice_number: stripeInvoice.number,
            invoice_date: new Date(stripeInvoice.created * 1000).toISOString(),
            due_date: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000).toISOString() : null,
            subtotal: (stripeInvoice.subtotal || 0) / 100,
            tax: (stripeInvoice.tax || 0) / 100,
            total_amount: (stripeInvoice.total || 0) / 100,
            amount_due: (stripeInvoice.amount_due || 0) / 100,
            amount_paid: (stripeInvoice.amount_paid || 0) / 100,
            currency: stripeInvoice.currency?.toUpperCase() || 'GBP',
            payment_status: paymentStatus,
            status: stripeInvoice.status,
            invoice_url: stripeInvoice.hosted_invoice_url,
            invoice_pdf: stripeInvoice.invoice_pdf,
            paid_at: stripeInvoice.status_transitions?.paid_at
              ? new Date(stripeInvoice.status_transitions.paid_at * 1000).toISOString()
              : null,
            voided_at: stripeInvoice.status === 'void' ? new Date().toISOString() : null,
          };

          const { data: newInvoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert(invoiceData)
            .select('invoice_id')
            .single();

          if (invoiceError) {
            console.error(`[import-from-stripe] Failed to insert invoice ${stripeInvoice.id}:`, invoiceError);
            errors++;
            continue;
          }

          // Import line items
          if (stripeInvoice.lines && stripeInvoice.lines.data.length > 0) {
            const lineItems = stripeInvoice.lines.data.map((line, index) => ({
              invoice_id: newInvoice.invoice_id,
              product_code: line.price?.product as string || null,
              description: line.description,
              quantity: line.quantity || 0,
              unit_price: (line.price?.unit_amount || 0) / 100,
              line_total: (line.amount || 0) / 100,
              currency: line.currency?.toUpperCase() || 'GBP',
              line_order: index + 1,
            }));

            const { error: itemsError } = await supabase
              .from('invoice_items')
              .insert(lineItems);

            if (itemsError) {
              console.error(`[import-from-stripe] Failed to insert line items for invoice ${stripeInvoice.id}:`, itemsError);
              // Non-critical - invoice already created
            }
          }

          imported++;
          importedInvoices.push({
            stripe_invoice_id: stripeInvoice.id,
            invoice_number: stripeInvoice.number,
            company_name: company.company_name,
            total: invoiceData.total_amount,
            status: paymentStatus,
          });

          console.log(`[import-from-stripe] Imported invoice ${stripeInvoice.number} for ${company.company_name}`);

        } catch (err: any) {
          console.error(`[import-from-stripe] Error processing invoice ${stripeInvoice.id}:`, err.message);
          errors++;
        }
      }

      hasMore = stripeInvoices.has_more;
      if (hasMore && stripeInvoices.data.length > 0) {
        startingAfter = stripeInvoices.data[stripeInvoices.data.length - 1].id;
      }

      // Rate limit protection
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[import-from-stripe] Completed: ${imported} imported, ${skipped} skipped, ${errors} errors out of ${totalFetched} total`);

    return NextResponse.json({
      success: true,
      message: `Processed ${totalFetched} invoices from Stripe`,
      total: totalFetched,
      imported,
      skipped,
      errors,
      invoices: importedInvoices.slice(0, 20), // Return first 20 imported for display
    });

  } catch (err: any) {
    console.error('[import-from-stripe] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
