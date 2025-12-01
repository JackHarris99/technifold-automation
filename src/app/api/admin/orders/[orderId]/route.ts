/**
 * GET /api/admin/orders/[orderId]
 * Fetch single order with full details
 *
 * PATCH /api/admin/orders/[orderId]
 * Update order status and tracking information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendShippingNotification } from '@/lib/resend-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabase = getSupabaseClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        companies!orders_company_id_fkey(company_name),
        contacts!orders_contact_id_fkey(full_name, email)
      `)
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('[orders-api] Error fetching order:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error('[orders-api] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const supabase = getSupabaseClient();

    const { status, tracking_number, carrier, estimated_delivery } = body;

    // Build update object
    const updates: any = {};

    if (status) {
      updates.status = status;

      // Set timestamp based on status
      if (status === 'processing') {
        // No specific timestamp
      } else if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
    }

    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (carrier !== undefined) updates.carrier = carrier;
    if (estimated_delivery !== undefined) updates.estimated_delivery = estimated_delivery;

    // Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_id', orderId)
      .select(`
        *,
        companies!orders_company_id_fkey(company_name),
        contacts!orders_contact_id_fkey(full_name, email)
      `)
      .single();

    if (error) {
      console.error('[orders-api] Error updating order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // If status changed to 'shipped' and we have tracking info, send shipping notification
    if (status === 'shipped' && tracking_number && carrier && order.contacts) {
      try {
        const emailResult = await sendShippingNotification({
          to: order.contacts.email,
          contactName: order.contacts.full_name,
          companyName: order.companies.company_name,
          orderId: order.order_id,
          trackingNumber: tracking_number,
          carrier: carrier,
          estimatedDelivery: estimated_delivery,
        });

        if (emailResult.success) {
          console.log('[orders-api] Shipping notification sent:', emailResult.messageId);
        } else {
          console.error('[orders-api] Failed to send shipping notification:', emailResult.error);
        }
      } catch (emailError) {
        console.error('[orders-api] Error sending shipping notification:', emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error('[orders-api] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
