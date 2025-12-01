/**
 * Create Stripe Checkout Session for Trial Signup
 *
 * ONE Stripe product model:
 * - Product: "Technifold Subscription"
 * - Variable prices: £69, £89, £99, £149, £179
 * - Metadata stores machine + tools info
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

    const supabase = createServerClient();

    // Get machine details
    const { data: machine } = await supabase
      .from('machines')
      .select('*, category')
      .eq('machine_slug', machine_slug)
      .single();

    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    // Get compatible products for this machine (base trial kit)
    const { data: compatibility } = await supabase
      .from('product_machine_compatibility')
      .select('product_code')
      .eq('machine_slug', machine_slug)
      .limit(5); // Base trial kit - not full capability

    const baseTools = compatibility?.map(c => c.product_code) || [];

    // Create or get company in database
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        company_name,
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
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
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

    // Determine Stripe price ID based on offer_price
    const priceId = getPriceId(offer_price);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          company_id: company.company_id,
          contact_id: contact?.contact_id || '',
          machine_slug: machine_slug,
          machine_name: `${machine.manufacturer} ${machine.model}`,
          machine_category: machine.category,
          base_tools: JSON.stringify(baseTools),
          offer_tier: 'starter',
          source: token ? 'email_campaign' : 'website',
          hmac_token: token || ''
        }
      },
      metadata: {
        company_id: company.company_id,
        machine_slug: machine_slug,
        offer_price: offer_price.toString()
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/trial/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/trial?machine=${machine_slug}&offer=${offer_price}`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    // Log trial signup event
    await supabase.from('engagement_events').insert({
      company_id: company.company_id,
      contact_id: contact?.contact_id,
      event_type: 'trial_signup_initiated',
      event_data: {
        machine_slug,
        machine_name: `${machine.manufacturer} ${machine.model}`,
        offer_price,
        stripe_session_id: session.id,
        source: token ? 'email_campaign' : 'website'
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

function getPriceId(offerPrice: number): string {
  // TODO: Create these price IDs in Stripe dashboard first
  // All prices belong to ONE product: "Technifold Subscription"

  const priceMap: Record<number, string> = {
    69: process.env.STRIPE_PRICE_69 || 'price_69_placeholder',
    89: process.env.STRIPE_PRICE_89 || 'price_89_placeholder',
    99: process.env.STRIPE_PRICE_99 || 'price_99_placeholder',
    149: process.env.STRIPE_PRICE_149 || 'price_149_placeholder',
    179: process.env.STRIPE_PRICE_179 || 'price_179_placeholder',
  };

  return priceMap[offerPrice] || priceMap[99]; // Default to £99
}
