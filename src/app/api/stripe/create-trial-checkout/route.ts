/**
 * Create Stripe Checkout Session for Trial Signup
 *
 * DYNAMIC PRICING MODEL:
 * - ONE Stripe product: "Technifold Equipment Subscription"
 * - Price set dynamically at checkout (any amount)
 * - Enables AI-driven pricing, A/B testing, market-specific rates
 * - Metadata stores machine + tools for our internal tracking
 *
 * RATCHET SUBSCRIPTION:
 * - Customers can upgrade (add tools) anytime
 * - Downgrades require manual intervention (call us)
 * - Stripe handles one monthly charge, we track itemization
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

export async function POST(request: NextRequest) {
  try {
    const {
      machine_slug,
      offer_price,
      company_name,
      contact_name,
      email,
      phone,
      token // HMAC token if from email
    } = await request.json();

    // Validate offer_price
    const priceInPence = Math.round((offer_price || 99) * 100);
    if (priceInPence < 100 || priceInPence > 100000) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get machine details
    const { data: machine } = await supabase
      .from('machines')
      .select('*')
      .eq('slug', machine_slug)
      .single();

    // Machine is optional - allow generic trials
    const machineName = machine
      ? `${machine.brand} ${machine.model}`
      : 'Your Equipment';

    // Validate we have a company name
    if (!company_name || company_name.trim() === '') {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Create or get company in database
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        company_name: company_name.trim(),
        source: 'trial_signup',
        category: 'prospect'
      }, {
        onConflict: 'company_name',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (companyError || !company) {
      console.error('Company creation error:', companyError);
      console.error('Company name attempted:', company_name);
      return NextResponse.json({
        error: 'Failed to create company',
        details: companyError?.message || 'No company returned',
        code: companyError?.code
      }, { status: 500 });
    }

    // Create or get contact
    const { data: contact } = await supabase
      .from('contacts')
      .upsert({
        company_id: company.company_id,
        full_name: contact_name,
        email,
        phone,
        marketing_status: 'subscribed'
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    // Get or create Stripe customer
    let stripeCustomerId = company.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name: company_name,
        phone,
        metadata: {
          company_id: company.company_id,
          contact_id: contact?.contact_id || '',
          source: 'trial_signup'
        }
      });
      stripeCustomerId = customer.id;

      // Save Stripe customer ID to company
      await supabase
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('company_id', company.company_id);
    }

    // Create Stripe checkout session with DYNAMIC pricing
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product: process.env.STRIPE_PRODUCT_ID!, // ONE product for all subscriptions
            unit_amount: priceInPence,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          company_id: company.company_id,
          contact_id: contact?.contact_id || '',
          machine_slug: machine_slug || '',
          machine_name: machineName,
          monthly_price_gbp: offer_price.toString(),
          source: token ? 'email_campaign' : 'website',
        }
      },
      metadata: {
        company_id: company.company_id,
        contact_id: contact?.contact_id || '',
        machine_slug: machine_slug || '',
        offer_price: offer_price.toString(),
        type: 'trial_subscription'
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/trial/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/trial?machine=${machine_slug || ''}&offer=${offer_price}`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      },
      custom_text: {
        submit: {
          message: `Start your 30-day free trial for ${machineName}. Your card will not be charged until the trial ends.`
        }
      }
    });

    // Log trial signup event
    await supabase.from('engagement_events').insert({
      company_id: company.company_id,
      contact_id: contact?.contact_id,
      event_type: 'trial_checkout_created',
      event_name: 'trial_checkout_created',
      source: token ? 'email_campaign' : 'website',
      meta: {
        machine_slug,
        machine_name: machineName,
        offer_price,
        stripe_session_id: session.id,
        stripe_customer_id: stripeCustomerId
      }
    });

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id
    });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
