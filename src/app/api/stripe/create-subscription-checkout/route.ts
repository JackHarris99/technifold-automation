/**
 * POST /api/stripe/create-subscription-checkout
 *
 * Creates a Stripe Checkout Session for a subscription with 30-day trial.
 * Uses price_data with dynamic pricing (no pre-defined price IDs needed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, ensureStripeCustomer } from '@/lib/stripe-client';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      trial_intent_id,
      selected_price,
      company_id,
      contact_id,
      machine_id,
    } = body;

    // Validate required fields
    if (!token || !trial_intent_id || !selected_price || !company_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Stripe product ID - prefer test if available, fall back to live
    const stripeProductId = process.env.STRIPE_PRODUCT_ID_TEST || process.env.STRIPE_PRODUCT_ID;

    if (!stripeProductId) {
      console.error('[stripe/create-subscription-checkout] STRIPE_PRODUCT_ID not configured');
      return NextResponse.json(
        { error: 'Stripe product not configured' },
        { status: 500 }
      );
    }

    const supabase = createServerClient();

    // Verify the trial intent exists and matches
    const { data: trialIntent, error: intentError } = await supabase
      .from('trial_intents')
      .select('id, token, company_id, contact_id, machine_id')
      .eq('token', token)
      .single();

    if (intentError || !trialIntent) {
      return NextResponse.json(
        { error: 'Invalid trial token' },
        { status: 400 }
      );
    }

    // Convert price to pence
    const priceInPence = Math.round(selected_price * 100);

    // Ensure Stripe customer exists
    const stripeCustomerId = await ensureStripeCustomer(company_id);

    // Get contact email for receipt
    let customerEmail: string | undefined;
    if (contact_id) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('email')
        .eq('contact_id', contact_id)
        .single();

      customerEmail = contact?.email;
    }

    // Get machine details for description
    let machineDescription = 'Technifold Subscription';
    let machineName = '';
    if (machine_id) {
      const { data: machine } = await supabase
        .from('machines')
        .select('brand, model')
        .eq('machine_id', machine_id)
        .single();

      if (machine) {
        machineName = `${machine.brand} ${machine.model}`.trim();
        machineDescription = `Technifold Subscription - ${machineName}`;
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';

    // Create Stripe Checkout Session for subscription with 30-day trial
    // Using price_data for dynamic pricing
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      customer_email: customerEmail && !stripeCustomerId ? customerEmail : undefined,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product: stripeProductId,
            unit_amount: priceInPence,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          company_id,
          contact_id: contact_id || '',
          machine_id: machine_id || '',
          trial_intent_id,
          selected_price: selected_price.toString(),
        },
        description: machineDescription,
      },
      metadata: {
        company_id,
        contact_id: contact_id || '',
        machine_id: machine_id || '',
        trial_intent_id,
        selected_price: selected_price.toString(),
        purchase_type: 'subscription_trial',
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/offer?token=${token}`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log(`[stripe/create-subscription-checkout] Session created: ${session.id} for company ${company_id} at £${selected_price}/month`);

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    });

  } catch (error: any) {
    console.error('[stripe/create-subscription-checkout] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
