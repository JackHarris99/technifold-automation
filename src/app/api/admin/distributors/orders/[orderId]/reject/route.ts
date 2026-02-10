/**
 * POST /api/admin/distributors/orders/[orderId]/reject
 * Admin rejects a distributor order with a reason
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

interface RejectData {
  reason: string;
  rejected_by: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await context.params;
    const body = await request.json() as RejectData;

    // Validate request body
    if (!body.reason || typeof body.reason !== 'string' || !body.reason.trim()) {
      return NextResponse.json({ error: 'Invalid request: reason is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('distributor_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending_review') {
      return NextResponse.json({ error: 'Order has already been reviewed' }, { status: 400 });
    }

    // Update order status to rejected
    const { error: updateError } = await supabase
      .from('distributor_orders')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: body.rejected_by,
        rejection_reason: body.reason,
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('[Reject Order] Failed to update order:', updateError);
      return NextResponse.json({ error: 'Failed to reject order' }, { status: 500 });
    }

    // TODO: Send notification email to distributor about rejection

    return NextResponse.json({
      success: true,
      message: 'Order rejected successfully',
    });
  } catch (error: any) {
    console.error('[Reject Order] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
