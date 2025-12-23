/**
 * POST /api/trial/resend-email
 * Resend trial confirmation email to customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendTrialConfirmation } from '@/lib/resend-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trial_intent_id,
      email,
      contact_name,
      machine_brand,
      machine_model,
    } = body;

    if (!trial_intent_id || !email) {
      return NextResponse.json(
        { error: 'trial_intent_id and email are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Look up the trial intent to get company_id and stripe_subscription_id
    const { data: trialIntent, error: trialError } = await supabase
      .from('trial_intents')
      .select('company_id, stripe_subscription_id')
      .eq('id', trial_intent_id)
      .single();

    if (trialError || !trialIntent) {
      console.error('[trial/resend-email] Trial intent not found:', trialError);
      return NextResponse.json(
        { error: 'Trial intent not found' },
        { status: 404 }
      );
    }

    // Look up the subscription to get pricing and trial end date
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('monthly_price, trial_end_date')
      .eq('stripe_subscription_id', trialIntent.stripe_subscription_id)
      .single();

    if (subError || !subscription) {
      console.error('[trial/resend-email] Subscription not found:', subError);
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Look up the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', trialIntent.company_id)
      .single();

    if (companyError || !company) {
      console.error('[trial/resend-email] Company not found:', companyError);
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Construct machine name
    const machineName = machine_brand && machine_model
      ? `${machine_brand} ${machine_model}`
      : undefined;

    // Send trial confirmation email
    const emailResult = await sendTrialConfirmation({
      to: email,
      contactName: contact_name || '',
      companyName: company.company_name || '',
      monthlyPrice: subscription.monthly_price,
      currency: 'GBP',
      trialEndDate: subscription.trial_end_date ? new Date(subscription.trial_end_date) : null,
      machineName,
    });

    if (!emailResult.success) {
      console.error('[trial/resend-email] Failed to send email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    console.log(`[trial/resend-email] Email sent to ${email}, messageId: ${emailResult.messageId}`);

    return NextResponse.json({
      success: true,
      message: 'Trial confirmation email sent successfully',
      messageId: emailResult.messageId,
    });

  } catch (error) {
    console.error('[trial/resend-email] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
