/**
 * POST /api/portal/create-invoice-static
 * Create Stripe invoice for STATIC quotes
 * Uses LOCKED prices from request (no recalculation)
 * Only calculates VAT and shipping
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
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

interface InvoiceLineItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number; // LOCKED price - will NOT be recalculated
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
    const body = await request.json();
    const { token, contact_id, items, currency = 'gbp', offer_key, campaign_key } = body;

    // Verify HMAC token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

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

    // Check if company has required addresses
    const checkResponse = await fetch(`${request.nextUrl.origin}/api/companies/check-details-needed?company_id=${company_id}`);
    const checkData = await checkResponse.json();

    if (checkData.details_needed) {
      return NextResponse.json(
        {
          error: 'Company address required',
          details: 'This company needs billing and shipping addresses before invoices can be created.',
          billing_address_needed: checkData.billing_address_needed,
          shipping_address_needed: checkData.shipping_address_needed,
          vat_needed: checkData.vat_needed,
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        company_name,
        country,
        vat_number,
        stripe_customer_id,
        billing_address_line_1,
        billing_address_line_2,
        billing_city,
        billing_state_province,
        billing_postal_code,
        billing_country
      `)
      .eq('company_id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get contact details
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('email, full_name')
      .eq('contact_id', contact_id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get shipping address
    const { data: shippingAddress } = await supabase
      .from('shipping_addresses')
      .select('address_line_1, address_line_2, city, state_province, postal_code, country')
      .eq('company_id', company_id)
      .eq('is_default', true)
      .single();

    const destinationCountry = shippingAddress?.country || company.country || 'GB';

    // Calculate subtotal using LOCKED prices (no recalculation)
    const subtotal = items.reduce((sum: number, item: InvoiceLineItem) =>
      sum + (item.unit_price * item.quantity), 0
    );

    // Calculate shipping cost
    const { data: shippingData } = await supabase.rpc('calculate_shipping_cost', {
      p_country_code: destinationCountry,
      p_order_subtotal: subtotal,
    });
    const shippingCost = shippingData || 0;

    // Calculate VAT on subtotal + shipping
    const taxableAmount = subtotal + shippingCost;
    const { vat_amount, vat_rate, vat_exempt_reason } = calculateVAT(taxableAmount, destinationCountry, company.vat_number);
    const total = taxableAmount + vat_amount;

    // Create or retrieve Stripe Customer
    let stripeCustomerId = company.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await getStripeClient().customers.create({
        email: contact.email,
        name: company.company_name,
        address: company.billing_address_line_1 ? {
          line1: company.billing_address_line_1,
          line2: company.billing_address_line_2 || undefined,
          city: company.billing_city || undefined,
          state: company.billing_state_province || undefined,
          postal_code: company.billing_postal_code || undefined,
          country: company.billing_country || undefined,
        } : undefined,
        metadata: {
          company_id,
          contact_id,
        }
      });
      stripeCustomerId = customer.id;

      await supabase
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('company_id', company_id);
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
        console.error('[create-invoice-static] VAT number error:', taxError);
      }
    }

    // Create Stripe Invoice
    const invoice = await getStripeClient().invoices.create({
      customer: stripeCustomerId,
      currency: currency.toLowerCase(),
      auto_advance: false,
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: {
        company_id,
        contact_id,
        offer_key: offer_key || 'portal_quote_static',
        campaign_key: campaign_key || `quote_${new Date().toISOString().split('T')[0]}`,
      },
    });

    // Add line items to invoice using LOCKED prices
    for (const item of items) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: Math.round(item.unit_price * 100), // Convert to pence
        currency: currency.toLowerCase(),
        metadata: {
          product_code: item.product_code,
        },
      });
    }

    // Add shipping if applicable
    if (shippingCost > 0) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        description: 'Shipping & Handling',
        quantity: 1,
        unit_amount: Math.round(shippingCost * 100),
        currency: currency.toLowerCase(),
      });
    }

    // Add VAT if applicable
    if (vat_amount > 0) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        description: vat_exempt_reason ? `VAT (${(vat_rate * 100).toFixed(0)}% - ${vat_exempt_reason})` : `VAT (${(vat_rate * 100).toFixed(0)}%)`,
        quantity: 1,
        unit_amount: Math.round(vat_amount * 100),
        currency: currency.toLowerCase(),
      });
    }

    // Finalize invoice
    const finalizedInvoice = await getStripeClient().invoices.finalizeInvoice(invoice.id);

    // Send invoice via email
    await getStripeClient().invoices.sendInvoice(finalizedInvoice.id);

    // Store order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        company_id,
        contact_id,
        stripe_invoice_id: finalizedInvoice.id,
        status: 'pending_payment',
        currency: currency.toUpperCase(),
        subtotal,
        shipping_cost: shippingCost,
        vat_amount,
        vat_rate,
        vat_exempt_reason,
        total_amount: total,
        offer_key: offer_key || 'portal_quote_static',
        campaign_key: campaign_key || `quote_${new Date().toISOString().split('T')[0]}`,
      })
      .select('order_id')
      .single();

    if (orderError || !order) {
      console.error('[create-invoice-static] Failed to create order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order record' },
        { status: 500 }
      );
    }

    // Store order items
    for (const item of items) {
      await supabase.from('order_items').insert({
        order_id: order.order_id,
        product_code: item.product_code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.unit_price * item.quantity,
      });
    }

    return NextResponse.json({
      success: true,
      order_id: order.order_id,
      invoice_id: finalizedInvoice.id,
      invoice_url: finalizedInvoice.hosted_invoice_url,
      invoice_pdf_url: finalizedInvoice.invoice_pdf,
    });

  } catch (error) {
    console.error('[create-invoice-static] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
