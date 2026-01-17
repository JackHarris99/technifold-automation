/**
 * POST /api/distributor/orders/create
 * Create Stripe invoice for distributor order
 * Same flow as quote builder - creates real Stripe invoice immediately
 */

export const maxDuration = 60; // Allow up to 60 seconds for Stripe API calls

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentDistributor } from '@/lib/distributorAuth';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripeClient;
}

function calculateVAT(subtotal: number, country: string, vatNumber: string | null): {
  vat_amount: number;
  vat_rate: number;
  vat_exempt_reason: string | null;
} {
  const countryUpper = (country || 'GB').toUpperCase();

  // UK customers: 20% VAT
  if (countryUpper === 'GB' || countryUpper === 'UK') {
    return {
      vat_amount: subtotal * 0.20,
      vat_rate: 0.20,
      vat_exempt_reason: null
    };
  }

  // EU customers with valid VAT number: 0% (reverse charge)
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

  if (euCountries.includes(countryUpper)) {
    if (vatNumber && vatNumber.trim().length > 0) {
      return {
        vat_amount: 0,
        vat_rate: 0,
        vat_exempt_reason: 'EU Reverse Charge'
      };
    } else {
      return {
        vat_amount: subtotal * 0.20,
        vat_rate: 0.20,
        vat_exempt_reason: null
      };
    }
  }

  // Rest of world: 0% VAT (export)
  return {
    vat_amount: 0,
    vat_rate: 0,
    vat_exempt_reason: 'Export'
  };
}

export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentDistributor();

    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shipping_address_id } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!shipping_address_id) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get company details (MUST have billing address before creating invoice)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        company_id,
        company_name,
        stripe_customer_id,
        vat_number,
        billing_address_line_1,
        billing_address_line_2,
        billing_city,
        billing_state_province,
        billing_postal_code,
        billing_country
      `)
      .eq('company_id', distributor.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // CRITICAL: Verify billing address exists
    if (!company.billing_address_line_1 || !company.billing_city || !company.billing_postal_code) {
      return NextResponse.json(
        {
          error: 'Billing address required',
          details: 'Your company must have a complete billing address before placing orders. Please contact support.'
        },
        { status: 400 }
      );
    }

    // Get shipping address (MUST exist - no creation during order)
    const { data: shippingAddress, error: shippingError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('address_id', shipping_address_id)
      .eq('company_id', distributor.company_id)
      .single();

    if (shippingError || !shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address not found. Please add a shipping address first.' },
        { status: 404 }
      );
    }

    // CRITICAL: Verify shipping address is complete
    if (!shippingAddress.address_line_1 || !shippingAddress.city || !shippingAddress.postal_code || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Incomplete shipping address. Please update the address with all required fields.' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );

    // Calculate shipping cost
    const destinationCountry = shippingAddress.country || 'GB';
    const { data: shippingCostData } = await supabase.rpc('calculate_shipping_cost', {
      p_country_code: destinationCountry,
      p_order_subtotal: subtotal,
    });
    const shippingCost = shippingCostData || 0;

    // Calculate VAT on subtotal + shipping
    const taxableAmount = subtotal + shippingCost;
    const { vat_amount, vat_rate, vat_exempt_reason } = calculateVAT(
      taxableAmount,
      destinationCountry,
      company.vat_number
    );
    const total = taxableAmount + vat_amount;

    // Create or retrieve Stripe Customer
    let stripeCustomerId = company.stripe_customer_id;

    const billingAddress = {
      line1: company.billing_address_line_1,
      line2: company.billing_address_line_2 || undefined,
      city: company.billing_city || undefined,
      state: company.billing_state_province || undefined,
      postal_code: company.billing_postal_code || undefined,
      country: company.billing_country || undefined,
    };

    const shippingDetails = {
      name: company.company_name,
      address: {
        line1: shippingAddress.address_line_1,
        line2: shippingAddress.address_line_2 || undefined,
        city: shippingAddress.city || undefined,
        state: shippingAddress.state_province || undefined,
        postal_code: shippingAddress.postal_code || undefined,
        country: shippingAddress.country || undefined,
      }
    };

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await getStripeClient().customers.create({
        name: company.company_name,
        address: billingAddress,
        shipping: shippingDetails,
        metadata: {
          company_id: distributor.company_id,
        }
      });
      stripeCustomerId = customer.id;

      // Save stripe_customer_id to company
      await supabase
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('company_id', distributor.company_id);
    } else {
      // Update existing customer's addresses
      await getStripeClient().customers.update(stripeCustomerId, {
        name: company.company_name,
        address: billingAddress,
        shipping: shippingDetails,
      });
    }

    // Add VAT number to Stripe if provided
    if (company.vat_number && company.vat_number.trim().length > 0) {
      try {
        const existingTaxIds = await getStripeClient().customers.listTaxIds(stripeCustomerId, { limit: 10 });
        const hasVatNumber = existingTaxIds.data.some(taxId =>
          taxId.value === company.vat_number && taxId.verification?.status !== 'unverified'
        );

        if (!hasVatNumber) {
          await getStripeClient().customers.createTaxId(stripeCustomerId, {
            type: 'eu_vat',
            value: company.vat_number,
          });
        }
      } catch (taxError) {
        console.error('[distributor-create-order] VAT number error:', taxError);
      }
    }

    // Create Stripe Invoice
    const stripeInvoice = await getStripeClient().invoices.create({
      customer: stripeCustomerId,
      currency: 'gbp',
      auto_advance: false,
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: {
        company_id: distributor.company_id,
        order_source: 'distributor_portal',
        shipping_address_id: shipping_address_id,
      },
    });

    // Add line items with product codes in metadata
    for (const item of items) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: `${item.product_code} - ${item.description || 'Product'}`,
        quantity: item.quantity,
        unit_amount: Math.round(item.unit_price * 100), // Convert to pence
        currency: 'gbp',
        metadata: {
          product_code: item.product_code, // CRITICAL: Product code included
        },
      });
    }

    // Add shipping if applicable
    if (shippingCost > 0) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: 'Shipping & Handling',
        quantity: 1,
        unit_amount: Math.round(shippingCost * 100),
        currency: 'gbp',
      });
    }

    // Add VAT if applicable
    if (vat_amount > 0) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        description: vat_exempt_reason
          ? `VAT (${(vat_rate * 100).toFixed(0)}% - ${vat_exempt_reason})`
          : `VAT (${(vat_rate * 100).toFixed(0)}%)`,
        quantity: 1,
        unit_amount: Math.round(vat_amount * 100),
        currency: 'gbp',
      });
    }

    // Finalize and send invoice
    const finalizedInvoice = await getStripeClient().invoices.finalizeInvoice(stripeInvoice.id);
    await getStripeClient().invoices.sendInvoice(finalizedInvoice.id);

    console.log('[distributor-create-order] Stripe invoice created and sent:', finalizedInvoice.id);

    // Store invoice in database
    const invoiceNotes = [
      vat_exempt_reason ? `VAT: ${vat_exempt_reason}` : null,
      'Source: Distributor Portal',
    ].filter(Boolean).join(', ') || null;

    const { data: dbInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id: distributor.company_id,
        stripe_invoice_id: finalizedInvoice.id,
        stripe_customer_id: stripeCustomerId,
        invoice_type: 'sale',
        status: 'open',
        payment_status: 'unpaid',
        currency: 'gbp',
        subtotal,
        shipping_amount: shippingCost,
        tax_amount: vat_amount,
        total_amount: total,
        shipping_address_id: shipping_address_id,
        shipping_country: destinationCountry,
        invoice_url: finalizedInvoice.hosted_invoice_url || undefined,
        invoice_pdf_url: finalizedInvoice.invoice_pdf || undefined,
        sent_at: new Date().toISOString(),
        notes: invoiceNotes,
      })
      .select('invoice_id')
      .single();

    if (invoiceError || !dbInvoice) {
      console.error('[distributor-create-order] Failed to create invoice record:', invoiceError);
      // Stripe invoice was still sent - return success with warning
      return NextResponse.json({
        success: true,
        invoice_id: finalizedInvoice.id,
        invoice_url: finalizedInvoice.hosted_invoice_url,
        warning: 'Stripe invoice created successfully but database record failed to save',
      });
    }

    // Store invoice items
    const invoiceItems = items.map((item: any, index: number) => ({
      invoice_id: dbInvoice.invoice_id,
      product_code: item.product_code,
      line_number: index + 1,
      description: item.description || item.product_code,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('[distributor-create-order] Failed to create invoice items:', itemsError);
    }

    // Log distributor order event to engagement_events
    try {
      await supabase
        .from('engagement_events')
        .insert({
          company_id: distributor.company_id,
          occurred_at: new Date().toISOString(),
          event_type: 'distributor_order',
          event_name: 'distributor_order_placed',
          source: 'distributor_portal',
          value: subtotal, // Use subtotal (excludes VAT/shipping) for consistency
          currency: 'gbp',
          meta: {
            invoice_id: dbInvoice.invoice_id,
            stripe_invoice_id: finalizedInvoice.id,
            total_amount: total,
            items_count: items.length,
            placed_by: distributor.full_name,
            placed_by_email: distributor.email,
            shipping_country: destinationCountry,
          },
        });

      console.log('[distributor-create-order] Event logged for company:', distributor.company_id);
    } catch (eventError) {
      console.error('[distributor-create-order] Failed to log event:', eventError);
      // Don't fail the request if event logging fails
    }

    return NextResponse.json({
      success: true,
      invoice_id: finalizedInvoice.id,
      db_invoice_id: dbInvoice.invoice_id,
      invoice_url: finalizedInvoice.hosted_invoice_url,
      invoice_pdf_url: finalizedInvoice.invoice_pdf,
      total_amount: total,
    });

  } catch (error: any) {
    console.error('[distributor-create-order] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error.message
      },
      { status: 500 }
    );
  }
}
