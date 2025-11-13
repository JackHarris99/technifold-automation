/**
 * Quote Checkout API - Create Stripe checkout for tool rental or purchase
 * POST /api/quote/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe-client';
import type Stripe from 'stripe';

interface CheckoutRequest {
  company_id: string;
  contact_id: string;
  purchase_type: 'rental' | 'purchase';
  products: Array<{
    product_code: string;
    quantity: number;
  }>;
  shipping_address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province?: string;
    postal_code: string;
    country: string;
  };
  agreed_to_terms: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CheckoutRequest;

    // Validate request
    if (!body.company_id || !body.contact_id || !body.purchase_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!body.agreed_to_terms) {
      return NextResponse.json(
        { error: 'Must agree to terms and conditions' },
        { status: 400 }
      );
    }

    if (!body.shipping_address.address_line_1 || !body.shipping_address.city || !body.shipping_address.postal_code) {
      return NextResponse.json(
        { error: 'Complete shipping address required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Verify company and contact
    const { data: company } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', body.company_id)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { data: contact } = await supabase
      .from('contacts')
      .select('contact_id, email, full_name')
      .eq('contact_id', body.contact_id)
      .single();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // 2. Get product pricing
    const { data: products } = await supabase
      .from('products')
      .select('product_code, description, price, rental_price_monthly, currency, category')
      .in('product_code', body.products.map(p => p.product_code))
      .eq('active', true);

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Products not found' }, { status: 404 });
    }

    // 3. Save shipping address
    const { data: savedAddress, error: addressError } = await supabase
      .from('shipping_addresses')
      .insert({
        company_id: body.company_id,
        ...body.shipping_address,
        is_default: true
      })
      .select()
      .single();

    if (addressError) {
      console.error('Failed to save address:', addressError);
      return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
    }

    // 4. Get or create Stripe customer
    let stripeCustomerId: string;

    const { data: existingOrders } = await supabase
      .from('orders')
      .select('stripe_customer_id')
      .eq('company_id', body.company_id)
      .not('stripe_customer_id', 'is', null)
      .limit(1);

    if (existingOrders && existingOrders[0]?.stripe_customer_id) {
      stripeCustomerId = existingOrders[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: contact.email,
        name: contact.full_name || company.company_name,
        metadata: {
          company_id: body.company_id,
          contact_id: body.contact_id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // 5. Create checkout session based on purchase type
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    let session: Stripe.Checkout.Session;

    if (body.purchase_type === 'rental') {
      // RENTAL: Create subscription checkout with trial
      // Find the tool product or use first product
      const toolProduct = products.find(p => p.category === 'tool') || products[0];
      const monthlyPrice = toolProduct.rental_price_monthly || 50; // Fallback to £50

      session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: products[0].description,
                description: '30-day free trial, then £50/month',
                metadata: {
                  product_code: products[0].product_code,
                  purchase_type: 'rental',
                },
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: monthlyPrice * 100, // Convert to pence
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 30,
          metadata: {
            company_id: body.company_id,
            contact_id: body.contact_id,
            purchase_type: 'rental',
            shipping_address_id: savedAddress.address_id,
          },
        },
        success_url: `${baseUrl}/quote/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/quote/cancelled`,
        metadata: {
          company_id: body.company_id,
          contact_id: body.contact_id,
          purchase_type: 'rental',
          shipping_address_id: savedAddress.address_id,
        },
      });
    } else {
      // PURCHASE: One-time payment
      const purchasePrice = products[0].price || 1500; // Fallback to £1500

      session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: products[0].currency || 'gbp',
              product_data: {
                name: products[0].description,
                description: 'One-time purchase - own it outright',
                metadata: {
                  product_code: products[0].product_code,
                  purchase_type: 'purchase',
                },
              },
              unit_amount: Math.round(purchasePrice * 100), // Convert to pence
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/quote/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/quote/cancelled`,
        metadata: {
          company_id: body.company_id,
          contact_id: body.contact_id,
          purchase_type: 'purchase',
          shipping_address_id: savedAddress.address_id,
        },
      });
    }

    // 6. Track checkout started event
    await supabase.from('engagement_events').insert({
      company_id: body.company_id,
      contact_id: body.contact_id,
      source: 'vercel',
      event_type: 'checkout_started',
      event_name: 'tool_checkout_started',
      meta: {
        stripe_session_id: session.id,
        purchase_type: body.purchase_type,
        products: body.products,
      },
    });

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('[quote/checkout] Error:', error);

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
