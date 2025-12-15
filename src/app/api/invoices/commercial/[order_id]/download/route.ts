/**
 * GET /api/invoices/commercial/[order_id]/download
 * Download commercial invoice HTML/PDF for international shipments
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCommercialInvoice } from '@/lib/commercial-invoice';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    const { order_id } = await params;

    // Verify order exists and is paid
    const supabase = getSupabaseClient();
    const { data: order } = await supabase
      .from('orders')
      .select('order_id, payment_status, company_id, items')
      .eq('order_id', order_id)
      .single();

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    if (order.payment_status !== 'paid') {
      return new NextResponse('Order not paid - commercial invoice not available', { status: 400 });
    }

    // Generate commercial invoice
    const result = await generateCommercialInvoice({ order_id });

    if (!result.success) {
      return new NextResponse(result.error || 'Failed to generate invoice', { status: 500 });
    }

    // For now, return a redirect to a rendering page
    // In production, you'd return actual PDF bytes
    return NextResponse.redirect(new URL(`/invoices/commercial/${order_id}`, request.url));

  } catch (error) {
    console.error('[commercial-invoice/download] Error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
