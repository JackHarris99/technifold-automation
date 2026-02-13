/**
 * POST /api/customer/orders/create
 * Customer submits order for review (does NOT create invoice)
 * Order goes to pending_review and sales team approves it
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortalAuth } from '@/lib/portalAuth';
import { getSupabaseClient } from '@/lib/supabase';
import { notifyOrderSubmitted } from '@/lib/salesNotifications';

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

    // Shipping address is optional - admin can add it during review
    // No validation needed

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
      .select('company_id, company_name, account_owner, billing_address_line_1, billing_address_line_2, billing_city, billing_state_province, billing_postal_code, billing_country, vat_number, country')
      .eq('company_id', auth.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Fetch shipping address (optional - can be added during review)
    let shippingAddress = null;
    if (shipping_address_id) {
      const { data, error: addressError } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('address_id', shipping_address_id)
        .eq('company_id', company.company_id)
        .single();

      if (!addressError && data) {
        shippingAddress = data;
      }
      // If address fetch fails, continue without it (no friction)
    }

    // Calculate VAT
    // Use billing_country (where country is actually stored), fallback to country field, then GB
    const companyCountry = company.billing_country || company.country || 'GB';
    const isUK = ['GB', 'UK'].includes(companyCountry.toUpperCase());
    const isEU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'].includes(companyCountry.toUpperCase());
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

    // Calculate shipping cost (same as pricing preview)
    // Use shipping address country if available, otherwise use company country (defaulting to GB)
    const shippingCountry = shippingAddress?.country || companyCountry;
    const { data: shippingCost } = await supabase.rpc('calculate_shipping_cost', {
      p_country_code: shippingCountry,
      p_order_subtotal: subtotal,
    });
    const predicted_shipping = shippingCost || 15; // Use calculated or fallback to 15

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
        user_id: null, // NULL for customer orders (user_id references distributor_users)
        customer_user_id: auth.user_id || null, // Customer user_id from customer_users table
        user_email: auth.email || 'no-email@portal.com', // Customer email from session
        user_name: auth.full_name || company.company_name, // Customer name from session
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
        shipping_address_line_1: shippingAddress?.address_line_1 || null,
        shipping_address_line_2: shippingAddress?.address_line_2 || null,
        shipping_city: shippingAddress?.city || null,
        shipping_state_province: shippingAddress?.state_province || null,
        shipping_postal_code: shippingAddress?.postal_code || null,
        shipping_country: shippingAddress?.country || null,
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

    // Log engagement event (skip if admin preview session)
    if (!auth.internal_preview) {
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
            shipping_country: shippingAddress?.country || company.country || 'Unknown',
          },
        });
      } catch (e) {
        console.error('[Customer Order Create] Failed to log event:', e);
        // Non-blocking
      }
    }

    // Send notification to sales rep (same as invoice paid notifications)
    if (company?.account_owner) {
      const { data: user } = await supabase
        .from('users')
        .select('user_id, email, full_name')
        .eq('sales_rep_id', company.account_owner)
        .single();

      if (user) {
        notifyOrderSubmitted({
          user_id: user.user_id,
          user_email: user.email,
          user_name: user.full_name || user.email,
          order_id,
          company_id: company.company_id,
          company_name: company.company_name,
          order_type: 'customer',
          total_amount,
          items_count: items.length,
        }).catch(err => console.error('[Customer Order Create] Notification failed:', err));
      }
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
