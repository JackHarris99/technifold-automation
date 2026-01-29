/**
 * POST /api/admin/technicrease-quotes/[quote_id]/reject
 * Reject TechniCrease quote
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quote_id: string }> }
) {
  try {
    const { quote_id } = await params;
    const body = await request.json();
    const { reason } = body;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Update quote to rejected
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        approval_status: 'rejected',
        approved_by: user.user_id,
        approved_at: new Date().toISOString(),
        status: 'rejected',
      })
      .eq('quote_id', quote_id);

    if (updateError) {
      console.error('[reject-quote] Error:', updateError);
      return NextResponse.json({ error: 'Failed to reject quote' }, { status: 500 });
    }

    // TODO: Send email notification to customer with rejection reason

    return NextResponse.json({
      success: true,
      message: 'Quote rejected',
    });
  } catch (error) {
    console.error('[reject-quote] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reject quote' },
      { status: 500 }
    );
  }
}
