#!/usr/bin/env tsx
/**
 * Import historical paid Stripe invoices into Supabase
 * This syncs invoices that were created/paid outside the system
 *
 * Usage: tsx scripts/import-stripe-invoices.ts [--dry-run] [--since=2024-01-01]
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ImportStats {
  total_stripe_invoices: number;
  already_imported: number;
  no_matching_company: number;
  no_product_mapping: number;
  successfully_imported: number;
  errors: number;
}

const stats: ImportStats = {
  total_stripe_invoices: 0,
  already_imported: 0,
  no_matching_company: 0,
  no_product_mapping: 0,
  successfully_imported: 0,
  errors: 0,
};

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const sinceArg = args.find(arg => arg.startsWith('--since='));
const since = sinceArg ? new Date(sinceArg.split('=')[1]).getTime() / 1000 : undefined;

console.log('🔍 Starting Stripe invoice import...');
if (dryRun) console.log('📋 DRY RUN MODE - No data will be written\n');
if (since) console.log(`📅 Importing invoices since: ${new Date(since * 1000).toISOString()}\n`);

/**
 * Map Stripe product/price to internal product_code
 * You'll need to customize this based on your product mapping
 */
async function mapStripeProductToCode(
  stripeProductId: string | null,
  stripePriceId: string | null,
  description: string | null
): Promise<string | null> {
  // Strategy 1: Check if product_code is stored in Stripe product metadata
  if (stripeProductId) {
    try {
      const product = await stripe.products.retrieve(stripeProductId);
      if (product.metadata?.product_code) {
        return product.metadata.product_code;
      }
    } catch (err) {
      console.warn(`Failed to fetch Stripe product ${stripeProductId}`);
    }
  }

  // Strategy 2: Match by description
  // You may need to implement custom matching logic here
  if (description) {
    const { data: products } = await supabase
      .from('products')
      .select('product_code, description')
      .ilike('description', `%${description}%`)
      .limit(1);

    if (products && products.length > 0) {
      return products[0].product_code;
    }
  }

  // Strategy 3: Fallback - log for manual mapping
  console.warn(`⚠️  No mapping found for Stripe product: ${stripeProductId} | Price: ${stripePriceId} | Description: ${description}`);
  return null;
}

async function importStripeInvoice(stripeInvoice: Stripe.Invoice) {
  stats.total_stripe_invoices++;

  const stripeCustomerId = typeof stripeInvoice.customer === 'string'
    ? stripeInvoice.customer
    : stripeInvoice.customer?.id;

  if (!stripeCustomerId) {
    console.log(`❌ Invoice ${stripeInvoice.id}: No customer ID`);
    stats.errors++;
    return;
  }

  // Find matching company by stripe_customer_id
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (!company) {
    console.log(`⚠️  Invoice ${stripeInvoice.id}: No matching company for Stripe customer ${stripeCustomerId}`);
    stats.no_matching_company++;
    return;
  }

  // Check if invoice already exists
  const { data: existing } = await supabase
    .from('invoices')
    .select('invoice_id')
    .eq('invoice_id', stripeInvoice.id)
    .single();

  if (existing) {
    console.log(`⏭️  Invoice ${stripeInvoice.id}: Already imported`);
    stats.already_imported++;
    return;
  }

  // Map line items to product codes
  const lineItems: Array<{ product_code: string; quantity: number; unit_price: number }> = [];

  for (const item of stripeInvoice.lines.data) {
    const productId = typeof item.price?.product === 'string' ? item.price.product : item.price?.product?.id;
    const priceId = item.price?.id || null;
    const description = item.description || null;

    const productCode = await mapStripeProductToCode(productId || null, priceId, description);

    if (!productCode) {
      console.log(`⚠️  Invoice ${stripeInvoice.id}: Could not map line item "${description}"`);
      stats.no_product_mapping++;
      continue;
    }

    lineItems.push({
      product_code: productCode,
      quantity: item.quantity || 1,
      unit_price: (item.amount || 0) / 100, // Convert from cents
    });
  }

  if (lineItems.length === 0) {
    console.log(`❌ Invoice ${stripeInvoice.id}: No valid line items after mapping`);
    stats.errors++;
    return;
  }

  if (dryRun) {
    console.log(`✅ [DRY RUN] Would import invoice ${stripeInvoice.id} for ${company.company_name}`);
    console.log(`   Date: ${new Date((stripeInvoice.created || 0) * 1000).toISOString()}`);
    console.log(`   Items: ${lineItems.map(i => `${i.product_code} (${i.quantity})`).join(', ')}`);
    stats.successfully_imported++;
    return;
  }

  // Insert invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_id: stripeInvoice.id,
      company_id: company.company_id,
      invoice_date: new Date((stripeInvoice.created || 0) * 1000).toISOString().split('T')[0],
      payment_status: 'paid',
      total_amount: (stripeInvoice.total || 0) / 100,
      currency: stripeInvoice.currency || 'gbp',
      stripe_invoice_id: stripeInvoice.id,
      created_at: new Date((stripeInvoice.created || 0) * 1000).toISOString(),
    });

  if (invoiceError) {
    console.error(`❌ Invoice ${stripeInvoice.id}: Failed to insert invoice:`, invoiceError);
    stats.errors++;
    return;
  }

  // Insert invoice items
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(
      lineItems.map(item => ({
        invoice_id: stripeInvoice.id,
        product_code: item.product_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    );

  if (itemsError) {
    console.error(`❌ Invoice ${stripeInvoice.id}: Failed to insert items:`, itemsError);
    // Rollback: delete the invoice
    await supabase.from('invoices').delete().eq('invoice_id', stripeInvoice.id);
    stats.errors++;
    return;
  }

  console.log(`✅ Imported invoice ${stripeInvoice.id} for ${company.company_name} (${lineItems.length} items)`);
  stats.successfully_imported++;
}

async function main() {
  // Fetch all paid invoices from Stripe
  console.log('📥 Fetching paid invoices from Stripe...\n');

  let hasMore = true;
  let startingAfter: string | undefined = undefined;

  while (hasMore) {
    const invoices = await stripe.invoices.list({
      limit: 100,
      status: 'paid',
      expand: ['data.customer', 'data.lines'],
      starting_after: startingAfter,
      created: since ? { gte: since } : undefined,
    });

    for (const invoice of invoices.data) {
      await importStripeInvoice(invoice);
    }

    hasMore = invoices.has_more;
    if (hasMore && invoices.data.length > 0) {
      startingAfter = invoices.data[invoices.data.length - 1].id;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary');
  console.log('='.repeat(60));
  console.log(`Total Stripe invoices:       ${stats.total_stripe_invoices}`);
  console.log(`Already imported:            ${stats.already_imported}`);
  console.log(`No matching company:         ${stats.no_matching_company}`);
  console.log(`Missing product mapping:     ${stats.no_product_mapping}`);
  console.log(`Successfully imported:       ${stats.successfully_imported}`);
  console.log(`Errors:                      ${stats.errors}`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\n💡 Run without --dry-run to actually import the invoices');
  } else {
    console.log('\n✅ Import complete! Triggers will automatically sync to product_history.');
  }
}

main().catch(console.error);
