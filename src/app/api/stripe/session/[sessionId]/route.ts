/**
 * Fetch Stripe Checkout Session Details
 * Used on trial success page to show confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await stripe.checkout.sessions.retrieve(params.sessionId);

    return NextResponse.json({
      id: session.id,
      customer_email: session.customer_email,
      metadata: session.metadata,
      subscription: session.subscription,
      status: session.status
    });
  } catch (error: any) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
