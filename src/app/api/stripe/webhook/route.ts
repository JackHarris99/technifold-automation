/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed and other Stripe events
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, stripe } from '@/lib/stripe-client';
import { getSupabaseClient } from '@/lib/supabase';
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

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
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
  const productCodes = session.metadata?.product_codes
    ? JSON.parse(session.metadata.product_codes)
    : [];

  if (!companyId) {
    console.error('[stripe-webhook] Missing company_id in session metadata');
    return;
  }

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

  // Create order record (idempotent on stripe_checkout_session_id)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('order_id')
    .eq('stripe_checkout_session_id', session.id)
    .single();

  if (existingOrder) {
    console.log('[stripe-webhook] Order already exists:', existingOrder.order_id);
    return;
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      company_id: companyId,
      contact_id: contactId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string,
      offer_key: offerKey,
      campaign_key: campaignKey,
      items,
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
      currency,
      status: 'paid',
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .select('order_id')
    .single();

  if (orderError) {
    console.error('[stripe-webhook] Failed to create order:', orderError);
    return;
  }

  console.log('[stripe-webhook] Order created:', order.order_id);

  // Insert order_items (canonical line items)
  const orderItems = items.map((item) => ({
    order_id: order.order_id,
    product_code: item.product_code,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('[stripe-webhook] Failed to create order_items:', itemsError);
    // Don't fail the whole process - order header is already created
  }

  // Track engagement event (idempotent on source + source_event_id)
  await supabase.from('engagement_events').insert({
    company_id: companyId,
    contact_id: contactId,
    source: 'stripe',
    source_event_id: session.id,
    event_name: 'checkout_completed',
    offer_key: offerKey,
    campaign_key: campaignKey,
    value: total,
    currency,
    meta: {
      stripe_session_id: session.id,
      order_id: order.order_id,
      items: items.map(i => ({ product_code: i.product_code, quantity: i.quantity })),
    },
  }).catch(err => {
    // Ignore duplicate key errors (idempotency)
    if (!err.message?.includes('duplicate') && !err.code === '23505') {
      console.error('[stripe-webhook] Failed to create engagement event:', err);
    }
  });

  // Enqueue Zoho sync job (create invoice + record payment)
  await supabase.from('outbox').insert({
    job_type: 'zoho_sync_order',
    payload: {
      order_id: order.order_id,
      company_id: companyId,
      items,
      total,
      currency,
      payment_reference: session.payment_intent,
    },
    company_id: companyId,
    order_id: order.order_id,
  });

  console.log('[stripe-webhook] Zoho sync job enqueued for order:', order.order_id);
}

/**
 * Handle payment_intent.succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing payment_intent.succeeded:', paymentIntent.id);

  // Update order if exists (may have been created by checkout.session.completed)
  const { data: order } = await supabase
    .from('orders')
    .select('order_id, company_id, status')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (order) {
    // Update order status if not already paid
    if (order.status !== 'paid') {
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('order_id', order.order_id);

      console.log('[stripe-webhook] Order status updated to paid:', order.order_id);
    }
  } else {
    console.log('[stripe-webhook] No order found for payment_intent:', paymentIntent.id);
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
    await supabase.from('engagement_events').insert({
      company_id: companyId,
      contact_id: contactId,
      source: 'stripe',
      source_event_id: paymentIntent.id,
      event_name: 'payment_failed',
      value: (paymentIntent.amount || 0) / 100,
      currency: paymentIntent.currency?.toUpperCase() || 'GBP',
      meta: {
        failure_code: paymentIntent.last_payment_error?.code,
        failure_message: paymentIntent.last_payment_error?.message,
      },
    }).catch(err => {
      if (!err.message?.includes('duplicate') && err.code !== '23505') {
        console.error('[stripe-webhook] Failed to track payment_failed event:', err);
      }
    });
  }

  // Update order status if exists
  const { data: order } = await supabase
    .from('orders')
    .select('order_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (order) {
    await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'unpaid',
      })
      .eq('order_id', order.order_id);

    console.log('[stripe-webhook] Order status updated to cancelled:', order.order_id);
  }
}

/**
 * Handle invoice.paid (for subscription or manual invoices)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.paid:', invoice.id);

  // Track invoice payment as engagement event
  const metadata = invoice.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;

  if (companyId) {
    await supabase.from('engagement_events').insert({
      company_id: companyId,
      contact_id: contactId,
      source: 'stripe',
      source_event_id: invoice.id,
      event_name: 'invoice_paid',
      value: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency?.toUpperCase() || 'GBP',
      meta: {
        invoice_number: invoice.number,
        stripe_invoice_id: invoice.id,
      },
    }).catch(err => {
      if (!err.message?.includes('duplicate') && err.code !== '23505') {
        console.error('[stripe-webhook] Failed to track invoice_paid event:', err);
      }
    });
  }
}

/**
 * Handle charge.refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing charge.refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;

  // Find order by payment_intent_id
  const { data: order } = await supabase
    .from('orders')
    .select('order_id, company_id, contact_id, total_amount, currency')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!order) {
    console.log('[stripe-webhook] No order found for refunded charge:', charge.id);
    return;
  }

  // Update order payment status
  const refundAmount = (charge.amount_refunded || 0) / 100;
  const totalAmount = order.total_amount;

  const newPaymentStatus = refundAmount >= totalAmount ? 'refunded' : 'partially_refunded';

  await supabase
    .from('orders')
    .update({
      payment_status: newPaymentStatus,
    })
    .eq('order_id', order.order_id);

  // Track refund as engagement event
  await supabase.from('engagement_events').insert({
    company_id: order.company_id,
    contact_id: order.contact_id,
    source: 'stripe',
    source_event_id: charge.id,
    event_name: 'charge_refunded',
    value: refundAmount,
    currency: order.currency,
    meta: {
      order_id: order.order_id,
      refund_amount: refundAmount,
      total_refunded: (charge.amount_refunded || 0) / 100,
    },
  }).catch(err => {
    if (!err.message?.includes('duplicate') && err.code !== '23505') {
      console.error('[stripe-webhook] Failed to track charge_refunded event:', err);
    }
  });

  console.log('[stripe-webhook] Order refund processed:', order.order_id);
}
