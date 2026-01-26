/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed and other Stripe events
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, stripe } from '@/lib/stripe-client';
import { getSupabaseClient } from '@/lib/supabase';
import { sendOrderConfirmation, sendTrialConfirmation } from '@/lib/resend-client';
import { notifyInvoicePaid } from '@/lib/salesNotifications';
import { getCompanyQueryField } from '@/lib/tokens';
import Stripe from 'stripe';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured');
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[stripe-webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('[stripe-webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[stripe-webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'invoice.created':
        await handleInvoiceCreated(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.sent':
        await handleInvoiceSent(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.paid':
        console.log('[stripe-webhook] INVOICE.PAID event received, calling handler...');
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        console.log('[stripe-webhook] INVOICE.PAID handler completed');
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.voided':
        await handleInvoiceVoided(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.marked_uncollectible':
        await handleInvoiceUncollectible(event.data.object as Stripe.Invoice);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe-webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing checkout.session.completed:', session.id);

  // Extract metadata
  const companyId = session.metadata?.company_id;
  const contactId = session.metadata?.contact_id || null;
  const offerKey = session.metadata?.offer_key || null;
  const campaignKey = session.metadata?.campaign_key || null;
  const purchaseType = session.metadata?.purchase_type || null;
  const shippingAddressId = session.metadata?.shipping_address_id || null;
  const productCodes = session.metadata?.product_codes
    ? JSON.parse(session.metadata.product_codes)
    : [];

  if (!companyId) {
    console.error('[stripe-webhook] Missing company_id in session metadata');
    return;
  }

  // Resolve company_id to UUID (handles backward compatibility for old Stripe sessions with TEXT company_id)
  const companyQuery = getCompanyQueryField(companyId);
  const { data: company } = await supabase
    .from('companies')
    .select('company_id')
    .eq(companyQuery.column, companyQuery.value)
    .single();

  if (!company) {
    console.error('[stripe-webhook] Company not found:', companyId);
    return;
  }

  const resolvedCompanyId = company.company_id;

  // Retrieve full session with line items
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items.data.price.product'],
  });

  const lineItems = fullSession.line_items?.data || [];

  // Build items array for order
  const items = lineItems.map((item, idx) => {
    const product = item.price?.product as Stripe.Product | undefined;
    return {
      product_code: productCodes[idx] || product?.metadata?.product_code || 'UNKNOWN',
      description: item.description || product?.name || 'Unknown product',
      quantity: item.quantity || 1,
      unit_price: (item.price?.unit_amount || 0) / 100,
      total_price: (item.amount_total || 0) / 100,
    };
  });

  const subtotal = (fullSession.amount_subtotal || 0) / 100;
  const taxAmount = (fullSession.total_details?.amount_tax || 0) / 100;
  const total = (fullSession.amount_total || 0) / 100;
  const currency = fullSession.currency?.toUpperCase() || 'GBP';

  // Create invoice record (idempotent on stripe_checkout_session_id)
  // Check if invoice already exists
  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('invoice_id')
    .eq('stripe_payment_intent_id', session.payment_intent as string)
    .single();

  if (existingInvoice) {
    console.log('[stripe-webhook] Invoice already exists:', existingInvoice.invoice_id);
    return;
  }

  // Determine invoice type
  let invoiceType = 'sale'; // Default
  if (purchaseType === 'purchase') {
    invoiceType = 'sale';
  } else if (purchaseType === 'rental') {
    // Rentals handled by subscription webhook - this shouldn't happen
    invoiceType = 'rental';
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      company_id: resolvedCompanyId,
      contact_id: contactId,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string,
      shipping_address_id: shippingAddressId,
      invoice_type: invoiceType,
      currency: currency.toLowerCase(),
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: 0,
      total_amount: total,
      status: 'paid',
      payment_status: 'paid',
      invoice_date: new Date(),
      paid_at: new Date().toISOString(),
      notes: offerKey || campaignKey ? `Offer: ${offerKey || 'N/A'}, Campaign: ${campaignKey || 'N/A'}` : null,
    })
    .select('invoice_id')
    .single();

  if (invoiceError) {
    console.error('[stripe-webhook] Failed to create invoice:', invoiceError);
    return;
  }

  console.log('[stripe-webhook] Invoice created:', invoice.invoice_id);

  // Create Stripe invoice for accounting/tax purposes
  try {
    const stripeCustomerId = session.customer as string;

    // Create Stripe invoice for accounting/tax purposes
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      auto_advance: false, // We'll finalize it manually
      collection_method: 'charge_automatically',
      metadata: {
        invoice_id: invoice.invoice_id,
        company_id: resolvedCompanyId,
      },
    });

    // Add line items to Stripe invoice
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: `${item.product_code} - ${item.description}`,
        quantity: item.quantity,
        unit_amount: Math.round(item.unit_price * 100), // Convert to cents
        currency: currency.toLowerCase(),
      });
    }

    // Add tax as separate line item if applicable
    if (taxAmount > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: 'VAT',
        amount: Math.round(taxAmount * 100),
        currency: currency.toLowerCase(),
      });
    }

    // Finalize the Stripe invoice
    const finalizedStripeInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    // Mark as paid (payment already happened via checkout)
    await stripe.invoices.pay(finalizedStripeInvoice.id, {
      paid_out_of_band: true, // Payment happened outside this invoice
    });

    // Update our invoice record with Stripe invoice ID
    await supabase
      .from('invoices')
      .update({ stripe_invoice_id: finalizedStripeInvoice.id })
      .eq('invoice_id', invoice.invoice_id);

    console.log('[stripe-webhook] Stripe invoice created:', finalizedStripeInvoice.id);
  } catch (invoiceError) {
    console.error('[stripe-webhook] Failed to create Stripe invoice:', invoiceError);
    // Don't fail the webhook if invoice creation fails - order is already created
  }

  // Send order confirmation email
  try {
    // Fetch company details
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', companyId)
      .single();

    // Fetch contact details
    const { data: contact } = await supabase
      .from('contacts')
      .select('full_name, email')
      .eq('contact_id', contactId)
      .single();

    // Fetch shipping address
    const { data: shippingAddress } = await supabase
      .from('shipping_addresses')
      .select('address_line_1, address_line_2, city, postal_code, country')
      .eq('address_id', shippingAddressId)
      .single();

    if (company && contact && shippingAddress) {
      const emailResult = await sendOrderConfirmation({
        to: contact.email,
        contactName: contact.full_name,
        companyName: company.company_name,
        orderId: invoice.invoice_id,
        orderItems: items,
        subtotal,
        taxAmount,
        totalAmount: total,
        currency,
        shippingAddress,
        isRental: purchaseType === 'rental',
      });

      if (emailResult.success) {
        console.log('[stripe-webhook] Order confirmation email sent:', emailResult.messageId);
      } else {
        console.error('[stripe-webhook] Failed to send order confirmation:', emailResult.error);
      }
    } else {
      console.error('[stripe-webhook] Missing data for order confirmation email');
    }
  } catch (emailError) {
    console.error('[stripe-webhook] Error sending order confirmation:', emailError);
    // Don't fail the webhook if email fails
  }

  // Insert invoice_items (canonical line items)
  const invoiceItems = items.map((item, index) => ({
    invoice_id: invoice.invoice_id,
    product_code: item.product_code,
    line_number: index + 1,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.total_price,
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems);

  if (itemsError) {
    console.error('[stripe-webhook] Failed to create invoice_items:', itemsError);
    // Don't fail the whole process - invoice header is already created
  } else {
    console.log('[stripe-webhook] Created', invoiceItems.length, 'invoice line items');
    // Database triggers automatically handle sync:
    // invoice (paid) → company_product_history → company_consumables + company_tools
    // See: supabase/migrations/20260111_sync_invoice_to_history.sql
  }

  // Calculate partner commissions since invoice is paid immediately
  await calculatePartnerCommissions(supabase, invoice.invoice_id, resolvedCompanyId);

  // Regenerate portal cache for this company
  const { error: cacheError } = await supabase
    .rpc('regenerate_company_payload', { p_company_id: companyId });

  if (cacheError) {
    console.error('[stripe-webhook] Cache regeneration failed:', cacheError);
  } else {
    console.log(`[stripe-webhook] Regenerated portal cache for ${companyId}`);
  }

  // Track purchase interaction
  if (contactId) {
    const { error: trackError } = await supabase.from('contact_interactions').insert({
      contact_id: contactId,
      company_id: companyId,
      interaction_type: 'portal_purchase',
      url: `/checkout`,
      metadata: {
        invoice_id: invoice.invoice_id,
        total_amount: total,
        currency,
        item_count: items.length
      }
    });

    if (trackError) {
      console.error('[stripe-webhook] Purchase tracking failed:', trackError);
    }
  }

  // Track engagement event (idempotent on source + source_event_id)
  const { error: engagementErr } = await supabase.from('engagement_events').insert({
    company_id: companyId,
    contact_id: contactId,
    source: 'stripe',
    source_event_id: session.id,
    event_type: 'purchase',
    event_name: 'checkout_completed',
    offer_key: offerKey,
    value: total,
    currency,
    meta: {
      stripe_session_id: session.id,
      invoice_id: invoice.invoice_id,
      items: items.map(i => ({ product_code: i.product_code, quantity: i.quantity })),
    },
  });
  if (engagementErr && !engagementErr.message?.includes('duplicate') && engagementErr.code !== '23505') {
    console.error('[stripe-webhook] Failed to create engagement event:', engagementErr);
  }

  // Note: Zoho integration removed - using Stripe invoices only
}

/**
 * Handle payment_intent.succeeded
 * Creates orders for embedded checkout (PaymentIntent API) or updates existing orders
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing payment_intent.succeeded:', paymentIntent.id);

  // Check if order already exists (created by checkout.session.completed or previous webhook)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('order_id, company_id, status')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (existingOrder) {
    // Update order status if not already paid
    if (existingOrder.status !== 'paid') {
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('order_id', existingOrder.order_id);

      console.log('[stripe-webhook] Order status updated to paid:', existingOrder.order_id);
    }
    return;
  }

  // No existing order - this is from embedded checkout (PaymentIntent API)
  // Create new order from PaymentIntent metadata
  const metadata = paymentIntent.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;
  const source = metadata.source;

  // Only process embedded checkout payments
  if (source !== 'reorder_portal') {
    console.log('[stripe-webhook] Ignoring payment_intent without reorder_portal source:', paymentIntent.id);
    return;
  }

  if (!companyId) {
    console.error('[stripe-webhook] Missing company_id in payment_intent metadata:', paymentIntent.id);
    return;
  }

  // Resolve company_id to UUID (handles backward compatibility for old Stripe sessions with TEXT company_id)
  const companyQuery = getCompanyQueryField(companyId);
  const { data: company } = await supabase
    .from('companies')
    .select('company_id')
    .eq(companyQuery.column, companyQuery.value)
    .single();

  if (!company) {
    console.error('[stripe-webhook] Company not found:', companyId);
    return;
  }

  const resolvedCompanyId = company.company_id;

  // Parse line items from metadata
  let lineItems: Array<{
    product_code: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }> = [];

  try {
    lineItems = JSON.parse(metadata.line_items || '[]');
  } catch (e) {
    console.error('[stripe-webhook] Failed to parse line_items:', e);
    return;
  }

  const subtotal = parseFloat(metadata.subtotal || '0');
  const taxAmount = parseFloat(metadata.tax_amount || '0');
  const totalAmount = parseFloat(metadata.total_amount || '0');
  const currency = (paymentIntent.currency || 'gbp').toUpperCase();

  // Create invoice record
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      company_id: resolvedCompanyId,
      contact_id: contactId,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: paymentIntent.customer as string,
      invoice_type: 'sale',
      currency: currency.toLowerCase(),
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: 0,
      total_amount: totalAmount,
      status: 'paid',
      payment_status: 'paid',
      invoice_date: new Date(),
      paid_at: new Date().toISOString(),
      notes: 'Embedded checkout (reorder portal)',
    })
    .select('invoice_id')
    .single();

  if (invoiceError) {
    console.error('[stripe-webhook] Failed to create invoice:', invoiceError);
    return;
  }

  console.log('[stripe-webhook] Invoice created from embedded checkout:', invoice.invoice_id);

  // Create Stripe invoice for this payment
  try {
    const stripeCustomerId = paymentIntent.customer as string;

    if (stripeCustomerId) {
      // Create Stripe invoice
      const stripeInvoice = await stripe.invoices.create({
        customer: stripeCustomerId,
        auto_advance: false,
        collection_method: 'charge_automatically',
        metadata: {
          invoice_id: invoice.invoice_id,
          company_id: resolvedCompanyId, // Use resolved UUID for consistency
        },
      });

      // Add line items to Stripe invoice
      for (const item of lineItems) {
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: stripeInvoice.id,
          description: `${item.product_code} - ${item.description}`,
          quantity: item.quantity,
          unit_amount: Math.round(item.unit_price * 100),
          currency: currency.toLowerCase(),
        });
      }

      // Add VAT as separate line item if applicable
      if (taxAmount > 0) {
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: stripeInvoice.id,
          description: 'VAT (20%)',
          amount: Math.round(taxAmount * 100),
          currency: currency.toLowerCase(),
        });
      }

      // Finalize the Stripe invoice
      const finalizedStripeInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

      // Mark as paid (payment already happened via PaymentIntent)
      await stripe.invoices.pay(finalizedStripeInvoice.id, {
        paid_out_of_band: true,
      });

      // Update our invoice record with Stripe invoice ID
      await supabase
        .from('invoices')
        .update({ stripe_invoice_id: finalizedStripeInvoice.id })
        .eq('invoice_id', invoice.invoice_id);

      console.log('[stripe-webhook] Stripe invoice created:', finalizedStripeInvoice.id);
    }
  } catch (invoiceError) {
    console.error('[stripe-webhook] Failed to create Stripe invoice:', invoiceError);
    // Don't fail - invoice is already created
  }

  // Insert invoice_items
  const invoiceItems = lineItems.map((item, index) => ({
    invoice_id: invoice.invoice_id,
    product_code: item.product_code,
    line_number: index + 1,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.total_price,
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems);

  if (itemsError) {
    console.error('[stripe-webhook] Failed to create invoice_items:', itemsError);
  } else {
    console.log('[stripe-webhook] Created', invoiceItems.length, 'invoice line items');
    // Fact tables auto-update via trigger when payment_status = 'paid'
  }

  // Calculate partner commissions since invoice is paid immediately
  await calculatePartnerCommissions(supabase, invoice.invoice_id, resolvedCompanyId);

  // Send order confirmation email
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', companyId)
      .single();

    const { data: contact } = await supabase
      .from('contacts')
      .select('full_name, email')
      .eq('contact_id', contactId)
      .single();

    if (company && contact?.email) {
      const emailResult = await sendOrderConfirmation({
        to: contact.email,
        contactName: contact.full_name || '',
        companyName: company.company_name || '',
        orderId: invoice.invoice_id,
        orderItems: lineItems,
        subtotal,
        taxAmount,
        totalAmount,
        currency,
        shippingAddress: null, // Embedded checkout doesn't collect shipping yet
        isRental: false,
      });

      if (emailResult.success) {
        console.log('[stripe-webhook] Order confirmation email sent:', emailResult.messageId);
      } else {
        console.error('[stripe-webhook] Failed to send order confirmation:', emailResult.error);
      }
    }
  } catch (emailError) {
    console.error('[stripe-webhook] Error sending order confirmation:', emailError);
  }

  // Track engagement event
  const { error: engagementErr } = await supabase.from('engagement_events').insert({
    company_id: companyId,
    contact_id: contactId,
    source: 'stripe',
    source_event_id: paymentIntent.id,
    event_type: 'purchase',
    event_name: 'embedded_checkout_completed',
    value: totalAmount,
    currency,
    meta: {
      payment_intent_id: paymentIntent.id,
      invoice_id: invoice.invoice_id,
      items: lineItems.map(i => ({ product_code: i.product_code, quantity: i.quantity })),
    },
  });

  if (engagementErr && !engagementErr.message?.includes('duplicate') && engagementErr.code !== '23505') {
    console.error('[stripe-webhook] Failed to create engagement event:', engagementErr);
  }

  // Regenerate portal cache
  const { error: cacheError } = await supabase
    .rpc('regenerate_company_payload', { p_company_id: companyId });

  if (cacheError) {
    console.error('[stripe-webhook] Cache regeneration failed:', cacheError);
  } else {
    console.log(`[stripe-webhook] Regenerated portal cache for ${companyId}`);
  }

  // Track purchase interaction
  if (contactId) {
    await supabase.from('contact_interactions').insert({
      contact_id: contactId,
      company_id: companyId,
      interaction_type: 'portal_purchase',
      url: `/r`,
      metadata: {
        invoice_id: invoice.invoice_id,
        total_amount: totalAmount,
        currency,
        item_count: lineItems.length,
        source: 'embedded_checkout'
      }
    });
  }
}

/**
 * Handle payment_intent.payment_failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing payment_intent.payment_failed:', paymentIntent.id);

  // Track failed payment as engagement event
  const metadata = paymentIntent.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;

  if (companyId) {
    const { error: paymentFailedErr } = await supabase.from('engagement_events').insert({
      company_id: companyId,
      contact_id: contactId,
      source: 'stripe',
      source_event_id: paymentIntent.id,
      event_type: 'payment_issue',
      event_name: 'payment_failed',
      value: (paymentIntent.amount || 0) / 100,
      currency: paymentIntent.currency?.toUpperCase() || 'GBP',
      meta: {
        failure_code: paymentIntent.last_payment_error?.code,
        failure_message: paymentIntent.last_payment_error?.message,
      },
    });
    if (paymentFailedErr && !paymentFailedErr.message?.includes('duplicate') && paymentFailedErr.code !== '23505') {
      console.error('[stripe-webhook] Failed to track payment_failed event:', paymentFailedErr);
    }
  }

  // Update invoice status if exists
  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (invoice) {
    await supabase
      .from('invoices')
      .update({
        status: 'void',
        payment_status: 'unpaid',
      })
      .eq('invoice_id', invoice.invoice_id);

    console.log('[stripe-webhook] Invoice status updated to cancelled:', invoice.invoice_id);
  }
}

/**
 * Handle invoice.created (invoice-led orders)
 */
async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.created:', invoice.id);

  // Check if this is a standalone invoice (not from checkout)
  const metadata = invoice.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;

  // Only track if it has our metadata (created via our invoice API)
  if (companyId) {
    // Order record was already created by createStripeInvoice()
    // Just log the event
    console.log('[stripe-webhook] Invoice created for company:', companyId);
  }
}

/**
 * Handle invoice.finalized
 */
async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.finalized:', invoice.id);

  // Update order status to 'open' (finalized and ready to be sent)
  const { error } = await supabase
    .from('orders')
    .update({
      invoice_status: 'open',
      invoice_url: invoice.hosted_invoice_url || undefined,
      invoice_pdf_url: invoice.invoice_pdf || undefined,
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    console.error('[stripe-webhook] Failed to update order on invoice.finalized:', error);
  }
}

/**
 * Handle invoice.sent
 */
async function handleInvoiceSent(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.sent:', invoice.id);

  // Update order status to 'sent'
  const { error } = await supabase
    .from('orders')
    .update({
      invoice_status: 'sent',
      status: 'sent',
      invoice_sent_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    console.error('[stripe-webhook] Failed to update order on invoice.sent:', error);
  }
}

/**
 * Calculate and record partner/sales rep commissions for an invoice
 * Called when invoice is paid
 */
async function calculatePartnerCommissions(
  supabase: ReturnType<typeof getSupabaseClient>,
  invoiceId: string,
  companyId: string
) {
  console.log(`[commission] Checking for partner association for invoice ${invoiceId}, company ${companyId}`);

  // Check if this customer is associated with a partner
  const { data: partnerAssoc, error: assocError } = await supabase
    .from('distributor_customers')
    .select(`
      distributor_id,
      tool_commission_rate,
      consumable_commission_rate,
      companies!distributor_customers_distributor_id_fkey (
        company_id,
        company_name
      )
    `)
    .eq('customer_id', companyId)
    .eq('status', 'active')
    .single();

  if (assocError || !partnerAssoc) {
    console.log('[commission] No active partner association found - skipping commission calculation');
    return;
  }

  console.log(`[commission] Partner found: ${partnerAssoc.companies?.company_name}, calculating commissions...`);

  // Fetch invoice items to calculate commission per product type
  const { data: invoiceItems, error: itemsError } = await supabase
    .from('invoice_items')
    .select(`
      product_code,
      quantity,
      unit_price,
      line_total,
      products:product_code (type)
    `)
    .eq('invoice_id', invoiceId);

  if (itemsError || !invoiceItems || invoiceItems.length === 0) {
    console.error('[commission] Failed to fetch invoice items:', itemsError);
    return;
  }

  // Calculate commissions per product line
  let totalPartnerCommission = 0;
  let totalSalesRepCommission = 0;
  let invoiceSubtotal = 0;

  for (const item of invoiceItems) {
    const lineTotal = item.line_total || 0;
    invoiceSubtotal += lineTotal;

    const productType = item.products?.type;
    let partnerRate = 0;

    // Determine partner commission rate based on product type
    if (productType === 'tool') {
      partnerRate = partnerAssoc.tool_commission_rate || 20;
    } else if (productType === 'consumable') {
      partnerRate = partnerAssoc.consumable_commission_rate || 10;
    } else {
      // For parts or unknown types, use consumable rate as default
      partnerRate = partnerAssoc.consumable_commission_rate || 10;
    }

    // Calculate partner commission
    const partnerCommission = (lineTotal * partnerRate) / 100;
    totalPartnerCommission += partnerCommission;

    // Calculate sales rep commission (5% of remainder after partner commission)
    const remainder = lineTotal - partnerCommission;
    const salesRepCommission = (remainder * 5) / 100;
    totalSalesRepCommission += salesRepCommission;

    console.log(`[commission] ${item.product_code} (${productType}): £${lineTotal.toFixed(2)} → Partner: £${partnerCommission.toFixed(2)} (${partnerRate}%), Sales Rep: £${salesRepCommission.toFixed(2)} (5% of £${remainder.toFixed(2)})`);
  }

  // Get sales rep for this customer
  const { data: company } = await supabase
    .from('companies')
    .select('account_owner')
    .eq('company_id', companyId)
    .single();

  const salesRepId = company?.account_owner || null;

  console.log(`[commission] Total commissions - Partner: £${totalPartnerCommission.toFixed(2)}, Sales Rep (${salesRepId || 'unassigned'}): £${totalSalesRepCommission.toFixed(2)}`);

  // Create commission record
  const { error: commissionError } = await supabase
    .from('distributor_commissions')
    .insert({
      invoice_id: invoiceId,
      distributor_id: partnerAssoc.distributor_id,
      customer_id: companyId,
      sales_rep_id: salesRepId,
      invoice_subtotal: invoiceSubtotal,
      distributor_commission_rate: 0, // Not used - calculated per product
      distributor_commission_amount: totalPartnerCommission,
      sales_rep_commission_rate: 5, // Always 5% of remainder
      sales_rep_commission_amount: totalSalesRepCommission,
      distributor_payment_status: 'pending',
      sales_rep_payment_status: 'pending',
    });

  if (commissionError) {
    console.error('[commission] Failed to create commission record:', commissionError);
  } else {
    console.log(`[commission] ✅ Commission record created for invoice ${invoiceId}`);
  }
}

/**
 * Handle invoice.paid (for invoice-led orders and subscriptions)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.paid:', invoice.id);
  console.log('[stripe-webhook] Invoice metadata:', JSON.stringify(invoice.metadata));

  const metadata = invoice.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;

  console.log('[stripe-webhook] Attempting to update invoices table for stripe_invoice_id:', invoice.id);

  // Update NEW invoices table (triggers automatic fact table updates)
  const { data: newInvoice, error: updateError } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id)
    .select('invoice_id, company_id, contact_id, total_amount, currency')
    .single();

  if (updateError) {
    console.error('[stripe-webhook] CRITICAL: Failed to update invoice in database:', updateError);
    console.error('[stripe-webhook] Searched for stripe_invoice_id:', invoice.id);
  }

  if (newInvoice) {
    console.log('[stripe-webhook] SUCCESS: Invoice marked as PAID in database:', newInvoice.invoice_id);
    console.log('[stripe-webhook] New invoice table updated (fact tables auto-updated via trigger):', newInvoice.invoice_id);

    // Calculate partner commissions if applicable
    await calculatePartnerCommissions(supabase, newInvoice.invoice_id, newInvoice.company_id);

    // AUTO-WON: Mark related quote as won when invoice is paid
    const { data: relatedQuote } = await supabase
      .from('quotes')
      .select('quote_id, won_at, total_amount')
      .eq('invoice_id', newInvoice.invoice_id)
      .is('won_at', null) // Not already marked won
      .single();

    if (relatedQuote) {
      const { error: wonError } = await supabase
        .from('quotes')
        .update({
          won_at: new Date().toISOString(),
          status: 'won',
        })
        .eq('quote_id', relatedQuote.quote_id);

      if (wonError) {
        console.error('[stripe-webhook] Failed to mark quote as won:', wonError);
      } else {
        console.log(`[stripe-webhook] Quote ${relatedQuote.quote_id} automatically marked as WON (payment received)`);

        // Log activity for audit trail
        await supabase.from('activity_log').insert({
          action_type: 'quote_auto_won',
          entity_type: 'quote',
          entity_id: relatedQuote.quote_id,
          description: `Quote automatically marked as won (Stripe invoice ${invoice.id} paid)`,
          metadata: {
            quote_id: relatedQuote.quote_id,
            invoice_id: newInvoice.invoice_id,
            stripe_invoice_id: invoice.id,
            amount_paid: newInvoice.total_amount,
            auto_marked: true,
          },
        });
      }
    }

    // Notify sales rep that invoice was paid
    const { data: company } = await supabase
      .from('companies')
      .select('company_name, account_owner')
      .eq('company_id', newInvoice.company_id)
      .single();

    if (company?.account_owner) {
      const { data: user } = await supabase
        .from('users')
        .select('user_id, email, full_name')
        .eq('sales_rep_id', company.account_owner)
        .single();

      if (user) {
        notifyInvoicePaid({
          user_id: user.user_id,
          user_email: user.email,
          user_name: user.full_name || user.email,
          invoice_id: newInvoice.invoice_id,
          company_id: newInvoice.company_id,
          company_name: company.company_name,
          amount_paid: newInvoice.total_amount || 0,
        }).catch(err => console.error('[stripe-webhook] Notification failed:', err));
      }
    }
  }

  // Update OLD orders table (legacy - can remove once fully migrated)
  const { data: order } = await supabase
    .from('orders')
    .update({
      invoice_status: 'paid',
      status: 'paid',
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id)
    .select('order_id, company_id, contact_id, items, total_amount, currency')
    .single();

  if (order) {
    console.log('[stripe-webhook] Order marked as paid:', order.order_id);

    // Note: Shipping manifests and commercial invoices are now created manually
    // via the admin UI when preparing international shipments

    // Track payment event
    const { error: paidEventErr } = await supabase.from('engagement_events').insert({
      company_id: order.company_id,
      contact_id: order.contact_id,
      source: 'stripe',
      source_event_id: invoice.id,
      event_type: 'purchase',
      event_name: 'invoice_paid',
      value: order.total_amount,
      currency: order.currency,
      meta: {
        invoice_number: invoice.number,
        stripe_invoice_id: invoice.id,
        order_id: order.order_id,
      },
    });
    if (paidEventErr && !paidEventErr.message?.includes('duplicate') && paidEventErr.code !== '23505') {
      console.error('[stripe-webhook] Failed to track invoice_paid event:', paidEventErr);
    }
  } else {
    // This might be a subscription invoice - just track it
    if (companyId) {
      const { error: invoicePaidErr } = await supabase.from('engagement_events').insert({
        company_id: companyId,
        contact_id: contactId,
        source: 'stripe',
        source_event_id: invoice.id,
        event_type: 'purchase',
        event_name: 'invoice_paid',
        value: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency?.toUpperCase() || 'GBP',
        meta: {
          invoice_number: invoice.number,
          stripe_invoice_id: invoice.id,
          type: 'subscription',
        },
      });
      if (invoicePaidErr && !invoicePaidErr.message?.includes('duplicate') && invoicePaidErr.code !== '23505') {
        console.error('[stripe-webhook] Failed to track invoice_paid event:', invoicePaidErr);
      }
    }
  }

  console.log('[stripe-webhook] handleInvoicePaid completed successfully for:', invoice.id);
}

/**
 * Handle invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.payment_failed:', invoice.id);

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      invoice_status: 'open', // Keep as open for retry
      payment_status: 'unpaid',
      meta: {
        last_payment_error: invoice.last_finalization_error?.message || 'Payment failed',
      },
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    console.error('[stripe-webhook] Failed to update order on payment_failed:', error);
  }

  // Track failed payment
  const metadata = invoice.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;

  if (companyId) {
    await supabase.from('engagement_events').insert({
      company_id: companyId,
      contact_id: contactId,
      source: 'stripe',
      source_event_id: invoice.id,
      event_type: 'payment_issue',
      event_name: 'invoice_payment_failed',
      value: (invoice.amount_due || 0) / 100,
      currency: invoice.currency?.toUpperCase() || 'GBP',
      meta: {
        invoice_id: invoice.id,
        error: invoice.last_finalization_error?.message,
      },
    });
  }
}

/**
 * Handle invoice.voided
 */
async function handleInvoiceVoided(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.voided:', invoice.id);

  const metadata = invoice.metadata || {};

  // Update NEW invoices table (primary source of truth)
  const { data: invoiceRecord, error: invoiceUpdateError } = await supabase
    .from('invoices')
    .update({
      payment_status: 'void',
      status: 'void',
      voided_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id)
    .select('invoice_id, company_id, total_amount')
    .single();

  if (invoiceUpdateError) {
    console.error('[stripe-webhook] Failed to update invoices table:', invoiceUpdateError);
  } else if (invoiceRecord) {
    console.log('[stripe-webhook] Invoice record voided:', invoiceRecord.invoice_id);

    // Track voided event
    const { error: voidedEventErr } = await supabase.from('engagement_events').insert({
      company_id: invoiceRecord.company_id,
      contact_id: metadata.contact_id || null,
      source: 'stripe',
      source_event_id: invoice.id,
      event_type: 'invoice_event',
      event_name: 'invoice_voided',
      value: invoiceRecord.total_amount,
      currency: invoice.currency?.toUpperCase() || 'GBP',
      meta: {
        invoice_id: invoiceRecord.invoice_id,
        stripe_invoice_id: invoice.id,
        invoice_number: invoice.number,
      },
    });
    if (voidedEventErr && !voidedEventErr.message?.includes('duplicate') && voidedEventErr.code !== '23505') {
      console.error('[stripe-webhook] Failed to track invoice_voided event:', voidedEventErr);
    }
  }

  // Update OLD orders table (legacy - for backward compatibility)
  const { error: orderUpdateError } = await supabase
    .from('orders')
    .update({
      invoice_status: 'void',
      status: 'cancelled',
      invoice_voided_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id);

  if (orderUpdateError) {
    console.error('[stripe-webhook] Failed to update orders table:', orderUpdateError);
  } else {
    console.log('[stripe-webhook] Order record updated to voided');
  }
}

/**
 * Handle invoice.marked_uncollectible
 */
async function handleInvoiceUncollectible(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.marked_uncollectible:', invoice.id);

  // Update order status to uncollectible
  const { error } = await supabase
    .from('orders')
    .update({
      invoice_status: 'uncollectible',
      status: 'cancelled',
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    console.error('[stripe-webhook] Failed to update order on uncollectible:', error);
  }
}

/**
 * Handle charge.refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing charge.refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;

  // Find invoice by payment_intent_id
  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_id, company_id, contact_id, total_amount, currency')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!invoice) {
    console.log('[stripe-webhook] No invoice found for refunded charge:', charge.id);
    return;
  }

  // Update invoice payment status
  const refundAmount = (charge.amount_refunded || 0) / 100;
  const totalAmount = invoice.total_amount;

  const newPaymentStatus = refundAmount >= totalAmount ? 'refunded' : 'partial';

  await supabase
    .from('invoices')
    .update({
      payment_status: newPaymentStatus,
    })
    .eq('invoice_id', invoice.invoice_id);

  // Track refund as engagement event
  const { error: refundErr } = await supabase.from('engagement_events').insert({
    company_id: invoice.company_id,
    contact_id: invoice.contact_id,
    source: 'stripe',
    source_event_id: charge.id,
    event_type: 'refund',
    event_name: 'charge_refunded',
    value: refundAmount,
    currency: invoice.currency,
    meta: {
      invoice_id: invoice.invoice_id,
      refund_amount: refundAmount,
      total_refunded: (charge.amount_refunded || 0) / 100,
    },
  });
  if (refundErr && !refundErr.message?.includes('duplicate') && refundErr.code !== '23505') {
    console.error('[stripe-webhook] Failed to track charge_refunded event:', refundErr);
  }

  console.log('[stripe-webhook] Invoice refund processed:', invoice.invoice_id);
}

/**
 * Handle subscription creation (for tool rentals AND trial subscriptions)
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing customer.subscription.created:', subscription.id);
  console.log('[stripe-webhook] Subscription metadata:', JSON.stringify(subscription.metadata || {}));

  const metadata = subscription.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;
  const purchaseType = metadata.purchase_type;
  const shippingAddressId = metadata.shipping_address_id;
  const machineId = metadata.machine_id || null;
  const trialIntentId = metadata.trial_intent_id || null;
  const selectedPrice = metadata.selected_price ? parseFloat(metadata.selected_price) : null;

  console.log('[stripe-webhook] Parsed values - companyId:', companyId, 'purchaseType:', purchaseType, 'trialIntentId:', trialIntentId);

  if (!companyId) {
    console.log('[stripe-webhook] Skipping subscription without company_id:', subscription.id);
    return;
  }

  // Handle trial subscriptions (from /offer page)
  if (purchaseType === 'subscription_trial' || trialIntentId) {
    console.log('[stripe-webhook] Routing to handleTrialSubscriptionCreated');
    await handleTrialSubscriptionCreated(subscription, {
      companyId,
      contactId,
      machineId,
      trialIntentId,
      selectedPrice,
    });
    return;
  }

  // Handle rentals (legacy flow)
  if (purchaseType !== 'rental') {
    console.log('[stripe-webhook] Skipping non-rental/non-trial subscription:', subscription.id, 'purchaseType:', purchaseType);
    return;
  }

  // Get product information from subscription items
  const firstItem = subscription.items.data[0];
  if (!firstItem) {
    console.error('[stripe-webhook] No subscription items found');
    return;
  }

  const product = await stripe.products.retrieve(firstItem.price.product as string);
  const productCode = product.metadata?.product_code || 'UNKNOWN';
  const monthlyPrice = (firstItem.price.unit_amount || 0) / 100;

  const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

  // Create rental agreement (auto-generates serial number via trigger)
  const { data: rental, error: rentalError } = await supabase
    .from('rental_agreements')
    .insert({
      company_id: companyId,
      contact_id: contactId,
      product_code: productCode,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      monthly_price: monthlyPrice,
      currency: (firstItem.price.currency || 'gbp').toUpperCase(),
      start_date: new Date(subscription.created * 1000).toISOString(),
      trial_end_date: trialEnd?.toISOString(),
      contract_signed_at: new Date().toISOString(),
      status: subscription.trial_end ? 'trial' : 'active',
    })
    .select('rental_id, serial_number')
    .single();

  if (rentalError) {
    console.error('[stripe-webhook] Failed to create rental_agreement:', rentalError);
    return;
  }

  console.log('[stripe-webhook] Rental agreement created:', rental.serial_number);

  // Create order record for the rental setup
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      company_id: companyId,
      contact_id: contactId,
      stripe_customer_id: subscription.customer as string,
      shipping_address_id: shippingAddressId,
      rental_agreement_id: rental.rental_id,
      order_type: 'tool_rental_setup',
      items: [{
        product_code: productCode,
        description: product.name,
        quantity: 1,
        unit_price: monthlyPrice,
        total_price: 0 // Trial period
      }],
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      currency: (firstItem.price.currency || 'gbp').toUpperCase(),
      status: 'completed',
      payment_status: 'paid', // Trial doesn't require payment
    });

  if (orderError) {
    console.error('[stripe-webhook] Failed to create rental setup order:', orderError);
  }

  // Track rental started event
  const { error: rentalStartedErr } = await supabase.from('engagement_events').insert({
    company_id: companyId,
    contact_id: contactId,
    source: 'stripe',
    source_event_id: subscription.id,
    event_type: 'rental_event',
    event_name: 'rental_started',
    value: monthlyPrice,
    currency: (firstItem.price.currency || 'gbp').toUpperCase(),
    meta: {
      rental_id: rental.rental_id,
      serial_number: rental.serial_number,
      product_code: productCode,
      has_trial: !!subscription.trial_end,
    },
  });
  if (rentalStartedErr && !rentalStartedErr.message?.includes('duplicate') && rentalStartedErr.code !== '23505') {
    console.error('[stripe-webhook] Failed to track rental_started event:', rentalStartedErr);
  }

  // Send rental/trial confirmation email
  try {
    // Fetch company details
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', companyId)
      .single();

    // Fetch contact details
    const { data: contact } = await supabase
      .from('contacts')
      .select('full_name, email')
      .eq('contact_id', contactId)
      .single();

    // Fetch shipping address
    const { data: shippingAddress } = await supabase
      .from('shipping_addresses')
      .select('address_line_1, address_line_2, city, postal_code, country')
      .eq('address_id', shippingAddressId)
      .single();

    if (company && contact && shippingAddress) {
      const emailResult = await sendOrderConfirmation({
        to: contact.email,
        contactName: contact.full_name,
        companyName: company.company_name,
        orderId: rental.serial_number,
        orderItems: [{
          product_code: productCode,
          description: product.name,
          quantity: 1,
          unit_price: monthlyPrice,
          total_price: 0, // Trial period is free
        }],
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        currency: (firstItem.price.currency || 'gbp').toUpperCase(),
        shippingAddress,
        isRental: true,
      });

      if (emailResult.success) {
        console.log('[stripe-webhook] Rental confirmation email sent:', emailResult.messageId);
      } else {
        console.error('[stripe-webhook] Failed to send rental confirmation:', emailResult.error);
      }
    } else {
      console.error('[stripe-webhook] Missing data for rental confirmation email');
    }
  } catch (emailError) {
    console.error('[stripe-webhook] Error sending rental confirmation:', emailError);
    // Don't fail the webhook if email fails
  }
}

/**
 * Handle subscription updates (status changes, payment failures, price changes)
 * Handles both rental_agreements AND subscriptions tables
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing customer.subscription.updated:', subscription.id);

  // First, try to find in subscriptions table (new flow)
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('subscription_id, status, monthly_price, ratchet_max, company_id, contact_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (sub) {
    await handleSubscriptionTableUpdate(subscription, sub);
    return;
  }

  // Fallback: Find in rental_agreements (legacy flow)
  const { data: rental } = await supabase
    .from('rental_agreements')
    .select('rental_id, status')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!rental) {
    console.log('[stripe-webhook] No subscription or rental found for:', subscription.id);
    return;
  }

  // Map Stripe status to our status
  let newStatus: string = rental.status;

  switch (subscription.status) {
    case 'trialing':
      newStatus = 'trial';
      break;
    case 'active':
      newStatus = 'active';
      break;
    case 'past_due':
      newStatus = 'past_due';
      break;
    case 'canceled':
    case 'unpaid':
      newStatus = 'cancelled';
      break;
  }

  // Update rental agreement status
  if (newStatus !== rental.status) {
    await supabase
      .from('rental_agreements')
      .update({ status: newStatus })
      .eq('rental_id', rental.rental_id);

    console.log(`[stripe-webhook] Rental status updated: ${rental.status} -> ${newStatus}`);
  }
}

/**
 * Handle updates to subscriptions table with ratchet logic
 */
async function handleSubscriptionTableUpdate(
  stripeSubscription: Stripe.Subscription,
  existingSub: {
    subscription_id: string;
    status: string;
    monthly_price: number;
    ratchet_max: number | null;
    company_id: string;
    contact_id: string | null;
  }
) {
  const supabase = getSupabaseClient();

  // Get current price from Stripe
  const firstItem = stripeSubscription.items.data[0];
  const newMonthlyPrice = firstItem ? (firstItem.price.unit_amount || 0) / 100 : existingSub.monthly_price;

  // Map Stripe status to our status
  let newStatus: string = existingSub.status;
  switch (stripeSubscription.status) {
    case 'trialing':
      newStatus = 'trial';
      break;
    case 'active':
      newStatus = 'active';
      break;
    case 'past_due':
      newStatus = 'past_due';
      break;
    case 'canceled':
    case 'unpaid':
      newStatus = 'cancelled';
      break;
    case 'paused':
      newStatus = 'paused';
      break;
  }

  // Build update object
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  // Status change
  if (newStatus !== existingSub.status) {
    updates.status = newStatus;
  }

  // Price change
  if (newMonthlyPrice !== existingSub.monthly_price) {
    updates.monthly_price = newMonthlyPrice;
  }

  // Period dates
  updates.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString();
  updates.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString();

  if (stripeSubscription.trial_end) {
    updates.trial_end_date = new Date(stripeSubscription.trial_end * 1000).toISOString();
  }

  // Ratchet logic: price can only increase, never decrease
  const currentRatchetMax = existingSub.ratchet_max || existingSub.monthly_price;

  if (newMonthlyPrice > currentRatchetMax) {
    // Price increased - update ratchet_max
    updates.ratchet_max = newMonthlyPrice;
    console.log(`[stripe-webhook] Ratchet increased: ${currentRatchetMax} -> ${newMonthlyPrice}`);

    // Log ratchet increase event
    const { error: ratchetIncErr } = await supabase.from('subscription_events').insert({
      subscription_id: existingSub.subscription_id,
      event_type: 'price_increased',
      event_name: 'Price increased (ratchet updated)',
      old_value: { monthly_price: existingSub.monthly_price, ratchet_max: currentRatchetMax },
      new_value: { monthly_price: newMonthlyPrice, ratchet_max: newMonthlyPrice },
      performed_by: 'stripe_webhook',
    });
    if (ratchetIncErr) {
      console.error('[stripe-webhook] Failed to log price increase event:', ratchetIncErr);
    }

  } else if (newMonthlyPrice < currentRatchetMax) {
    // Price decreased below ratchet - this is an anomaly!
    console.warn(`[stripe-webhook] RATCHET VIOLATION: Price ${newMonthlyPrice} < ratchet ${currentRatchetMax}`);

    // Log the anomaly as an event
    const { error: ratchetViolationErr } = await supabase.from('subscription_events').insert({
      subscription_id: existingSub.subscription_id,
      event_type: 'downgrade_below_ratchet',
      event_name: 'Price decreased below ratchet maximum',
      old_value: { monthly_price: existingSub.monthly_price, ratchet_max: currentRatchetMax },
      new_value: { monthly_price: newMonthlyPrice },
      performed_by: 'stripe_webhook',
      notes: `Anomaly: New price £${newMonthlyPrice} is below ratchet max £${currentRatchetMax}`,
    });
    if (ratchetViolationErr) {
      console.error('[stripe-webhook] Failed to log ratchet violation event:', ratchetViolationErr);
    }

    // Don't update ratchet_max - keep it at the higher value
    // The v_subscription_anomalies view will flag this
  }

  // Update the subscription
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('subscription_id', existingSub.subscription_id);

  if (updateError) {
    console.error('[stripe-webhook] Failed to update subscription:', updateError);
    return;
  }

  // Log status change if it happened
  if (newStatus !== existingSub.status) {
    console.log(`[stripe-webhook] Subscription status updated: ${existingSub.status} -> ${newStatus}`);

    const { error: statusChangeErr } = await supabase.from('subscription_events').insert({
      subscription_id: existingSub.subscription_id,
      event_type: 'status_changed',
      event_name: `Status changed to ${newStatus}`,
      old_value: { status: existingSub.status },
      new_value: { status: newStatus },
      performed_by: 'stripe_webhook',
    });
    if (statusChangeErr) {
      console.error('[stripe-webhook] Failed to log status change event:', statusChangeErr);
    }

    // Track as engagement event
    const { error: statusEngagementErr } = await supabase.from('engagement_events').insert({
      company_id: existingSub.company_id,
      contact_id: existingSub.contact_id,
      event_type: 'subscription_event',
      event_name: 'subscription_status_changed',
      source: 'stripe',
      meta: {
        subscription_id: existingSub.subscription_id,
        old_status: existingSub.status,
        new_status: newStatus,
      },
    });
    if (statusEngagementErr) {
      console.error('[stripe-webhook] Failed to track status change:', statusEngagementErr);
    }
  }

  console.log(`[stripe-webhook] Subscription ${existingSub.subscription_id} updated`);
}

/**
 * Handle subscription cancellation
 * Handles both subscriptions AND rental_agreements tables
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing customer.subscription.deleted:', subscription.id);

  // First, try to find in subscriptions table (new flow)
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('subscription_id, company_id, contact_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (sub) {
    // Update subscription to cancelled
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: subscription.cancellation_details?.reason || 'Subscription cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', sub.subscription_id);

    console.log('[stripe-webhook] Subscription cancelled:', sub.subscription_id);

    // Log cancellation event
    const { error: cancelEventErr } = await supabase.from('subscription_events').insert({
      subscription_id: sub.subscription_id,
      event_type: 'cancelled',
      event_name: 'Subscription cancelled',
      old_value: { status: 'active' },
      new_value: { status: 'cancelled', reason: subscription.cancellation_details?.reason },
      performed_by: 'stripe_webhook',
    });
    if (cancelEventErr) {
      console.error('[stripe-webhook] Failed to log cancellation event:', cancelEventErr);
    }

    // Track engagement event
    const { error: cancelEngagementErr } = await supabase.from('engagement_events').insert({
      company_id: sub.company_id,
      contact_id: sub.contact_id,
      event_type: 'subscription_event',
      event_name: 'subscription_cancelled',
      source: 'stripe',
      meta: {
        subscription_id: sub.subscription_id,
        stripe_subscription_id: subscription.id,
        reason: subscription.cancellation_details?.reason,
      },
    });
    if (cancelEngagementErr) {
      console.error('[stripe-webhook] Failed to track subscription_cancelled event:', cancelEngagementErr);
    }

    return;
  }

  // Fallback: Find and update rental agreement (legacy flow)
  const { data: rental } = await supabase
    .from('rental_agreements')
    .select('rental_id, company_id, contact_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!rental) {
    console.log('[stripe-webhook] No subscription or rental found for deleted subscription:', subscription.id);
    return;
  }

  // Update rental to cancelled
  await supabase
    .from('rental_agreements')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: subscription.cancellation_details?.reason || 'Subscription cancelled',
    })
    .eq('rental_id', rental.rental_id);

  console.log('[stripe-webhook] Rental cancelled:', rental.rental_id);

  // Track cancellation event
  const { error: rentalCancelErr } = await supabase.from('engagement_events').insert({
    company_id: rental.company_id,
    contact_id: rental.contact_id,
    source: 'stripe',
    source_event_id: subscription.id,
    event_type: 'rental_event',
    event_name: 'rental_cancelled',
    meta: {
      rental_id: rental.rental_id,
      reason: subscription.cancellation_details?.reason,
    },
  });
  if (rentalCancelErr && !rentalCancelErr.message?.includes('duplicate') && rentalCancelErr.code !== '23505') {
    console.error('[stripe-webhook] Failed to track rental_cancelled event:', rentalCancelErr);
  }
}

/**
 * Handle trial subscription creation (from /offer page flow)
 * Creates row in subscriptions table with ratchet logic
 */
async function handleTrialSubscriptionCreated(
  subscription: Stripe.Subscription,
  meta: {
    companyId: string;
    contactId: string | null;
    machineId: string | null;
    trialIntentId: string | null;
    selectedPrice: number | null;
  }
) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing trial subscription:', subscription.id);
  console.log('[stripe-webhook] Trial metadata:', JSON.stringify(meta));

  const { companyId, contactId, machineId, trialIntentId, selectedPrice } = meta;

  // Get price from subscription items
  const firstItem = subscription.items.data[0];
  if (!firstItem) {
    console.error('[stripe-webhook] No subscription items found');
    return;
  }

  const monthlyPrice = selectedPrice || (firstItem.price.unit_amount || 0) / 100;
  const currency = (firstItem.price.currency || 'gbp').toUpperCase();

  // Trial dates
  const trialStart = subscription.trial_start
    ? new Date(subscription.trial_start * 1000)
    : null;
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;

  // Current period
  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Determine status
  let status: string = 'trial';
  if (subscription.status === 'active' && !subscription.trial_end) {
    status = 'active';
  } else if (subscription.status === 'trialing') {
    status = 'trial';
  } else if (subscription.status === 'past_due') {
    status = 'past_due';
  }

  // Check if subscription already exists (idempotency)
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('subscription_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (existingSub) {
    console.log('[stripe-webhook] Subscription already exists:', existingSub.subscription_id);
    // Still try to send email in case it failed before
    await sendTrialEmail(supabase, companyId, contactId, machineId, monthlyPrice, trialEnd);
    return;
  }

  // Insert subscription row
  const { data: newSub, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      company_id: companyId,
      contact_id: contactId,
      monthly_price: monthlyPrice,
      currency,
      tools: [], // Can be populated later based on machine type
      status,
      trial_start_date: trialStart?.toISOString(),
      trial_end_date: trialEnd?.toISOString(),
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      next_billing_date: trialEnd?.toISOString() || currentPeriodEnd.toISOString(),
      ratchet_max: monthlyPrice, // Initialize ratchet to current price
      notes: machineId ? `Machine: ${machineId}` : undefined,
    })
    .select('subscription_id')
    .single();

  if (subError || !newSub) {
    console.error('[stripe-webhook] Failed to create subscription:', subError);
    return;
  }

  console.log('[stripe-webhook] Subscription created:', newSub.subscription_id);

  // Insert subscription event
  const { error: subEventErr } = await supabase
    .from('subscription_events')
    .insert({
      subscription_id: newSub.subscription_id,
      event_type: 'created',
      event_name: 'Subscription created from trial offer',
      old_value: null,
      new_value: {
        monthly_price: monthlyPrice,
        machine_id: machineId,
        trial_intent_id: trialIntentId,
        status,
        trial_end_date: trialEnd?.toISOString(),
      },
      performed_by: 'stripe_webhook',
    });
  if (subEventErr) {
    console.error('[stripe-webhook] Failed to create subscription event:', subEventErr);
  }

  // Track engagement event
  const { error: trialEngagementErr } = await supabase.from('engagement_events').insert({
    company_id: companyId,
    contact_id: contactId,
    event_type: 'subscription_event',
    event_name: 'subscription_created',
    source: 'stripe',
    meta: {
      subscription_id: newSub.subscription_id,
      stripe_subscription_id: subscription.id,
      monthly_price: monthlyPrice,
      machine_id: machineId,
      trial_intent_id: trialIntentId,
      has_trial: !!trialEnd,
    },
  });
  if (trialEngagementErr) {
    console.error('[stripe-webhook] Failed to track subscription_created event:', trialEngagementErr);
  }

  // Send confirmation email
  await sendTrialEmail(supabase, companyId, contactId, machineId, monthlyPrice, trialEnd);
}

/**
 * Helper to send trial confirmation email
 * Extracted to allow retry on idempotent webhook hits
 */
async function sendTrialEmail(
  supabase: ReturnType<typeof getSupabaseClient>,
  companyId: string,
  contactId: string | null,
  machineId: string | null,
  monthlyPrice: number,
  trialEnd: Date | null
) {
  try {
    console.log('[stripe-webhook] Attempting to send trial email, contactId:', contactId);

    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', companyId)
      .single();

    console.log('[stripe-webhook] Company lookup:', company ? company.company_name : 'NOT FOUND');

    // Try to find contact by ID first, then fallback to company's primary contact
    let contact: { full_name: string | null; email: string } | null = null;

    if (contactId && contactId !== '') {
      const { data: contactById } = await supabase
        .from('contacts')
        .select('full_name, email')
        .eq('contact_id', contactId)
        .single();
      contact = contactById;
      console.log('[stripe-webhook] Contact by ID:', contact ? contact.email : 'NOT FOUND');
    }

    // Fallback: get any contact for this company
    if (!contact) {
      const { data: companyContact } = await supabase
        .from('contacts')
        .select('full_name, email')
        .eq('company_id', companyId)
        .limit(1)
        .single();
      contact = companyContact;
      console.log('[stripe-webhook] Fallback contact:', contact ? contact.email : 'NOT FOUND');
    }

    // Get machine name if we have a machine ID
    let machineName: string | undefined;
    if (machineId && machineId !== '') {
      const { data: machine } = await supabase
        .from('machines')
        .select('brand, model')
        .eq('machine_id', machineId)
        .single();
      if (machine) {
        machineName = `${machine.brand} ${machine.model}`.trim();
      }
      console.log('[stripe-webhook] Machine lookup:', machineName || 'NOT FOUND');
    }

    if (company && contact?.email) {
      console.log('[stripe-webhook] Sending trial confirmation to:', contact.email);
      const emailResult = await sendTrialConfirmation({
        to: contact.email,
        contactName: contact.full_name || '',
        companyName: company.company_name || '',
        monthlyPrice: monthlyPrice,
        currency: 'GBP',
        trialEndDate: trialEnd,
        machineName,
      });

      if (emailResult.success) {
        console.log(`[stripe-webhook] Trial confirmation sent to ${contact.email}, messageId: ${emailResult.messageId}`);
      } else {
        console.error('[stripe-webhook] Failed to send trial confirmation:', emailResult.error);
      }
    } else {
      console.error('[stripe-webhook] Cannot send email - missing data:', {
        hasCompany: !!company,
        hasContact: !!contact,
        contactEmail: contact?.email || 'none'
      });
    }
  } catch (emailError) {
    console.error('[stripe-webhook] Error sending confirmation email:', emailError);
  }
}
