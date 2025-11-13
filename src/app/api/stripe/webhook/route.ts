/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed and other Stripe events
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, stripe } from '@/lib/stripe-client';
import { getSupabaseClient } from '@/lib/supabase';
import { sendOrderConfirmation } from '@/lib/resend-client';
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
  const purchaseType = session.metadata?.purchase_type || null;
  const shippingAddressId = session.metadata?.shipping_address_id || null;
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

  // Determine order type
  let orderType = 'consumables_reorder'; // Default
  if (purchaseType === 'purchase') {
    orderType = 'tool_purchase';
  } else if (purchaseType === 'rental') {
    // Rentals handled by subscription webhook - this shouldn't happen
    orderType = 'tool_rental_payment';
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      company_id: companyId,
      contact_id: contactId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string,
      shipping_address_id: shippingAddressId,
      order_type: orderType,
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

  // Create Stripe invoice for accounting/tax purposes
  try {
    const stripeCustomerId = session.customer as string;

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      auto_advance: false, // We'll finalize it manually
      collection_method: 'charge_automatically',
      metadata: {
        order_id: order.order_id,
        company_id: companyId,
      },
    });

    // Add line items to invoice
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
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
        invoice: invoice.id,
        description: 'VAT',
        amount: Math.round(taxAmount * 100),
        currency: currency.toLowerCase(),
      });
    }

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // Mark as paid (payment already happened via checkout)
    await stripe.invoices.pay(finalizedInvoice.id, {
      paid_out_of_band: true, // Payment happened outside this invoice
    });

    // Update order with invoice ID
    await supabase
      .from('orders')
      .update({ stripe_invoice_id: finalizedInvoice.id })
      .eq('order_id', order.order_id);

    console.log('[stripe-webhook] Stripe invoice created:', finalizedInvoice.id);
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
        orderId: order.order_id,
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

  // Update company_tool for any tools purchased
  const toolPurchases = items.filter(item => {
    // Check if this product is a tool
    return item.product_code && item.quantity > 0;
  });

  for (const toolItem of toolPurchases) {
    // Check if it's a tool
    const { data: product } = await supabase
      .from('products')
      .select('type')
      .eq('product_code', toolItem.product_code)
      .single();

    if (product?.type === 'tool') {
      // Upsert to company_tool
      await supabase
        .from('company_tool')
        .upsert({
          company_id: companyId,
          tool_code: toolItem.product_code,
          total_units: toolItem.quantity,
          first_seen_at: new Date().toISOString().split('T')[0],
          last_seen_at: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'company_id,tool_code',
          ignoreDuplicates: false
        })
        .then(({ error }) => {
          if (error) {
            console.error('[stripe-webhook] company_tool update failed:', error);
          } else {
            console.log(`[stripe-webhook] Updated company_tool: ${toolItem.product_code}`);
          }
        });
    }
  }

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
        order_id: order.order_id,
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

  // Note: Zoho integration removed - using Stripe invoices only
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

/**
 * Handle subscription creation (for tool rentals)
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing customer.subscription.created:', subscription.id);

  const metadata = subscription.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;
  const purchaseType = metadata.purchase_type;
  const shippingAddressId = metadata.shipping_address_id;

  if (!companyId || purchaseType !== 'rental') {
    console.log('[stripe-webhook] Skipping non-rental subscription:', subscription.id);
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
  await supabase.from('engagement_events').insert({
    company_id: companyId,
    contact_id: contactId,
    source: 'stripe',
    source_event_id: subscription.id,
    event_name: 'rental_started',
    value: monthlyPrice,
    currency: (firstItem.price.currency || 'gbp').toUpperCase(),
    meta: {
      rental_id: rental.rental_id,
      serial_number: rental.serial_number,
      product_code: productCode,
      has_trial: !!subscription.trial_end,
    },
  }).catch(err => {
    if (!err.message?.includes('duplicate') && err.code !== '23505') {
      console.error('[stripe-webhook] Failed to track rental_started event:', err);
    }
  });
}

/**
 * Handle subscription updates (status changes, payment failures)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing customer.subscription.updated:', subscription.id);

  // Find rental agreement
  const { data: rental } = await supabase
    .from('rental_agreements')
    .select('rental_id, status')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!rental) {
    console.log('[stripe-webhook] No rental found for subscription:', subscription.id);
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
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing customer.subscription.deleted:', subscription.id);

  // Find and update rental agreement
  const { data: rental } = await supabase
    .from('rental_agreements')
    .select('rental_id, company_id, contact_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!rental) {
    console.log('[stripe-webhook] No rental found for deleted subscription:', subscription.id);
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
  await supabase.from('engagement_events').insert({
    company_id: rental.company_id,
    contact_id: rental.contact_id,
    source: 'stripe',
    source_event_id: subscription.id,
    event_name: 'rental_cancelled',
    meta: {
      rental_id: rental.rental_id,
      reason: subscription.cancellation_details?.reason,
    },
  }).catch(err => {
    if (!err.message?.includes('duplicate') && err.code !== '23505') {
      console.error('[stripe-webhook] Failed to track rental_cancelled event:', err);
    }
  });
}
