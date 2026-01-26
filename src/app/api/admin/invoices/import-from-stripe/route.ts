/**
 * POST /api/admin/invoices/import-from-stripe
 * Import invoices from Stripe that don't exist in local database
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
      console.log(`[import-from-stripe] Fetched batch of ${stripeInvoices.data.length} invoices (total so far: ${totalFetched}, imported: ${imported}, skipped: ${skipped}, errors: ${errors})`);

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

          let company = null;
          let customerEmail: string | null = null;

          // Try to find company by stripe_customer_id first
          const { data: companyByStripeId } = await supabase
            .from('companies')
            .select('company_id, company_name')
            .eq('stripe_customer_id', customerId)
            .single();

          if (companyByStripeId) {
            company = companyByStripeId;
          } else {
            // If no company found by stripe_customer_id, try to match by customer email
            // This helps recover invoices for customers that aren't linked yet
            customerEmail = typeof stripeInvoice.customer === 'string'
              ? (await stripe.customers.retrieve(stripeInvoice.customer)).email || null
              : stripeInvoice.customer?.email || null;

            if (customerEmail) {
              const { data: companyByEmail } = await supabase
                .from('companies')
                .select('company_id, company_name, contacts!inner(email)')
                .eq('contacts.email', customerEmail)
                .limit(1)
                .single();

              if (companyByEmail) {
                company = companyByEmail;
                console.log(`[import-from-stripe] Matched company via contact email: ${customerEmail} -> ${companyByEmail.company_name}`);

                // Auto-link the stripe_customer_id for future efficiency
                await supabase
                  .from('companies')
                  .update({ stripe_customer_id: customerId })
                  .eq('company_id', companyByEmail.company_id);

                console.log(`[import-from-stripe] Auto-linked stripe_customer_id ${customerId} to company ${companyByEmail.company_name}`);
              }
            }
          }

          if (!company) {
            console.error(`[import-from-stripe] No company found for customer ${customerId} (invoice ${stripeInvoice.id}). Customer email: ${customerEmail || 'N/A'}`);
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

          // Create invoice record - INSERT AS UNPAID FIRST to avoid trigger race condition
          const invoiceData = {
            company_id: company.company_id,
            stripe_invoice_id: stripeInvoice.id,
            stripe_customer_id: customerId,
            stripe_payment_intent_id: stripeInvoice.payment_intent as string || null,
            invoice_number: stripeInvoice.number,
            invoice_type: 'stripe',
            invoice_date: new Date(stripeInvoice.created * 1000).toISOString(),
            due_date: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000).toISOString() : null,
            subtotal: (stripeInvoice.subtotal || 0) / 100,
            tax_amount: (stripeInvoice.tax || 0) / 100,
            shipping_amount: 0,
            total_amount: (stripeInvoice.total || 0) / 100,
            currency: stripeInvoice.currency?.toUpperCase() || 'GBP',
            payment_status: 'unpaid', // Temporarily unpaid - will update after items inserted
            status: stripeInvoice.status,
            invoice_url: stripeInvoice.hosted_invoice_url,
            invoice_pdf_url: stripeInvoice.invoice_pdf,
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

          // Import line items with smart product code extraction
          if (stripeInvoice.lines && stripeInvoice.lines.data.length > 0) {
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
                invoice_id: newInvoice.invoice_id,
                product_code: extractedProductCode,
                line_number: index + 1,
                description: description,
                quantity: line.quantity || 1,
                unit_price: (line.price?.unit_amount || 0) / 100,
                line_total: (line.amount || 0) / 100,
              };
            }));

            const { error: itemsError } = await supabase
              .from('invoice_items')
              .insert(lineItems);

            if (itemsError) {
              console.error(`[import-from-stripe] Failed to insert line items for invoice ${stripeInvoice.id}:`, itemsError);
              // Non-critical - invoice already created
            }
          }

          // Now update invoice to correct payment_status - this triggers product history sync
          if (paymentStatus !== 'unpaid') {
            const { error: updateError } = await supabase
              .from('invoices')
              .update({
                payment_status: paymentStatus, // Update to actual status (paid/void)
              })
              .eq('invoice_id', newInvoice.invoice_id);

            if (updateError) {
              console.error(`[import-from-stripe] Failed to update payment status for invoice ${stripeInvoice.id}:`, updateError);
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

    console.log(`[import-from-stripe] ===== IMPORT SUMMARY =====`);
    console.log(`[import-from-stripe] Total fetched from Stripe: ${totalFetched}`);
    console.log(`[import-from-stripe] Successfully imported: ${imported}`);
    console.log(`[import-from-stripe] Skipped (already exist or draft): ${skipped}`);
    console.log(`[import-from-stripe] Errors (no company match): ${errors}`);
    console.log(`[import-from-stripe] ===========================`);

    return NextResponse.json({
      success: true,
      message: `Processed ${totalFetched} invoices from Stripe. ${imported} imported, ${skipped} skipped, ${errors} errors.`,
      total: totalFetched,
      imported,
      skipped,
      errors,
      invoices: importedInvoices.slice(0, 20), // Return first 20 imported for display
      summary: {
        message: errors > 0
          ? `${errors} invoices could not be imported because no matching company was found. Check server logs for customer IDs.`
          : 'All invoices processed successfully.',
      },
    });

  } catch (err: any) {
    console.error('[import-from-stripe] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
