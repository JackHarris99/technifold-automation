/**
 * Upgrade Subscription (Ratchet Model)
 *
 * RATCHET BEHAVIOR:
 * - Customers can ADD tools/capability anytime
 * - Price can only go UP, never down via API
 * - Downgrades require manual intervention (call sales)
 * - Prorated charge applied immediately
 *
 * This endpoint:
 * 1. Validates new price > current price (ratchet enforcement)
 * 2. Updates Stripe subscription with new monthly amount
 * 3. Stripe auto-charges prorated difference
 * 4. Updates our database with new tools list
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
      subscription_id,    // Our internal subscription ID
      new_monthly_price,  // New total monthly price in GBP
      added_tools,        // Array of tool codes being added
      reason              // Why they're upgrading (for analytics)
    } = await request.json();

    if (!subscription_id || !new_monthly_price) {
      return NextResponse.json(
        { error: 'Missing subscription_id or new_monthly_price' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch current subscription from our database
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, companies(*)')
      .eq('subscription_id', subscription_id)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // RATCHET ENFORCEMENT: New price must be >= current price
    const currentPrice = subscription.monthly_price || 0;
    if (new_monthly_price < currentPrice) {
      return NextResponse.json(
        {
          error: 'Downgrades not allowed via API',
          message: 'To reduce your subscription, please contact sales@technifold.co.uk',
          current_price: currentPrice,
          requested_price: new_monthly_price
        },
        { status: 400 }
      );
    }

    // If price is the same, just update tools (no Stripe change needed)
    if (new_monthly_price === currentPrice) {
      const currentTools = subscription.tools || [];
      const updatedTools = [...currentTools, ...(added_tools || [])];

      await supabase
        .from('subscriptions')
        .update({
          tools: updatedTools,
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscription_id);

      return NextResponse.json({
        success: true,
        message: 'Tools updated (no price change)',
        monthly_price: currentPrice
      });
    }

    // Fetch Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    if (stripeSubscription.status !== 'active' && stripeSubscription.status !== 'trialing') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Get the subscription item ID (we only have one item per subscription)
    const subscriptionItemId = stripeSubscription.items.data[0].id;

    // Update Stripe subscription with new price
    const newPriceInPence = Math.round(new_monthly_price * 100);

    const updatedStripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [{
          id: subscriptionItemId,
          price_data: {
            currency: 'gbp',
            product: process.env.STRIPE_PRODUCT_ID!,
            unit_amount: newPriceInPence,
            recurring: {
              interval: 'month'
            }
          }
        }],
        proration_behavior: 'create_prorations', // Charge difference immediately
        metadata: {
          ...stripeSubscription.metadata,
          last_upgrade_at: new Date().toISOString(),
          monthly_price_gbp: new_monthly_price.toString()
        }
      }
    );

    // Update our database
    const currentTools = subscription.tools || [];
    const updatedTools = [...currentTools, ...(added_tools || [])];

    await supabase
      .from('subscriptions')
      .update({
        monthly_price: new_monthly_price,
        tools: updatedTools,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription_id);

    // Log subscription event
    await supabase.from('subscription_events').insert({
      subscription_id,
      event_type: 'upgrade',
      old_value: JSON.stringify({
        monthly_price: currentPrice,
        tools: currentTools
      }),
      new_value: JSON.stringify({
        monthly_price: new_monthly_price,
        tools: updatedTools,
        added_tools
      }),
      metadata: {
        reason,
        price_increase: new_monthly_price - currentPrice,
        stripe_subscription_id: subscription.stripe_subscription_id
      }
    });

    // Log engagement event
    await supabase.from('engagement_events').insert({
      company_id: subscription.company_id,
      event_type: 'subscription_upgraded',
      event_name: 'subscription_upgraded',
      source: 'api',
      meta: {
        subscription_id,
        old_price: currentPrice,
        new_price: new_monthly_price,
        price_increase: new_monthly_price - currentPrice,
        added_tools,
        reason
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription upgraded successfully',
      previous_price: currentPrice,
      new_price: new_monthly_price,
      price_increase: new_monthly_price - currentPrice,
      tools: updatedTools,
      proration_applied: true
    });

  } catch (error: any) {
    console.error('Subscription upgrade error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
