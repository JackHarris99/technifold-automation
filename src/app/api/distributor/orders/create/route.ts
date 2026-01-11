/**
 * POST /api/distributor/orders/create
 * Create an order on behalf of a customer
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

    const { customer_id, items } = await request.json();

    if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer ID and items are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify customer belongs to this distributor
    const { data: customer } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', customer_id)
      .eq('account_owner', distributor.account_owner)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 403 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id: customer_id,
        invoice_date: new Date().toISOString().split('T')[0],
        subtotal: subtotal,
        total_amount: subtotal, // Add VAT/shipping logic if needed
        status: 'pending',
        created_by: distributor.company_name,
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
