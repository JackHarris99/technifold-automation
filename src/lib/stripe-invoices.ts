/**
 * Stripe Invoice Creation Library
 * Handles invoice-led ordering for consumables and quotes
 */

import Stripe from 'stripe';
import { getSupabaseClient } from './supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

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
      console.warn(`EU customer ${company_id} missing VAT number`);
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

    // 1. Get company and contact details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_name, country, vat_number, eori_number, stripe_customer_id')
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

    // 2. Calculate totals and VAT
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const { vat_amount, vat_rate, vat_exempt_reason } = calculateVAT(subtotal, company.country, company.vat_number);
    const total = subtotal + vat_amount;

    // 3. Create or retrieve Stripe Customer
    let stripeCustomerId = company.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: contact.email,
        name: company.company_name,
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

    // 4. Create invoice line items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        amount: Math.round(item.unit_price * item.quantity * 100), // Convert to pence
        currency: currency.toLowerCase(),
        description: `${item.product_code} - ${item.description}`,
        metadata: {
          product_code: item.product_code,
          quantity: item.quantity.toString(),
        }
      });
    }

    // 5. Add VAT line item if applicable
    if (vat_amount > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        amount: Math.round(vat_amount * 100),
        currency: currency.toLowerCase(),
        description: `VAT (${(vat_rate * 100).toFixed(0)}%)`,
      });
    }

    // 6. Create invoice
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 0, // Due on receipt
      auto_advance: true, // Auto-finalize
      description: notes || undefined,
      metadata: {
        company_id,
        contact_id,
        offer_key: offer_key || '',
        campaign_key: campaign_key || '',
        vat_exempt_reason: vat_exempt_reason || '',
      },
      footer: vat_exempt_reason ? `VAT: ${vat_exempt_reason}` : undefined,
    });

    // 7. Finalize invoice (makes it immutable and sendable)
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

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

    // 9. Create order record in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        company_id,
        contact_id,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: stripeCustomerId,
        items: items,
        subtotal,
        tax_amount: vat_amount,
        total_amount: total,
        currency: currency.toUpperCase(),
        status: 'sent',
        payment_status: 'unpaid',
        invoice_status: 'sent',
        invoice_url: finalizedInvoice.hosted_invoice_url,
        invoice_pdf_url: finalizedInvoice.invoice_pdf,
        invoice_sent_at: new Date().toISOString(),
        offer_key,
        campaign_key,
        meta: {
          vat_rate,
          vat_exempt_reason,
          contact_name: contact.full_name || contact.first_name,
          company_name: company.company_name,
        }
      })
      .select('order_id')
      .single();

    if (orderError || !order) {
      console.error('Failed to create order record:', orderError);
      // Invoice was created in Stripe but failed to save to DB
      // We'll rely on webhooks to create the record later
    }

    return {
      success: true,
      order_id: order?.order_id,
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
    await stripe.invoices.voidInvoice(stripeInvoiceId);

    // Update order in Supabase
    const supabase = getSupabaseClient();
    await supabase
      .from('orders')
      .update({
        invoice_status: 'void',
        status: 'cancelled',
        invoice_voided_at: new Date().toISOString(),
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
