/**
 * Checkout API - Create Stripe checkout session
 * POST /api/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, CheckoutLineItem } from '@/lib/stripe-client';
import { getSupabaseClient } from '@/lib/supabase';

interface CheckoutRequest {
  company_id: string;
  contact_id?: string;
  items: CheckoutLineItem[];
  offer_key?: string;
  campaign_key?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CheckoutRequest;

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

    // Validate items
    for (const item of body.items) {
      if (!item.product_code || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Each item must have product_code and positive quantity' },
          { status: 400 }
        );
      }
    }

    // Verify company exists
    const supabase = getSupabaseClient();
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

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';
    const session = await createCheckoutSession({
      companyId: body.company_id,
      contactId: body.contact_id,
      items: body.items,
      offerKey: body.offer_key,
      campaignKey: body.campaign_key,
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout/cancel`,
    });

    // Track checkout_started event
    await supabase.from('engagement_events').insert({
      company_id: body.company_id,
      contact_id: body.contact_id || null,
      source: 'vercel',
      event_type: 'checkout_started',  // For trigger backfill
      event_name: 'checkout_started',  // Canonical field
      offer_key: body.offer_key || null,
      campaign_key: body.campaign_key || null,
      session_id: body.contact_id ? crypto.randomUUID() : null, // Generate session ID if we have contact
      meta: {
        stripe_session_id: session.id,
        items: body.items,
      },
    });

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('[checkout] Error creating checkout session:', error);

    // Distinguish between client errors and server errors
    if (error instanceof Error) {
      if (error.message.includes('not available for purchase')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
