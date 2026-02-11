/**
 * POST /api/customer/orders/create
 * Customer submits order for review (does NOT create invoice)
 * Order goes to pending_review and sales team approves it
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortalAuth } from '@/lib/portalAuth';
import { getSupabaseClient } from '@/lib/supabase';

interface OrderItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping_address_id, po_number, token } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!shipping_address_id) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Get authentication (token or session)
    const auth = await getPortalAuth(token);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, billing_address_line_1, billing_address_line_2, billing_city, billing_state_province, billing_postal_code, billing_country, vat_number, country')
      .eq('company_id', auth.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Fetch shipping address
    const { data: shippingAddress, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('address_id', shipping_address_id)
      .eq('company_id', company.company_id)
      .single();

    if (addressError || !shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address not found or does not belong to company' },
        { status: 404 }
      );
    }

    // Calculate VAT
    const isUK = ['GB', 'UK'].includes(company.country?.toUpperCase() || '');
    const isEU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'].includes(company.country?.toUpperCase() || '');
    const hasVAT = !!company.vat_number;

    let vatRate = 0;
    if (isUK) {
      vatRate = 0.20; // UK: 20% VAT
    } else if (isEU && !hasVAT) {
      vatRate = 0.20; // EU without VAT number: 20%
    } else if (isEU && hasVAT) {
      vatRate = 0; // EU with VAT number: reverse charge
    } else {
      vatRate = 0; // Rest of world: no VAT
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: OrderItem) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    const predicted_shipping = 15; // Default shipping estimate
    const vat_amount = (subtotal + predicted_shipping) * vatRate;
    const total_amount = subtotal + predicted_shipping + vat_amount;

    // Generate order ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const order_id = `CO-${timestamp}-${random}`;

    // Create order record
    const { error: orderError } = await supabase
      .from('distributor_orders')
      .insert({
        order_id,
        company_id: company.company_id,
        user_id: null, // Customer orders don't have user_id
        user_email: auth.contact_id || 'customer@portal.com', // Placeholder
        user_name: company.company_name,
        status: 'pending_review',
        order_type: 'customer', // Mark as customer order
        subtotal,
        predicted_shipping,
        vat_amount,
        total_amount,
        currency: 'GBP',
        billing_address_line_1: company.billing_address_line_1,
        billing_address_line_2: company.billing_address_line_2,
        billing_city: company.billing_city,
        billing_state_province: company.billing_state_province,
        billing_postal_code: company.billing_postal_code,
        billing_country: company.billing_country,
        vat_number: company.vat_number,
        shipping_address_line_1: shippingAddress.address_line_1,
        shipping_address_line_2: shippingAddress.address_line_2,
        shipping_city: shippingAddress.city,
        shipping_state_province: shippingAddress.state_province,
        shipping_postal_code: shippingAddress.postal_code,
        shipping_country: shippingAddress.country,
        po_number: po_number || null,
      });

    if (orderError) {
      console.error('[Customer Order Create] Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: OrderItem) => ({
      item_id: `${order_id}-${item.product_code}`,
      order_id,
      product_code: item.product_code,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price,
      status: 'pending_review',
    }));

    const { error: itemsError } = await supabase
      .from('distributor_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[Customer Order Create] Error creating items:', itemsError);
      // Rollback: delete the order
      await supabase
        .from('distributor_orders')
        .delete()
        .eq('order_id', order_id);

      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Log engagement event
    try {
      await supabase.from('engagement_events').insert({
        contact_id: auth.contact_id || null,
        company_id: company.company_id,
        occurred_at: new Date().toISOString(),
        event_type: 'customer_order_submitted',
        event_name: 'Customer order submitted for review',
        source: 'customer_portal',
        meta: {
          order_id,
          items_count: items.length,
          total_amount,
          shipping_country: shippingAddress.country,
        },
      });
    } catch (e) {
      console.error('[Customer Order Create] Failed to log event:', e);
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      order_id,
      message: 'Order submitted for review',
    });
  } catch (error: any) {
    console.error('[Customer Order Create] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
