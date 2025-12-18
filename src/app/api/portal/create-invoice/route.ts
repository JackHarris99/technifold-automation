/**
 * POST /api/portal/create-invoice
 * Create Stripe invoice from reorder portal
 * Requires HMAC token for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createStripeInvoice } from '@/lib/stripe-invoices';
import { verifyToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, contact_id, items, currency, offer_key, campaign_key } = body;

    // Verify HMAC token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract company_id from verified token (not from request body - security!)
    const company_id = payload.company_id;

    // Validate input
    if (!contact_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'contact_id and items are required' },
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

    // CRITICAL: Check if company has required addresses BEFORE creating invoice
    const checkResponse = await fetch(`${request.nextUrl.origin}/api/companies/check-details-needed?company_id=${company_id}`);
    const checkData = await checkResponse.json();

    if (checkData.details_needed) {
      return NextResponse.json(
        {
          error: 'Company address required',
          details: 'This company needs billing and shipping addresses before invoices can be created. Please add addresses first.',
          billing_address_needed: checkData.billing_address_needed,
          shipping_address_needed: checkData.shipping_address_needed,
          vat_needed: checkData.vat_needed,
        },
        { status: 400 }
      );
    }

    // Create invoice
    const result = await createStripeInvoice({
      company_id,
      contact_id,
      items,
      currency: currency || 'gbp',
      offer_key: offer_key || 'portal_reorder',
      campaign_key: campaign_key || `portal_${new Date().toISOString().split('T')[0]}`,
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
    console.error('[portal/create-invoice] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
