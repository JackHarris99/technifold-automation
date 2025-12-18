/**
 * Stripe Invoice Creation Library
 * Handles invoice-led ordering for consumables and quotes
 */

import Stripe from 'stripe';
import { getSupabaseClient } from './supabase';

// Lazy-load Stripe client to avoid build-time errors
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
  unit_price: number; // In pounds (not pence)
}

interface CreateInvoiceParams {
  company_id: string;
  contact_id: string;
  items: InvoiceLineItem[];
  currency?: string;
  offer_key?: string;
  campaign_key?: string;
  notes?: string;
}

interface CreateInvoiceResult {
  success: boolean;
  order_id?: string;
  stripe_invoice_id?: string;
  invoice_url?: string;
  invoice_pdf_url?: string;
  error?: string;
}

/**
 * Calculate VAT based on customer country
 */
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
      // EU customer without VAT number - should collect VAT (or refuse sale)
      console.warn(`EU customer in ${countryUpper} missing VAT number`);
      return {
        vat_amount: 0,
        vat_rate: 0,
        vat_exempt_reason: 'EU Export - VAT to be collected'
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

/**
 * Create Stripe invoice for an order
 */
export async function createStripeInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
  const { company_id, contact_id, items, currency = 'gbp', offer_key, campaign_key, notes } = params;

  try {
    const supabase = getSupabaseClient();

    // 1. Get company and contact details (including billing address)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        company_name,
        country,
        vat_number,
        eori_number,
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
      return { success: false, error: 'Company not found' };
    }

    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('email, full_name, first_name')
      .eq('contact_id', contact_id)
      .single();

    if (contactError || !contact) {
      return { success: false, error: 'Contact not found' };
    }

    // 2. Get shipping address (full details)
    const { data: shippingAddress } = await supabase
      .from('shipping_addresses')
      .select('address_line_1, address_line_2, city, state_province, postal_code, country')
      .eq('company_id', company_id)
      .eq('is_default', true)
      .single();

    const destinationCountry = shippingAddress?.country || company.country || 'GB';

    // 3. Calculate subtotal and shipping
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    // Calculate shipping cost using SQL function
    const { data: shippingData } = await supabase.rpc('calculate_shipping_cost', {
      p_country_code: destinationCountry,
      p_order_subtotal: subtotal,
    });
    const shippingCost = shippingData || 0;

    // 4. Calculate VAT on subtotal + shipping (shipping is taxable in UK/EU)
    const taxableAmount = subtotal + shippingCost;
    const { vat_amount, vat_rate, vat_exempt_reason } = calculateVAT(taxableAmount, destinationCountry, company.vat_number);
    const total = taxableAmount + vat_amount;

    // 3. Create or retrieve Stripe Customer (with billing address)
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

      // Update company with Stripe customer ID
      await supabase
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('company_id', company_id);
    }

    // 4. Create draft invoice first (with billing and shipping addresses)
    const invoice = await getStripeClient().invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 0, // Due on receipt
      auto_advance: false, // We'll finalize manually after adding items
      description: notes || undefined,
      // Billing address on invoice
      customer_address: company.billing_address_line_1 ? {
        line1: company.billing_address_line_1,
        line2: company.billing_address_line_2 || undefined,
        city: company.billing_city || undefined,
        state: company.billing_state_province || undefined,
        postal_code: company.billing_postal_code || undefined,
        country: company.billing_country || undefined,
      } : undefined,
      // Shipping address on invoice
      customer_shipping: shippingAddress ? {
        name: company.company_name,
        address: {
          line1: shippingAddress.address_line_1,
          line2: shippingAddress.address_line_2 || undefined,
          city: shippingAddress.city || undefined,
          state: shippingAddress.state_province || undefined,
          postal_code: shippingAddress.postal_code || undefined,
          country: shippingAddress.country || undefined,
        }
      } : undefined,
      metadata: {
        company_id,
        contact_id,
        offer_key: offer_key || '',
        campaign_key: campaign_key || '',
        vat_exempt_reason: vat_exempt_reason || '',
      },
      footer: vat_exempt_reason ? `VAT: ${vat_exempt_reason}` : undefined,
    });

    console.log('[stripe-invoices] Created draft invoice:', invoice.id);

    // 5. Add line items to the invoice
    for (const item of items) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id, // Attach to specific invoice
        amount: Math.round(item.unit_price * item.quantity * 100), // Convert to pence
        currency: currency.toLowerCase(),
        description: `${item.product_code} - ${item.description}`,
        metadata: {
          product_code: item.product_code,
          quantity: item.quantity.toString(),
        }
      });
      console.log('[stripe-invoices] Added item:', item.product_code, '£' + item.unit_price);
    }

    // 6. Add shipping line item if applicable
    if (shippingCost > 0) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        amount: Math.round(shippingCost * 100),
        currency: currency.toLowerCase(),
        description: `Shipping to ${destinationCountry}`,
      });
      console.log('[stripe-invoices] Added shipping:', '£' + shippingCost.toFixed(2));
    }

    // 7. Add VAT line item if applicable
    if (vat_amount > 0) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id, // Attach to specific invoice
        amount: Math.round(vat_amount * 100),
        currency: currency.toLowerCase(),
        description: `VAT (${(vat_rate * 100).toFixed(0)}%)`,
      });
      console.log('[stripe-invoices] Added VAT:', '£' + vat_amount.toFixed(2));
    }

    // 7. Finalize invoice (makes it immutable and sendable)
    const finalizedInvoice = await getStripeClient().invoices.finalizeInvoice(invoice.id);
    console.log('[stripe-invoices] Finalized invoice. Total:', finalizedInvoice.amount_due / 100);

    // 8. Send invoice via Resend (NOT Stripe's automatic email)
    const { sendInvoiceEmail } = await import('./resend-client');
    const invoiceEmailResult = await sendInvoiceEmail({
      to: contact.email,
      contactName: contact.full_name || contact.first_name || '',
      companyName: company.company_name,
      invoiceNumber: finalizedInvoice.number || invoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url || '',
      invoicePdfUrl: finalizedInvoice.invoice_pdf,
      items: items,
      subtotal,
      shippingAmount: shippingCost,
      taxAmount: vat_amount,
      totalAmount: total,
      currency: currency.toUpperCase(),
      vatExemptReason: vat_exempt_reason,
    });

    if (!invoiceEmailResult.success) {
      console.error('[stripe-invoices] Failed to send invoice email via Resend:', invoiceEmailResult.error);
      // Don't fail the whole invoice creation, just log the error
      // Invoice URL is still accessible via Stripe dashboard
    }

    // 9. Create invoice record in Supabase (new invoices table)
    console.log('[stripe-invoices] Creating invoice record in Supabase...');
    const { data: invoiceRecord, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id,
        contact_id,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: stripeCustomerId,
        invoice_number: finalizedInvoice.number || invoice.id,
        invoice_type: 'sale',
        currency: currency.toLowerCase(),
        subtotal,
        shipping_amount: shippingCost,
        shipping_country: destinationCountry,
        tax_amount: vat_amount,
        total_amount: total,
        status: 'sent',
        payment_status: 'unpaid',
        invoice_date: new Date(),
        invoice_url: finalizedInvoice.hosted_invoice_url,
        invoice_pdf_url: finalizedInvoice.invoice_pdf,
        sent_at: new Date().toISOString(),
        notes: notes || null,
      })
      .select('invoice_id')
      .single();

    if (invoiceError || !invoiceRecord) {
      console.error('[stripe-invoices] ❌ FAILED to create invoice record in Supabase:', invoiceError);
      console.error('[stripe-invoices] Error details:', JSON.stringify(invoiceError, null, 2));
      // Invoice was created in Stripe but failed to save to DB
      // We'll rely on webhooks to create the record later
      return {
        success: true,
        stripe_invoice_id: invoice.id,
        invoice_url: finalizedInvoice.hosted_invoice_url || undefined,
        invoice_pdf_url: finalizedInvoice.invoice_pdf || undefined,
      };
    }

    console.log('[stripe-invoices] ✅ Invoice record created:', invoiceRecord.invoice_id);

    // 10. Create invoice line items (new invoice_items table)
    const lineItemsToInsert = items.map((item, index) => ({
      invoice_id: invoiceRecord.invoice_id,
      product_code: item.product_code,
      line_number: index + 1,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(lineItemsToInsert);

    if (itemsError) {
      console.error('[stripe-invoices] ❌ FAILED to create invoice items:', itemsError);
      console.error('[stripe-invoices] Error details:', JSON.stringify(itemsError, null, 2));
    } else {
      console.log('[stripe-invoices] ✅ Created', lineItemsToInsert.length, 'invoice line items');
    }

    return {
      success: true,
      order_id: invoiceRecord.invoice_id, // Keep compatible with existing code
      stripe_invoice_id: invoice.id,
      invoice_url: finalizedInvoice.hosted_invoice_url || undefined,
      invoice_pdf_url: finalizedInvoice.invoice_pdf || undefined,
    };

  } catch (error) {
    console.error('Error creating Stripe invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Void a Stripe invoice (cancel it)
 */
export async function voidStripeInvoice(stripeInvoiceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await getStripeClient().invoices.voidInvoice(stripeInvoiceId);

    // Update invoice in Supabase
    const supabase = getSupabaseClient();
    await supabase
      .from('invoices')
      .update({
        status: 'void',
        voided_at: new Date().toISOString(),
      })
      .eq('stripe_invoice_id', stripeInvoiceId);

    return { success: true };
  } catch (error) {
    console.error('Error voiding invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
