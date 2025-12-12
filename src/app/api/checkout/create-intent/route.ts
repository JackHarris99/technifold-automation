/**
 * POST /api/checkout/create-intent
 * Create a Stripe PaymentIntent for embedded checkout
 * Returns clientSecret for Stripe Elements
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, ensureStripeCustomer } from '@/lib/stripe-client';
import { getSupabaseClient } from '@/lib/supabase';

interface CreateIntentRequest {
  company_id: string;
  contact_id?: string;
  items: Array<{
    product_code: string;
    quantity: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateIntentRequest;

    // Validate request
    if (!body.company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required and must not be empty' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', body.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get contact details if provided
    let contactEmail: string | undefined;
    let contactName: string | undefined;
    if (body.contact_id) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('email, full_name')
        .eq('contact_id', body.contact_id)
        .single();

      if (contact) {
        contactEmail = contact.email;
        contactName = contact.full_name;
      }
    }

    // Fetch product details and calculate totals
    const productCodes = body.items.map(item => item.product_code);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_code, description, price, currency')
      .in('product_code', productCodes);

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Calculate line items and total
    const lineItems = body.items.map(item => {
      const product = products.find(p => p.product_code === item.product_code);
      if (!product) {
        throw new Error(`Product not found: ${item.product_code}`);
      }
      return {
        product_code: item.product_code,
        description: product.description || item.product_code,
        quantity: item.quantity,
        unit_price: product.price || 0,
        total_price: (product.price || 0) * item.quantity,
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    // UK VAT at 20%
    const taxAmount = subtotal * 0.2;
    const totalAmount = subtotal + taxAmount;

    // Amount in pence
    const amountInCents = Math.round(totalAmount * 100);

    if (amountInCents < 50) {
      return NextResponse.json(
        { error: 'Order total must be at least £0.50' },
        { status: 400 }
      );
    }

    // Ensure Stripe customer exists
    const customerId = await ensureStripeCustomer(body.company_id);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'gbp',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        company_id: body.company_id,
        contact_id: body.contact_id || '',
        product_codes: JSON.stringify(productCodes),
        line_items: JSON.stringify(lineItems),
        subtotal: subtotal.toString(),
        tax_amount: taxAmount.toString(),
        total_amount: totalAmount.toString(),
        source: 'reorder_portal',
      },
      receipt_email: contactEmail,
      description: `Order for ${company.company_name}`,
    });

    // Track checkout_started event
    await supabase.from('engagement_events').insert({
      company_id: body.company_id,
      contact_id: body.contact_id || null,
      source: 'vercel',
      event_type: 'checkout_started',
      event_name: 'embedded_checkout_started',
      session_id: crypto.randomUUID(),
      meta: {
        payment_intent_id: paymentIntent.id,
        items: body.items,
        total_amount: totalAmount,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      subtotal,
      taxAmount,
      lineItems,
      companyName: company.company_name,
      contactName,
      contactEmail,
    });

  } catch (error) {
    console.error('[create-intent] Error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
