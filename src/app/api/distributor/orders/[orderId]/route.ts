/**
 * DELETE /api/distributor/orders/[orderId]
 * Delete a distributor order (for test orders)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    // Only directors and sales reps can delete orders
    if (!currentUser || !['director', 'sales_rep'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Check if order exists and is in pending_review status
    const { data: order, error: fetchError } = await supabase
      .from('distributor_orders')
      .select('order_id, status, company_id')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow deletion of pending_review orders (not already processed)
    if (order.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Only pending orders can be deleted' },
        { status: 400 }
      );
    }

    // Delete order items first (foreign key constraint)
    const { error: itemsError } = await supabase
      .from('distributor_order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('[Delete Distributor Order] Failed to delete items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to delete order items' },
        { status: 500 }
      );
    }

    // Delete the order
    const { error: orderError } = await supabase
      .from('distributor_orders')
      .delete()
      .eq('order_id', orderId);

    if (orderError) {
      console.error('[Delete Distributor Order] Failed to delete order:', orderError);
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      );
    }

    // Log deletion event
    try {
      await supabase.from('engagement_events').insert({
        company_id: order.company_id,
        occurred_at: new Date().toISOString(),
        event_type: 'distributor_order_deleted',
        event_name: 'Distributor order deleted',
        source: 'admin',
        meta: {
          order_id: orderId,
          deleted_by: currentUser.full_name,
          deleted_by_email: currentUser.email,
        },
      });
    } catch (eventError) {
      console.error('[Delete Distributor Order] Failed to log event:', eventError);
      // Don't fail the deletion if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Distributor Order] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
