/**
 * POST /api/admin/technicrease-quotes/[quote_id]/approve
 * Approve TechniCrease quote and generate invoice
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quote_id: string }> }
) {
  try {
    const { quote_id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Get quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        companies!inner(company_name, stripe_customer_id, billing_country, vat_number),
        contacts!inner(email, full_name)
      `)
      .eq('quote_id', quote_id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.approval_status === 'approved') {
      return NextResponse.json({ error: 'Quote already approved' }, { status: 400 });
    }

    // Get line items
    const { data: lineItems, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quote_id)
      .order('line_number');

    if (itemsError || !lineItems) {
      return NextResponse.json({ error: 'Failed to load quote items' }, { status: 500 });
    }

    // Create Stripe customer if needed
    let stripeCustomerId = quote.companies.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: quote.companies.company_name,
        email: quote.contacts.email,
        metadata: {
          company_id: quote.company_id,
        },
      });
      stripeCustomerId = customer.id;

      // Update company with Stripe customer ID
      await supabase
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('company_id', quote.company_id);
    }

    // Create Stripe invoice
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      auto_advance: false, // Don't auto-finalize
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: {
        quote_id: quote.quote_id,
        company_id: quote.company_id,
      },
    });

    // Add line items to invoice
    for (const item of lineItems) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        description: `${item.description} (${item.product_code})`,
        quantity: item.quantity,
        unit_amount: Math.round(item.unit_price * 100), // Convert to cents
        currency: 'gbp',
      });
    }

    // Add shipping if not free
    if (!quote.free_shipping) {
      // Calculate shipping (simplified - you may want to call shipping API)
      const shippingCost = 15.00; // Default shipping
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        description: 'Shipping',
        amount: Math.round(shippingCost * 100),
        currency: 'gbp',
      });
    }

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // Save invoice to database
    const { data: dbInvoice, error: invoiceInsertError } = await supabase
      .from('invoices')
      .insert({
        company_id: quote.company_id,
        contact_id: quote.contact_id,
        stripe_invoice_id: finalizedInvoice.id,
        invoice_number: finalizedInvoice.number || undefined,
        invoice_url: finalizedInvoice.hosted_invoice_url || undefined,
        invoice_pdf_url: finalizedInvoice.invoice_pdf || undefined,
        subtotal: quote.subtotal,
        total_amount: quote.total_amount,
        currency: quote.currency,
        payment_status: 'unpaid',
        invoice_date: new Date().toISOString(),
      })
      .select('invoice_id')
      .single();

    if (invoiceInsertError || !dbInvoice) {
      console.error('[approve-quote] Failed to save invoice:', invoiceInsertError);
      return NextResponse.json({ error: 'Failed to save invoice' }, { status: 500 });
    }

    // Update quote with approval and invoice
    await supabase
      .from('quotes')
      .update({
        approval_status: 'approved',
        approved_by: user.user_id,
        approved_at: new Date().toISOString(),
        invoice_id: dbInvoice.invoice_id,
        status: 'accepted',
      })
      .eq('quote_id', quote_id);

    return NextResponse.json({
      success: true,
      invoice_id: finalizedInvoice.id,
      invoice_url: finalizedInvoice.hosted_invoice_url,
    });
  } catch (error) {
    console.error('[approve-quote] Error:', error);
    return NextResponse.json(
      { error: 'Failed to approve quote' },
      { status: 500 }
    );
  }
}
