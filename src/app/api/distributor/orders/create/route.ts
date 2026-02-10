/**
 * POST /api/distributor/orders/create
 * Create distributor order for admin review (NO Stripe invoice yet)
 * Invoice will be created after admin reviews stock availability
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentDistributor } from '@/lib/distributorAuth';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function calculateVAT(subtotal: number, country: string, vatNumber: string | null): {
  vat_amount: number;
  vat_rate: number;
  vat_exempt_reason: string | null;
} {
  const countryUpper = (country || 'GB').toUpperCase();

  // UK customers: 20% VAT
  if (countryUpper === 'GB' || countryUpper === 'UK') {
    return {
      vat_amount: subtotal * 0.20,
      vat_rate: 0.20,
      vat_exempt_reason: null
    };
  }

  // EU customers with valid VAT number: 0% (reverse charge)
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

  if (euCountries.includes(countryUpper)) {
    if (vatNumber && vatNumber.trim().length > 0) {
      return {
        vat_amount: 0,
        vat_rate: 0,
        vat_exempt_reason: 'EU Reverse Charge'
      };
    } else {
      return {
        vat_amount: subtotal * 0.20,
        vat_rate: 0.20,
        vat_exempt_reason: null
      };
    }
  }

  // Rest of world: 0% VAT (export)
  return {
    vat_amount: 0,
    vat_rate: 0,
    vat_exempt_reason: 'Export'
  };
}

export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentDistributor();

    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shipping_address_id, po_number } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!shipping_address_id) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        company_id,
        company_name,
        vat_number,
        billing_address_line_1,
        billing_address_line_2,
        billing_city,
        billing_state_province,
        billing_postal_code,
        billing_country
      `)
      .eq('company_id', distributor.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // No billing address validation - sales team will review and complete details
    // Get shipping address
    const { data: shippingAddress, error: shippingError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('address_id', shipping_address_id)
      .eq('company_id', distributor.company_id)
      .single();

    if (shippingError || !shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address not found' },
        { status: 404 }
      );
    }

    // No shipping address validation - sales team will review and complete details
    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );

    // Calculate shipping cost (predicted - admin can override)
    const destinationCountry = shippingAddress.country || 'GB';
    const { data: shippingCostData } = await supabase.rpc('calculate_shipping_cost', {
      p_country_code: destinationCountry,
      p_order_subtotal: subtotal,
    });
    const predictedShipping = shippingCostData || 0;

    // Calculate VAT
    const taxableAmount = subtotal + predictedShipping;
    const { vat_amount, vat_rate, vat_exempt_reason } = calculateVAT(
      taxableAmount,
      destinationCountry,
      company.vat_number
    );
    const total = taxableAmount + vat_amount;

    // Create distributor order (NO Stripe invoice yet)
    const { data: order, error: orderError } = await supabase
      .from('distributor_orders')
      .insert({
        company_id: distributor.company_id,
        user_id: distributor.user_id,
        user_email: distributor.email,
        user_name: distributor.full_name,
        status: 'pending_review',
        subtotal,
        predicted_shipping: predictedShipping,
        vat_amount,
        total_amount: total,
        currency: 'gbp',
        // Original billing address
        billing_address_line_1: company.billing_address_line_1,
        billing_address_line_2: company.billing_address_line_2,
        billing_city: company.billing_city,
        billing_state_province: company.billing_state_province,
        billing_postal_code: company.billing_postal_code,
        billing_country: company.billing_country,
        vat_number: company.vat_number,
        // Original shipping address
        shipping_address_id: shipping_address_id,
        shipping_address_line_1: shippingAddress.address_line_1,
        shipping_address_line_2: shippingAddress.address_line_2,
        shipping_city: shippingAddress.city,
        shipping_state_province: shippingAddress.state_province,
        shipping_postal_code: shippingAddress.postal_code,
        shipping_country: shippingAddress.country,
        // Optional PO number
        po_number: po_number || null,
      })
      .select('order_id')
      .single();

    if (orderError || !order) {
      console.error('[Create Distributor Order] Order insert error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item: any, index: number) => ({
      order_id: order.order_id,
      product_code: item.product_code,
      description: item.description || item.product_code,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.unit_price * item.quantity,
      status: 'pending_review',
    }));

    const { error: itemsError } = await supabase
      .from('distributor_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[Create Distributor Order] Items insert error:', itemsError);
      // Rollback order
      await supabase.from('distributor_orders').delete().eq('order_id', order.order_id);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    // Log engagement event
    try {
      await supabase
        .from('engagement_events')
        .insert({
          company_id: distributor.company_id,
          occurred_at: new Date().toISOString(),
          event_type: 'distributor_order_submitted',
          event_name: 'Distributor order submitted for review',
          source: 'distributor_portal',
          value: subtotal,
          currency: 'gbp',
          meta: {
            order_id: order.order_id,
            total_amount: total,
            items_count: items.length,
            submitted_by: distributor.full_name,
            submitted_by_email: distributor.email,
            shipping_country: destinationCountry,
          },
        });
    } catch (eventError) {
      console.error('[Create Distributor Order] Failed to log event:', eventError);
    }

    // Send confirmation email
    if (resend) {
      try {
        const itemsList = items.map((item: any) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #e8e8e8;">
              <div style="font-weight: 600; color: #0a0a0a; font-size: 14px;">${item.description}</div>
              <div style="color: #64748b; font-size: 12px; font-family: 'Courier New', monospace; margin-top: 4px;">${item.product_code}</div>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e8e8e8; text-align: center; color: #475569;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e8e8e8; text-align: right; font-weight: 600; color: #0a0a0a;">£${(item.unit_price * item.quantity).toFixed(2)}</td>
          </tr>`
        ).join('');

        await resend.emails.send({
          from: 'Technifold Orders <orders@technifold.com>',
          to: distributor.email,
          subject: `Order ${order.order_id} - Under Review`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

                <!-- Header with Logos -->
                <div style="background-color: #ffffff; padding: 32px 32px 24px; border-bottom: 1px solid #e8e8e8;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 32px; margin-bottom: 24px;">
                    <img src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png" alt="Technifold" style="height: 40px; width: auto;">
                    <img src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technicrease.png" alt="TechniCrease" style="height: 40px; width: auto;">
                    <img src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/creasestream.png" alt="CreaseStream" style="height: 40px; width: auto;">
                  </div>
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1e40af; text-align: center;">Order Received</h1>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #64748b; text-align: center;">Order ${order.order_id}</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 32px;">
                  <p style="margin: 0 0 24px; font-size: 16px; color: #0a0a0a; line-height: 1.6;">
                    Hi ${distributor.full_name},
                  </p>

                  <p style="margin: 0 0 24px; font-size: 16px; color: #0a0a0a; line-height: 1.6;">
                    Thank you for your order! We've received your request and our team is now reviewing stock availability.
                  </p>

                  <!-- Info Box -->
                  <div style="background-color: #dbeafe; border-left: 4px solid #1e40af; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6;">
                      <strong>What happens next:</strong><br>
                      We're checking stock availability for all items. Once confirmed, we'll create your invoice and send it via email. Your order will be shipped once payment is received.
                    </p>
                  </div>

                  <!-- Order Summary -->
                  <h2 style="margin: 32px 0 16px; font-size: 18px; font-weight: 600; color: #0a0a0a;">Order Summary</h2>

                  <div style="margin-bottom: 16px; padding: 12px; background-color: #f8fafc; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #64748b;">
                      <strong>Order ID:</strong> <span style="color: #1e40af; font-family: monospace;">${order.order_id}</span>
                      ${po_number ? `<br><strong>Your PO Number:</strong> <span style="font-family: monospace;">${po_number}</span>` : ''}
                    </p>
                  </div>

                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <thead>
                      <tr style="background-color: #f8fafc;">
                        <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                        <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsList}
                    </tbody>
                  </table>

                  <!-- Totals -->
                  <table style="width: 100%; margin-left: auto; max-width: 300px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Subtotal:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #0a0a0a; text-align: right; font-weight: 600;">£${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Predicted Shipping:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #0a0a0a; text-align: right; font-weight: 600;">${predictedShipping === 0 ? 'FREE' : `£${predictedShipping.toFixed(2)}`}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #64748b;">VAT:</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #0a0a0a; text-align: right; font-weight: 600;">£${vat_amount.toFixed(2)}</td>
                    </tr>
                    <tr style="border-top: 2px solid #e8e8e8;">
                      <td style="padding: 12px 0 0; font-size: 16px; color: #0a0a0a; font-weight: 700;">Estimated Total:</td>
                      <td style="padding: 12px 0 0; font-size: 18px; color: #16a34a; text-align: right; font-weight: 800;">£${total.toFixed(2)}</td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; font-size: 13px; color: #64748b; font-style: italic;">
                    Final amounts may vary based on stock availability and confirmed shipping costs.
                  </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e8e8e8;">
                  <p style="margin: 0 0 8px; font-size: 14px; color: #0a0a0a;">
                    Questions? Contact us:
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #1e40af;">
                    Email: <a href="mailto:info@technifold.co.uk" style="color: #1e40af; text-decoration: none;">info@technifold.co.uk</a><br>
                    Phone: +44 (0)1455 554491
                  </p>
                  <p style="margin: 16px 0 0; font-size: 12px; color: #64748b;">
                    © ${new Date().getFullYear()} Technifold International Ltd. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`[Create Distributor Order] Confirmation email sent to ${distributor.email}`);
      } catch (emailError) {
        console.error('[Create Distributor Order] Email error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      order_id: order.order_id,
      message: 'Order submitted for review',
    });

  } catch (error: any) {
    console.error('[Create Distributor Order] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error.message
      },
      { status: 500 }
    );
  }
}
