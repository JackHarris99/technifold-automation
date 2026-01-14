/**
 * POST /api/portal/create-invoice-interactive
 * Create Stripe invoice for INTERACTIVE quotes
 * RECALCULATES prices based on product type:
 * - TOOLS: Quantity-based discounts (1=0%, 2=10%, 3=20%, 4=30%, 5+=40%)
 * - CONSUMABLES: Tiered pricing via pricing-v2
 * - OTHER: Fixed price from products table
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { calculateCartPricing, CartItem } from '@/lib/pricing-v2';
import { notifyQuoteAccepted } from '@/lib/salesNotifications';
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

interface InvoiceLineItemInput {
  product_code: string;
  description: string;
  quantity: number;
  unit_price?: number; // Ignored - will be recalculated
}

interface InvoiceLineItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
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

    // IDEMPOTENCY CHECK: If this is a quote request, check if invoice already exists
    // Also fetch free_shipping flag for later use
    let quoteFreeShipping = false;
    if (payload.quote_id && payload.object_type === 'quote') {
      console.log(`[create-invoice-interactive] Checking idempotency for quote ${payload.quote_id}`);

      const supabase = getSupabaseClient();
      const { data: existingQuote } = await supabase
        .from('quotes')
        .select('quote_id, invoice_id, accepted_at, status, free_shipping')
        .eq('quote_id', payload.quote_id)
        .single();

      quoteFreeShipping = existingQuote?.free_shipping || false;

      if (existingQuote?.invoice_id) {
        // Invoice already exists - return it instead of creating duplicate
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('invoice_id, stripe_invoice_id, invoice_url, invoice_pdf_url, total_amount')
          .eq('invoice_id', existingQuote.invoice_id)
          .single();

        if (existingInvoice) {
          console.log(`[create-invoice-interactive] Quote ${payload.quote_id} already has invoice ${existingInvoice.invoice_id} - returning existing`);
          return NextResponse.json({
            success: true,
            invoice_id: existingInvoice.stripe_invoice_id,
            db_invoice_id: existingInvoice.invoice_id,
            invoice_url: existingInvoice.invoice_url,
            invoice_pdf_url: existingInvoice.invoice_pdf_url,
            message: 'Invoice already exists for this quote',
            idempotent: true,
          });
        }
      }
    }

    // Validate input
    if (!contact_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'contact_id and items are required' },
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.product_code || !item.description || !item.quantity) {
        return NextResponse.json(
          { error: 'Each item must have product_code, description, and quantity' },
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

    // Fetch product details for pricing calculation
    const productCodes = items.map((item: InvoiceLineItemInput) => item.product_code);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, price, type, category, pricing_tier')
      .in('product_code', productCodes);

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Filter out zero-quantity items (used for quote display only, not invoicing)
    const itemsWithQuantity = items.filter((item: InvoiceLineItemInput) => item.quantity > 0);

    if (itemsWithQuantity.length === 0) {
      return NextResponse.json(
        { error: 'No items with quantity > 0 to invoice' },
        { status: 400 }
      );
    }

    // RECALCULATE PRICES based on product type
    const calculatedItems: InvoiceLineItem[] = [];

    // Separate items by product type (only items with quantity > 0)
    const toolItems = itemsWithQuantity.filter((item: InvoiceLineItemInput) => {
      const product = products.find(p => p.product_code === item.product_code);
      return product?.type === 'tool';
    });

    const consumableItems = itemsWithQuantity.filter((item: InvoiceLineItemInput) => {
      const product = products.find(p => p.product_code === item.product_code);
      return product?.type === 'consumable';
    });

    const otherItems = itemsWithQuantity.filter((item: InvoiceLineItemInput) => {
      const product = products.find(p => p.product_code === item.product_code);
      return product?.type !== 'tool' && product?.type !== 'consumable';
    });

    // TOOLS: Apply quantity-based discount tiers
    const totalToolQuantity = toolItems.reduce((sum: number, item: InvoiceLineItemInput) => sum + item.quantity, 0);
    let toolDiscountPercent = 0;

    if (totalToolQuantity >= 5) {
      toolDiscountPercent = 40;
    } else if (totalToolQuantity === 4) {
      toolDiscountPercent = 30;
    } else if (totalToolQuantity === 3) {
      toolDiscountPercent = 20;
    } else if (totalToolQuantity === 2) {
      toolDiscountPercent = 10;
    }

    for (const item of toolItems) {
      const product = products.find(p => p.product_code === item.product_code);
      if (!product) continue;

      const base_price = product.price || 0;
      const unit_price = base_price * (1 - toolDiscountPercent / 100);
      const line_total = unit_price * item.quantity;

      calculatedItems.push({
        product_code: item.product_code,
        description: item.description,
        quantity: item.quantity,
        unit_price,
        line_total,
      });
    }

    // CONSUMABLES: Apply tiered pricing via pricing-v2
    if (consumableItems.length > 0) {
      const cartItems: CartItem[] = consumableItems.map((item: InvoiceLineItemInput) => {
        const product = products.find(p => p.product_code === item.product_code);
        return {
          product_code: item.product_code,
          quantity: item.quantity,
          category: product?.category || '',
          base_price: product?.price || 0,
          type: product?.type || 'consumable',
          pricing_tier: product?.pricing_tier,
        };
      });

      const pricingResult = await calculateCartPricing(cartItems);

      for (const pricedItem of pricingResult.items) {
        const originalItem = consumableItems.find((item: InvoiceLineItemInput) => item.product_code === pricedItem.product_code);
        if (!originalItem) continue;

        calculatedItems.push({
          product_code: pricedItem.product_code,
          description: originalItem.description,
          quantity: pricedItem.quantity,
          unit_price: pricedItem.unit_price,
          line_total: pricedItem.line_total,
        });
      }
    }

    // OTHER PRODUCTS: Fixed price, no discounts
    for (const item of otherItems) {
      const product = products.find(p => p.product_code === item.product_code);
      if (!product) continue;

      const unit_price = product.price || 0;
      const line_total = unit_price * item.quantity;

      calculatedItems.push({
        product_code: item.product_code,
        description: item.description,
        quantity: item.quantity,
        unit_price,
        line_total,
      });
    }

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

    // Calculate subtotal using RECALCULATED prices
    const subtotal = calculatedItems.reduce((sum, item) => sum + item.line_total, 0);

    // Calculate shipping cost - check free_shipping override from quote
    let shippingCost = 0;
    if (quoteFreeShipping) {
      console.log(`[create-invoice-interactive] Free shipping enabled for quote ${payload.quote_id} - setting shipping to £0`);
      shippingCost = 0;
    } else {
      const { data: shippingData } = await supabase.rpc('calculate_shipping_cost', {
        p_country_code: destinationCountry,
        p_order_subtotal: subtotal,
      });
      shippingCost = shippingData || 0;
    }

    // Calculate VAT on subtotal + shipping
    const taxableAmount = subtotal + shippingCost;
    const { vat_amount, vat_rate, vat_exempt_reason } = calculateVAT(taxableAmount, destinationCountry, company.vat_number);
    const total = taxableAmount + vat_amount;

    // Create or retrieve Stripe Customer
    let stripeCustomerId = company.stripe_customer_id;

    const billingAddress = company.billing_address_line_1 ? {
      line1: company.billing_address_line_1,
      line2: company.billing_address_line_2 || undefined,
      city: company.billing_city || undefined,
      state: company.billing_state_province || undefined,
      postal_code: company.billing_postal_code || undefined,
      country: company.billing_country || undefined,
    } : undefined;

    const shippingDetails = shippingAddress ? {
      name: company.company_name,
      address: {
        line1: shippingAddress.address_line_1,
        line2: shippingAddress.address_line_2 || undefined,
        city: shippingAddress.city || undefined,
        state: shippingAddress.state_province || undefined,
        postal_code: shippingAddress.postal_code || undefined,
        country: shippingAddress.country || undefined,
      }
    } : undefined;

    if (!stripeCustomerId) {
      // Create new customer with addresses
      const customer = await getStripeClient().customers.create({
        email: contact.email,
        name: company.company_name,
        address: billingAddress,
        shipping: shippingDetails,
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
    } else {
      // Update existing customer's billing and shipping addresses
      await getStripeClient().customers.update(stripeCustomerId, {
        email: contact.email,
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
        console.error('[create-invoice-interactive] VAT number error:', taxError);
      }
    }

    // Create Stripe Invoice with billing and shipping addresses
    const invoice = await getStripeClient().invoices.create({
      customer: stripeCustomerId,
      currency: currency.toLowerCase(),
      auto_advance: false,
      collection_method: 'send_invoice',
      days_until_due: 30,
      // Note: customer_shipping was removed from Stripe API - shipping address is on customer record
      metadata: {
        company_id,
        contact_id,
        offer_key: offer_key || 'portal_quote_interactive',
        campaign_key: campaign_key || `quote_${new Date().toISOString().split('T')[0]}`,
        // Store shipping address in metadata for reference
        shipping_address_line_1: shippingAddress?.address_line_1 || '',
        shipping_city: shippingAddress?.city || '',
        shipping_country: shippingAddress?.country || '',
      },
    });

    // Add line items to invoice using RECALCULATED prices
    for (const item of calculatedItems) {
      await getStripeClient().invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        description: `${item.product_code} - ${item.description}`,
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

    // Store invoice in database
    // Note: If this fails, Stripe invoice was still sent successfully - don't fail the whole request
    const invoiceNotes = [
      vat_exempt_reason ? `VAT: ${vat_exempt_reason}` : null,
      offer_key ? `Offer: ${offer_key}` : null,
      campaign_key ? `Campaign: ${campaign_key}` : null,
    ].filter(Boolean).join(', ') || null;

    const { data: dbInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id,
        contact_id,
        stripe_invoice_id: finalizedInvoice.id,
        stripe_customer_id: stripeCustomerId,
        invoice_type: 'sale',
        status: 'open',
        payment_status: 'unpaid',
        currency: currency.toLowerCase(),
        subtotal,
        shipping_amount: shippingCost,
        tax_amount: vat_amount,
        total_amount: total,
        shipping_address_id: shippingAddress ? undefined : null, // Can link if you have address_id
        shipping_country: destinationCountry,
        invoice_url: finalizedInvoice.hosted_invoice_url || undefined,
        invoice_pdf_url: finalizedInvoice.invoice_pdf || undefined,
        sent_at: new Date().toISOString(),
        notes: invoiceNotes,
      })
      .select('invoice_id')
      .single();

    if (invoiceError || !dbInvoice) {
      // Log error but still return success since Stripe invoice was created
      console.error('[create-invoice-interactive] Failed to create invoice record:', invoiceError);
      console.error('[create-invoice-interactive] Stripe invoice was still sent:', finalizedInvoice.id);

      // Return success with Stripe invoice info but no DB invoice_id
      return NextResponse.json({
        success: true,
        invoice_id: finalizedInvoice.id,
        invoice_url: finalizedInvoice.hosted_invoice_url,
        invoice_pdf_url: finalizedInvoice.invoice_pdf,
        warning: 'Stripe invoice created successfully but database record failed to save',
      });
    }

    // Store invoice items
    const invoiceItems = calculatedItems.map((item, index) => ({
      invoice_id: dbInvoice.invoice_id,
      product_code: item.product_code,
      line_number: index + 1,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('[create-invoice-interactive] Failed to create invoice items:', itemsError);
    } else {
      console.log('[create-invoice-interactive] Created', invoiceItems.length, 'invoice line items');
      // company_product_history will auto-update via trigger when invoice is paid
    }

    // Link to quote if this request came from a quote (not reorder portal)
    if (payload.object_type === 'quote' && payload.quote_id) {
      console.log(`[create-invoice-interactive] Linking invoice to quote ${payload.quote_id}`);

      // Update THE SPECIFIC QUOTE from token (not searching for one)
      const { data: updatedQuote, error: quoteUpdateError } = await supabase
        .from('quotes')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          invoice_id: dbInvoice.invoice_id,
        })
        .eq('quote_id', payload.quote_id)
        .select('quote_id, created_by, total_amount')
        .single();

      if (quoteUpdateError) {
        console.error('[create-invoice-interactive] Failed to update quote:', quoteUpdateError);
      } else if (updatedQuote) {
        console.log(`[create-invoice-interactive] Quote ${updatedQuote.quote_id} marked as accepted`);

        // Notify sales rep
        if (updatedQuote.created_by) {
          const { data: user } = await supabase
            .from('users')
            .select('user_id, email, full_name')
            .eq('sales_rep_id', updatedQuote.created_by)
            .single();

          if (user) {
            notifyQuoteAccepted({
              user_id: user.user_id,
              user_email: user.email,
              user_name: user.full_name || user.email,
              quote_id: updatedQuote.quote_id,
              company_id: company_id,
              company_name: company.company_name,
              contact_name: contact.full_name,
              total_amount: total, // Use actual invoice amount, not quote amount
            }).catch(err => console.error('[create-invoice-interactive] Notification failed:', err));
          }
        }
      }
    } else if (payload.object_type === 'reorder') {
      console.log('[create-invoice-interactive] Reorder portal invoice created (no quote linkage)');
    } else {
      console.log('[create-invoice-interactive] Invoice created without quote linkage (object_type:', payload.object_type, ')');
    }

    return NextResponse.json({
      success: true,
      invoice_id: finalizedInvoice.id,
      db_invoice_id: dbInvoice.invoice_id,
      invoice_url: finalizedInvoice.hosted_invoice_url,
      invoice_pdf_url: finalizedInvoice.invoice_pdf,
    });

  } catch (error) {
    console.error('[create-invoice-interactive] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
