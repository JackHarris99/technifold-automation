/**
 * GET /api/track-order
 * Track order by order ID and email
 * Public endpoint for customers to check their order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId || !email) {
      return NextResponse.json(
        { error: 'Order ID and email are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Find order with matching ID and contact email
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        items,
        subtotal,
        tax_amount,
        total_amount,
        currency,
        status,
        created_at,
        tracking_number,
        carrier,
        estimated_delivery,
        shipped_at,
        completed_at,
        contact_id
      `)
      .eq('order_id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify email matches the contact
    const { data: contact } = await supabase
      .from('contacts')
      .select('email')
      .eq('contact_id', order.contact_id)
      .single();

    if (!contact || contact.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Remove contact_id from response (don't expose internal IDs)
    const { contact_id, ...orderData } = order;

    return NextResponse.json({ order: orderData });
  } catch (err) {
    console.error('[track-order] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
}
