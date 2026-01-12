/**
 * POST /api/distributor/orders/create
 * Create an order for the distributor themselves
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentDistributor } from '@/lib/distributorAuth';

export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentDistributor();

    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );

    // Create invoice for the distributor company
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id: distributor.company_id,
        invoice_date: new Date().toISOString().split('T')[0],
        subtotal: subtotal,
        total_amount: subtotal, // Add VAT/shipping logic if needed
        status: 'pending',
        created_by: 'Distributor Portal',
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('[Distributor Create Order] Error creating invoice:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    // Create invoice line items
    const lineItems = items.map((item: any) => ({
      invoice_id: invoice.invoice_id,
      product_code: item.product_code,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.unit_price * item.quantity,
    }));

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItems);

    if (lineItemsError) {
      console.error('[Distributor Create Order] Error creating line items:', lineItemsError);
      // Rollback invoice if line items failed
      await supabase.from('invoices').delete().eq('invoice_id', invoice.invoice_id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
    });
  } catch (error) {
    console.error('[Distributor Create Order] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the order' },
      { status: 500 }
    );
  }
}
