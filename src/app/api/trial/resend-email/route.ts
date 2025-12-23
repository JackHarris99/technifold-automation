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

    // No subscription found - send trial request email with checkout link directly
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

    const machineName = machine ? `${machine.brand} ${machine.model}` : 'your machine';
    const companyNameStr = company?.company_name || '';

    // Build trial email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Your Free Trial is Ready!</h1>
          <p style="color: #dcfce7; margin: 0; font-size: 16px;">30-day free trial for ${machineName}</p>
        </div>

        <div style="background: white; border: 2px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 30px;">
          <p style="font-size: 16px; margin-top: 0;">Hi ${contact_name || 'there'},</p>

          <p style="font-size: 16px;">Thank you for your interest in Technifold finishing solutions for your <strong>${machineName}</strong>.</p>

          <p style="font-size: 16px;">Click below to start your <strong>30-day free trial</strong>:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${trialLink}" style="display: inline-block; background: #16a34a; color: white; padding: 18px 36px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Start Your Free Trial
            </a>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #92400e;">What happens next:</p>
            <ol style="margin: 12px 0 0 0; padding-left: 20px; color: #92400e; font-size: 14px;">
              <li>Click the button above to enter your payment details</li>
              <li>Your card will NOT be charged during the 30-day trial</li>
              <li>We ship your trial kit within 2-3 business days</li>
              <li>Test on your ${machineName} for 30 days</li>
              <li>Keep it at a low monthly rate or return it free</li>
            </ol>
          </div>

          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              <strong>Zero Risk Guarantee:</strong> If the tools don't transform your finishing quality, return them within 30 days. No questions asked.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="font-size: 14px; color: #666;">
            Questions? Reply to this email or call us:<br>
            <strong>+44 (0)1455 554491</strong> (UK office hours)
          </p>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">
              If the button doesn't work, copy this link:
            </p>
            <p style="color: #2563eb; font-size: 12px; word-break: break-all;">
              ${trialLink}
            </p>
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>Technifold Ltd • Unit 2D Tungsten Park • Lutterworth, Leicestershire, LE17 4JA</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email directly via Resend
    const { getResendClient } = await import('@/lib/resend-client');
    const resend = getResendClient();

    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    try {
      const { data: sendData, error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `Your Free Trial is Ready - ${machineName}`,
        html: emailHtml,
      });

      if (sendError) {
        console.error('[trial/resend-email] Failed to send email:', sendError);
        return NextResponse.json(
          { error: 'Failed to send trial email', details: sendError.message },
          { status: 500 }
        );
      }

      console.log(`[trial/resend-email] Trial request email sent to ${email}, messageId: ${sendData?.id}`);

      return NextResponse.json({
        success: true,
        message: 'Trial request email sent',
        type: 'trial_request',
        messageId: sendData?.id,
      });
    } catch (sendErr: any) {
      console.error('[trial/resend-email] Error sending email:', sendErr);
      return NextResponse.json(
        { error: 'Failed to send email', details: sendErr.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[trial/resend-email] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
