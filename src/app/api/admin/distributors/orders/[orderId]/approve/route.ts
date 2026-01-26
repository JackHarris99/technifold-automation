/**
 * Approve Distributor Order API
 * Approves a pending distributor order
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

    if (!currentUser || currentUser.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;
    const { approved_by } = await request.json();

    const supabase = getSupabaseClient();

    // Update order status to fully_fulfilled
    const { error: updateError } = await supabase
      .from('distributor_orders')
      .update({
        status: 'fully_fulfilled',
        reviewed_by: approved_by,
        reviewed_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('status', 'pending_review'); // Only update if still pending review

    if (updateError) {
      console.error('Error approving order:', updateError);
      return NextResponse.json({ error: 'Failed to approve order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in approve order API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
