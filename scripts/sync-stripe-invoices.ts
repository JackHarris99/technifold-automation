/**
 * Sync Stripe invoice payment status to database
 * Finds invoices that are paid in Stripe but showing as unpaid in database
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncInvoices() {
  console.log('Fetching unpaid invoices from database...\n');

  // Get all unpaid invoices with Stripe IDs
  const { data: unpaidInvoices, error } = await supabase
    .from('invoices')
    .select('invoice_id, company_id, stripe_invoice_id, total_amount, status, payment_status')
    .eq('payment_status', 'unpaid')
    .not('stripe_invoice_id', 'is', null)
    .gte('invoice_date', '2026-01-20');

  if (error) {
    console.error('Database error:', error);
    return;
  }

  console.log(`Found ${unpaidInvoices?.length || 0} unpaid invoices in database\n`);

  if (!unpaidInvoices || unpaidInvoices.length === 0) {
    console.log('No unpaid invoices to sync');
    return;
  }

  let syncedCount = 0;
  let alreadyUnpaidCount = 0;

  for (const dbInvoice of unpaidInvoices) {
    try {
      // Fetch from Stripe
      const stripeInvoice = await stripe.invoices.retrieve(dbInvoice.stripe_invoice_id);

      console.log(`\n---`);
      console.log(`Invoice: ${dbInvoice.stripe_invoice_id}`);
      console.log(`Amount: £${dbInvoice.total_amount}`);
      console.log(`Database status: ${dbInvoice.payment_status}`);
      console.log(`Stripe status: ${stripeInvoice.status}`);
      console.log(`Stripe paid: ${stripeInvoice.paid ? 'YES' : 'NO'}`);

      // If paid in Stripe but not in database, sync it
      if (stripeInvoice.paid && dbInvoice.payment_status === 'unpaid') {
        console.log(`⚠️  MISMATCH DETECTED - Syncing to PAID...`);

        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            status: 'paid',
            payment_status: 'paid',
            paid_at: new Date(stripeInvoice.status_transitions.paid_at! * 1000).toISOString(),
          })
          .eq('invoice_id', dbInvoice.invoice_id);

        if (updateError) {
          console.error(`❌ Failed to update:`, updateError);
        } else {
          console.log(`✅ Successfully synced to PAID`);
          syncedCount++;

          // Get company info for notification
          const { data: company } = await supabase
            .from('companies')
            .select('company_name, account_owner')
            .eq('company_id', dbInvoice.company_id)
            .single();

          if (company) {
            console.log(`   Company: ${company.company_name}`);
            console.log(`   Sales Rep: ${company.account_owner || 'Unassigned'}`);
          }
        }
      } else if (!stripeInvoice.paid) {
        console.log(`✓ Correctly unpaid in both systems`);
        alreadyUnpaidCount++;
      } else {
        console.log(`✓ Already in sync`);
      }

    } catch (stripeError: any) {
      console.error(`❌ Stripe API error for ${dbInvoice.stripe_invoice_id}:`, stripeError.message);
    }
  }

  console.log(`\n\n=== SYNC COMPLETE ===`);
  console.log(`Total invoices checked: ${unpaidInvoices.length}`);
  console.log(`Synced to PAID: ${syncedCount}`);
  console.log(`Correctly unpaid: ${alreadyUnpaidCount}`);
  console.log(`Already in sync: ${unpaidInvoices.length - syncedCount - alreadyUnpaidCount}`);
}

syncInvoices().catch(console.error);
