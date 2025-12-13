/**
 * POST /api/admin/invoices/create
 * Create Stripe invoice from admin (quotes, manual orders)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createStripeInvoice } from '@/lib/stripe-invoices';

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authError = verifyAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { company_id, contact_id, items, currency, notes, offer_key, campaign_key } = body;

    // Validate input
    if (!company_id || !contact_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'company_id, contact_id, and items are required' },
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.product_code || !item.description || !item.quantity || !item.unit_price) {
        return NextResponse.json(
          { error: 'Each item must have product_code, description, quantity, and unit_price' },
          { status: 400 }
        );
      }
    }

    // Create invoice
    const result = await createStripeInvoice({
      company_id,
      contact_id,
      items,
      currency: currency || 'gbp',
      offer_key: offer_key || 'admin_quote',
      campaign_key: campaign_key || `admin_${new Date().toISOString().split('T')[0]}`,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: result.order_id,
      invoice_id: result.stripe_invoice_id,
      invoice_url: result.invoice_url,
      invoice_pdf_url: result.invoice_pdf_url,
    });

  } catch (error) {
    console.error('[admin/invoices/create] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
