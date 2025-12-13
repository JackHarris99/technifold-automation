/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed and other Stripe events
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, stripe } from '@/lib/stripe-client';
import { getSupabaseClient } from '@/lib/supabase';
import { sendOrderConfirmation, sendTrialConfirmation } from '@/lib/resend-client';
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
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
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
      items,
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
      currency,
      status: 'paid',
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      notes: offerKey || campaignKey ? `Offer: ${offerKey || 'N/A'}, Campaign: ${campaignKey || 'N/A'}` : null,
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
  const { error: engagementErr } = await supabase.from('engagement_events').insert({
    company_id: companyId,
    contact_id: contactId,
    source: 'stripe',
    source_event_id: session.id,
    event_name: 'checkout_completed',
    offer_key: offerKey,
    value: total,
    currency,
    meta: {
      stripe_session_id: session.id,
      order_id: order.order_id,
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

  // Create order record
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      company_id: companyId,
      contact_id: contactId,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: paymentIntent.customer as string,
      order_type: 'consumables_reorder',
      items: lineItems,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency,
      status: 'paid',
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      notes: 'Embedded checkout (reorder portal)',
    })
    .select('order_id')
    .single();

  if (orderError) {
    console.error('[stripe-webhook] Failed to create order:', orderError);
    return;
  }

  console.log('[stripe-webhook] Order created from embedded checkout:', order.order_id);

  // Create Stripe invoice for this payment
  try {
    const stripeCustomerId = paymentIntent.customer as string;

    if (stripeCustomerId) {
      // Create invoice
      const invoice = await stripe.invoices.create({
        customer: stripeCustomerId,
        auto_advance: false,
        collection_method: 'charge_automatically',
        metadata: {
          order_id: order.order_id,
          company_id: companyId,
        },
      });

      // Add line items to invoice
      for (const item of lineItems) {
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: invoice.id,
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
          invoice: invoice.id,
          description: 'VAT (20%)',
          amount: Math.round(taxAmount * 100),
          currency: currency.toLowerCase(),
        });
      }

      // Finalize the invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

      // Mark as paid (payment already happened via PaymentIntent)
      await stripe.invoices.pay(finalizedInvoice.id, {
        paid_out_of_band: true,
      });

      // Update order with invoice ID
      await supabase
        .from('orders')
        .update({ stripe_invoice_id: finalizedInvoice.id })
        .eq('order_id', order.order_id);

      console.log('[stripe-webhook] Stripe invoice created:', finalizedInvoice.id);
    }
  } catch (invoiceError) {
    console.error('[stripe-webhook] Failed to create Stripe invoice:', invoiceError);
    // Don't fail - order is already created
  }

  // Insert order_items
  const orderItems = lineItems.map((item) => ({
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
  }

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
        orderId: order.order_id,
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
    event_name: 'embedded_checkout_completed',
    value: totalAmount,
    currency,
    meta: {
      payment_intent_id: paymentIntent.id,
      order_id: order.order_id,
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
        order_id: order.order_id,
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
 * Handle invoice.paid (for invoice-led orders and subscriptions)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = getSupabaseClient();

  console.log('[stripe-webhook] Processing invoice.paid:', invoice.id);

  const metadata = invoice.metadata || {};
  const companyId = metadata.company_id;
  const contactId = metadata.contact_id || null;

  // Update order status to paid
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

    // Check if this is an international shipment - if so, generate commercial invoice
    const { data: company } = await supabase
      .from('companies')
      .select('country')
      .eq('company_id', order.company_id)
      .single();

    if (company && company.country && company.country.toUpperCase() !== 'GB' && company.country.toUpperCase() !== 'UK') {
      console.log('[stripe-webhook] International order detected - generating commercial invoice');

      // Generate commercial invoice for customs clearance
      const { generateCommercialInvoice } = await import('@/lib/commercial-invoice');
      const invoiceResult = await generateCommercialInvoice({ order_id: order.order_id });

      if (invoiceResult.success) {
        console.log('[stripe-webhook] Commercial invoice generated:', invoiceResult.pdf_url);
      } else {
        console.error('[stripe-webhook] Failed to generate commercial invoice:', invoiceResult.error);
        // Don't fail the whole webhook - just log the error
      }
    }

    // Track payment event
    const { error: paidEventErr } = await supabase.from('engagement_events').insert({
      company_id: order.company_id,
      contact_id: order.contact_id,
      source: 'stripe',
      source_event_id: invoice.id,
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

  // Update order status to cancelled
  const { error } = await supabase
    .from('orders')
    .update({
      invoice_status: 'void',
      status: 'cancelled',
      invoice_voided_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    console.error('[stripe-webhook] Failed to update order on invoice.voided:', error);
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
  const { error: refundErr } = await supabase.from('engagement_events').insert({
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
  });
  if (refundErr && !refundErr.message?.includes('duplicate') && refundErr.code !== '23505') {
    console.error('[stripe-webhook] Failed to track charge_refunded event:', refundErr);
  }

  console.log('[stripe-webhook] Order refund processed:', order.order_id);
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
