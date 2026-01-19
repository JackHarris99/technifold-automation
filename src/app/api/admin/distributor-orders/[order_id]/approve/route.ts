/**
 * POST /api/admin/distributor-orders/[order_id]/approve
 * Admin approves distributor order and creates Stripe invoice
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { getStripeClient } from '@/lib/stripe';

interface ApprovalData {
  item_statuses: Record<string, 'in_stock' | 'back_order'>;
  back_order_dates: Record<string, string>;
  back_order_notes: Record<string, string>;

  // Address overrides (null if not changed)
  admin_billing_line_1: string | null;
  admin_billing_line_2: string | null;
  admin_billing_city: string | null;
  admin_billing_state: string | null;
  admin_billing_postal: string | null;
  admin_billing_country: string | null;

  admin_shipping_line_1: string | null;
  admin_shipping_line_2: string | null;
  admin_shipping_city: string | null;
  admin_shipping_state: string | null;
  admin_shipping_postal: string | null;
  admin_shipping_country: string | null;

  confirmed_shipping: number | null;
  shipping_override_reason: string | null;

  reviewed_by: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ order_id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id } = await context.params;
    const body = await request.json() as ApprovalData;

    const supabase = getSupabaseClient();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('distributor_orders')
      .select(`
        *,
        companies (
          company_name,
          stripe_customer_id,
          vat_number
        )
      `)
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending_review') {
      return NextResponse.json({ error: 'Order has already been reviewed' }, { status: 400 });
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('distributor_order_items')
      .select('*')
      .eq('order_id', order_id);

    if (itemsError || !items) {
      return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
    }

    // Filter in-stock items
    const inStockItems = items.filter(item => body.item_statuses[item.item_id] === 'in_stock');

    if (inStockItems.length === 0) {
      return NextResponse.json({ error: 'No items marked as in stock' }, { status: 400 });
    }

    // Determine final addresses (use admin override if provided, else use original)
    const finalBillingAddress = {
      line1: body.admin_billing_line_1 || order.billing_address_line_1,
      line2: body.admin_billing_line_2 || order.billing_address_line_2 || undefined,
      city: body.admin_billing_city || order.billing_city,
      state: body.admin_billing_state || order.billing_state_province || undefined,
      postal_code: body.admin_billing_postal || order.billing_postal_code,
      country: body.admin_billing_country || order.billing_country,
    };

    const finalShippingAddress = {
      name: order.companies.company_name,
      address: {
        line1: body.admin_shipping_line_1 || order.shipping_address_line_1,
        line2: body.admin_shipping_line_2 || order.shipping_address_line_2 || undefined,
        city: body.admin_shipping_city || order.shipping_city,
        state: body.admin_shipping_state || order.shipping_state_province || undefined,
        postal_code: body.admin_shipping_postal || order.shipping_postal_code,
        country: body.admin_shipping_country || order.shipping_country,
      },
    };

    // Determine final shipping cost
    const finalShipping = body.confirmed_shipping !== null ? body.confirmed_shipping : order.predicted_shipping;

    // Calculate totals for in-stock items
    const subtotal = inStockItems.reduce((sum, item) => sum + parseFloat(item.line_total.toString()), 0);
    const taxableAmount = subtotal + finalShipping;

    // VAT calculation (simplified - use order's original VAT rate)
    const originalTaxableAmount = parseFloat(order.subtotal.toString()) + parseFloat(order.predicted_shipping.toString());
    const vatRate = originalTaxableAmount > 0 ? parseFloat(order.vat_amount.toString()) / originalTaxableAmount : 0;
    const vatAmount = taxableAmount * vatRate;
    const totalAmount = subtotal + finalShipping + vatAmount;

    const stripe = getStripeClient();

    // 1. Create or update Stripe customer
    let stripeCustomerId = order.companies.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: order.user_email,
        name: order.companies.company_name,
        address: finalBillingAddress,
        shipping: finalShippingAddress,
        metadata: {
          company_id: order.company_id,
          source: 'distributor_order',
        },
      });
      stripeCustomerId = customer.id;

      // Update company with Stripe customer ID
      await supabase
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('company_id', order.company_id);
    } else {
      // Update existing customer
      await stripe.customers.update(stripeCustomerId, {
        email: order.user_email,
        address: finalBillingAddress,
        shipping: finalShippingAddress,
      });
    }

    // 2. Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      auto_advance: false,
      description: `Distributor Order ${order_id}`,
      metadata: {
        order_id: order_id,
        company_id: order.company_id,
        source: 'distributor_order',
      },
    });

    // 3. Add line items to invoice
    for (const item of inStockItems) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: `${item.product_code} - ${item.description}`,
        quantity: item.quantity,
        unit_amount: Math.round(parseFloat(item.unit_price.toString()) * 100),
        currency: 'gbp',
      });
    }

    // 4. Add shipping as line item
    if (finalShipping > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: 'Shipping',
        amount: Math.round(finalShipping * 100),
        currency: 'gbp',
      });
    }

    // 5. Finalize invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id, {
      auto_advance: false,
    });

    // 6. Send invoice
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    // 7. Create invoice record in database
    const { data: invoiceRecord, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id: order.company_id,
        stripe_invoice_id: finalizedInvoice.id,
        invoice_number: finalizedInvoice.number || undefined,
        invoice_date: new Date(finalizedInvoice.created * 1000).toISOString(),
        due_date: finalizedInvoice.due_date ? new Date(finalizedInvoice.due_date * 1000).toISOString() : undefined,
        subtotal: subtotal,
        tax_amount: vatAmount,
        total_amount: totalAmount,
        status: 'pending',
        currency: 'GBP',
      })
      .select('invoice_id')
      .single();

    if (invoiceError) {
      console.error('[Approve Order] Failed to create invoice record:', invoiceError);
    }

    const invoiceId = invoiceRecord?.invoice_id;

    // 8. Update order with review details
    await supabase
      .from('distributor_orders')
      .update({
        status: inStockItems.length === items.length ? 'fully_fulfilled' : 'partially_fulfilled',
        reviewed_by: body.reviewed_by,
        reviewed_at: new Date().toISOString(),
        confirmed_shipping: body.confirmed_shipping,
        shipping_override_reason: body.shipping_override_reason,
        admin_billing_address_line_1: body.admin_billing_line_1,
        admin_billing_address_line_2: body.admin_billing_line_2,
        admin_billing_city: body.admin_billing_city,
        admin_billing_state_province: body.admin_billing_state,
        admin_billing_postal_code: body.admin_billing_postal,
        admin_billing_country: body.admin_billing_country,
        admin_shipping_address_line_1: body.admin_shipping_line_1,
        admin_shipping_address_line_2: body.admin_shipping_line_2,
        admin_shipping_city: body.admin_shipping_city,
        admin_shipping_state_province: body.admin_shipping_state,
        admin_shipping_postal_code: body.admin_shipping_postal,
        admin_shipping_country: body.admin_shipping_country,
      })
      .eq('order_id', order_id);

    // 9. Update item statuses
    for (const item of items) {
      const status = body.item_statuses[item.item_id];
      const updateData: any = { status };

      if (status === 'in_stock') {
        updateData.status = 'fulfilled';
        updateData.fulfilled_invoice_id = invoiceId;
        updateData.fulfilled_at = new Date().toISOString();
      } else if (status === 'back_order') {
        updateData.back_order_date = new Date().toISOString();
        updateData.predicted_delivery_date = body.back_order_dates[item.item_id];
        updateData.back_order_notes = body.back_order_notes[item.item_id] || null;
      }

      await supabase
        .from('distributor_order_items')
        .update(updateData)
        .eq('item_id', item.item_id);
    }

    return NextResponse.json({
      success: true,
      invoice_id: invoiceId,
      stripe_invoice_id: finalizedInvoice.id,
      stripe_invoice_number: finalizedInvoice.number,
      status: inStockItems.length === items.length ? 'fully_fulfilled' : 'partially_fulfilled',
      in_stock_count: inStockItems.length,
      back_order_count: items.length - inStockItems.length,
    });

  } catch (error) {
    console.error('[Approve Distributor Order] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
