/**
 * Reject Distributor Order API
 * Rejects a pending distributor order
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !['director', 'sales_rep'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;
    const { reason, rejected_by } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Update order status to rejected
    const { error: updateError } = await supabase
      .from('distributor_orders')
      .update({
        status: 'rejected',
        rejected_by: rejected_by,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('order_id', orderId)
      .eq('status', 'pending_review'); // Only update if still pending review

    if (updateError) {
      console.error('Error rejecting order:', updateError);
      return NextResponse.json({ error: 'Failed to reject order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reject order API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
