/**
 * POST /api/trial/resend-email
 * Resend trial email to customer
 *
 * Handles two cases:
 * 1. Trial not yet converted → Queue trial request email (with checkout link)
 * 2. Trial converted to subscription → Send trial confirmation email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendTrialConfirmation } from '@/lib/resend-client';
import { generateTrialToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trial_intent_id,
      token,
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

    // Look up the trial intent
    const { data: trialIntent, error: trialError } = await supabase
      .from('trial_intents')
      .select('company_id, contact_id, machine_id')
      .eq('id', trial_intent_id)
      .single();

    if (trialError || !trialIntent) {
      console.error('[trial/resend-email] Trial intent not found:', trialError);
      return NextResponse.json(
        { error: 'Trial intent not found' },
        { status: 404 }
      );
    }

    // Check if a subscription exists for this trial (company + machine)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('monthly_price, trial_end_date, company_id')
      .eq('company_id', trialIntent.company_id)
      .single();

    // If subscription exists, send confirmation email
    if (subscription) {
      // Look up company
      const { data: company } = await supabase
        .from('companies')
        .select('company_name')
        .eq('company_id', trialIntent.company_id)
        .single();

      const machineName = machine_brand && machine_model
        ? `${machine_brand} ${machine_model}`
        : undefined;

      const emailResult = await sendTrialConfirmation({
        to: email,
        contactName: contact_name || '',
        companyName: company?.company_name || '',
        monthlyPrice: subscription.monthly_price,
        currency: 'GBP',
        trialEndDate: subscription.trial_end_date ? new Date(subscription.trial_end_date) : null,
        machineName,
      });

      if (!emailResult.success) {
        return NextResponse.json(
          { error: 'Failed to send confirmation email', details: emailResult.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Trial confirmation email sent',
        type: 'confirmation',
      });
    }

    // No subscription found - queue trial request email with checkout link
    // Use the existing token or generate a new one
    const trialLink = `${process.env.NEXT_PUBLIC_BASE_URL}/t/${token}`;

    const { data: machine } = await supabase
      .from('machines')
      .select('brand, model, slug')
      .eq('machine_id', trialIntent.machine_id)
      .single();

    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', trialIntent.company_id)
      .single();

    // Queue email via outbox
    const { error: outboxError } = await supabase
      .from('outbox')
      .insert({
        job_type: 'send_trial_email',
        status: 'pending',
        attempts: 0,
        payload: {
          contact_id: trialIntent.contact_id,
          email,
          contact_name,
          company_name: company?.company_name || '',
          machine_name: machine ? `${machine.brand} ${machine.model}` : 'your machine',
          machine_slug: machine?.slug || '',
          offer_price: null,
          trial_link: trialLink,
          token,
        }
      });

    if (outboxError) {
      console.error('[trial/resend-email] Failed to queue email:', outboxError);
      return NextResponse.json(
        { error: 'Failed to queue trial email' },
        { status: 500 }
      );
    }

    console.log(`[trial/resend-email] Trial request email queued for ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Trial request email queued (will be sent by outbox worker)',
      type: 'trial_request',
    });

  } catch (error) {
    console.error('[trial/resend-email] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
