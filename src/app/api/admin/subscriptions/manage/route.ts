/**
 * POST /api/admin/subscriptions/manage
 * Manage subscriptions - create, add_tool, update_price, cancel, activate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, subscription_id, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // CREATE - Create new subscription
    if (action === 'create') {
      const {
        company_id,
        contact_id,
        monthly_price,
        currency,
        trial_days,
        tools,
        notes,
      } = params;

      if (!company_id || !monthly_price || !tools || tools.length === 0) {
        return NextResponse.json(
          { error: 'company_id, monthly_price, and tools are required' },
          { status: 400 }
        );
      }

      const trialDays = parseInt(trial_days || '30');
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + trialDays);

      const { data: subscription, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          company_id,
          contact_id: contact_id || null,
          monthly_price: parseFloat(monthly_price),
          currency: currency || 'GBP',
          tools,
          status: 'trial',
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          notes: notes || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[subscriptions/manage] Create error:', insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      // Log subscription event
      await supabase.from('subscription_events').insert({
        subscription_id: subscription.subscription_id,
        event_type: 'created',
        event_name: 'Subscription created',
        new_value: {
          monthly_price: parseFloat(monthly_price),
          tools,
          trial_days: trialDays,
        },
        notes: 'Subscription created via admin UI',
      });

      return NextResponse.json({
        success: true,
        subscription,
      });
    }

    // For all other actions, subscription_id is required
    if (!subscription_id) {
      return NextResponse.json(
        { error: 'subscription_id is required for this action' },
        { status: 400 }
      );
    }

    // ADD_TOOL - Add tool to subscription
    if (action === 'add_tool') {
      const { tool_code } = params;

      if (!tool_code) {
        return NextResponse.json(
          { error: 'tool_code is required' },
          { status: 400 }
        );
      }

      // Fetch current subscription
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('tools')
        .eq('subscription_id', subscription_id)
        .single();

      if (fetchError || !subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      const updatedTools = [...(subscription.tools || []), tool_code];

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tools: updatedTools,
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', subscription_id);

      if (updateError) {
        console.error('[subscriptions/manage] Add tool error:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      // Log event
      await supabase.from('subscription_events').insert({
        subscription_id,
        event_type: 'tool_added',
        event_name: 'Tool added to subscription',
        old_value: { tools: subscription.tools },
        new_value: { tools: updatedTools },
        notes: `Added ${tool_code}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Tool added successfully',
      });
    }

    // UPDATE_PRICE - Update subscription price
    if (action === 'update_price') {
      const { new_price } = params;

      if (!new_price || parseFloat(new_price) <= 0) {
        return NextResponse.json(
          { error: 'new_price must be greater than 0' },
          { status: 400 }
        );
      }

      const priceValue = parseFloat(new_price);

      // Fetch current subscription
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('monthly_price, ratchet_max')
        .eq('subscription_id', subscription_id)
        .single();

      if (fetchError || !subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      const newRatchetMax = Math.max(
        priceValue,
        subscription.ratchet_max || 0
      );

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          monthly_price: priceValue,
          ratchet_max: newRatchetMax,
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', subscription_id);

      if (updateError) {
        console.error('[subscriptions/manage] Update price error:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      // Log event
      await supabase.from('subscription_events').insert({
        subscription_id,
        event_type: priceValue > subscription.monthly_price ? 'price_increased' : 'price_decreased',
        event_name: 'Subscription price updated',
        old_value: { monthly_price: subscription.monthly_price },
        new_value: { monthly_price: priceValue },
        notes: `Price changed from £${subscription.monthly_price} to £${priceValue}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Price updated successfully',
        ratchet_warning: priceValue < (subscription.ratchet_max || 0),
      });
    }

    // CANCEL - Cancel subscription
    if (action === 'cancel') {
      const { cancellation_reason } = params;

      // Fetch current status
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('subscription_id', subscription_id)
        .single();

      if (fetchError || !subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancellation_reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', subscription_id);

      if (updateError) {
        console.error('[subscriptions/manage] Cancel error:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      // Log event
      await supabase.from('subscription_events').insert({
        subscription_id,
        event_type: 'cancelled',
        event_name: 'Subscription cancelled',
        old_value: { status: subscription.status },
        new_value: { status: 'cancelled' },
        notes: cancellation_reason || 'No reason provided',
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled',
      });
    }

    // ACTIVATE - Activate subscription
    if (action === 'activate') {
      // Fetch current status
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('subscription_id', subscription_id)
        .single();

      if (fetchError || !subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', subscription_id);

      if (updateError) {
        console.error('[subscriptions/manage] Activate error:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      // Log event
      await supabase.from('subscription_events').insert({
        subscription_id,
        event_type: 'reactivated',
        event_name: 'Subscription activated',
        old_value: { status: subscription.status },
        new_value: { status: 'active' },
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription activated',
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('[subscriptions/manage] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
