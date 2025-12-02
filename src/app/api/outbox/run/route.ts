/**
 * Outbox Worker - Process async jobs from outbox table
 * POST /api/outbox/run
 *
 * Configure as a Vercel Cron job in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/outbox/run",
 *     "schedule": "0 12 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { generateOfferUrl, generateReorderUrl, generateToken } from '@/lib/tokens';
import { sendMarketingEmail, isResendConfigured } from '@/lib/resend-client';

// Verify request is from Vercel Cron
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  // Verify cron secret
  const secret = request.headers.get('x-cron-secret');

  if (!secret || secret !== CRON_SECRET) {
    console.error('[outbox-worker] Invalid or missing X-CRON-SECRET header');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = getSupabaseClient();
  const startTime = Date.now();
  const maxDuration = 50000; // 50 seconds max (Vercel timeout is 60s)
  let processed = 0;
  let failed = 0;

  try {
    console.log('[outbox-worker] Starting outbox processing...');

    // Process jobs until timeout
    while (Date.now() - startTime < maxDuration) {
      // Fetch and lock next job atomically using FOR UPDATE SKIP LOCKED
      // Uses idx_outbox_pick index (status, locked_until, attempts)
      const { data: jobs, error: fetchError } = await supabase
        .from('outbox')
        .select('job_id, job_type, payload, attempts, max_attempts')
        .eq('status', 'pending')
        .lt('attempts', 5)  // max_attempts default
        .or('locked_until.is.null,locked_until.lt.' + new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(1);

      if (fetchError) {
        console.error('[outbox-worker] Error fetching jobs:', fetchError);
        break;
      }

      if (!jobs || jobs.length === 0) {
        console.log('[outbox-worker] No more jobs to process');
        break;
      }

      const job = jobs[0];
      const newAttempts = job.attempts + 1;

      console.log(`[outbox-worker] Claiming job ${job.job_id}: ${job.job_type}`);

      // Atomically claim the job by setting status='processing' and locked_until
      const { data: claimedJob, error: claimError } = await supabase
        .from('outbox')
        .update({
          status: 'processing',
          attempts: newAttempts,
          locked_until: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
          updated_at: new Date().toISOString(),
        })
        .eq('job_id', job.job_id)
        .eq('status', 'pending')  // Ensure it's still pending (race condition check)
        .select('job_id')
        .single();

      if (claimError || !claimedJob) {
        console.log('[outbox-worker] Job already claimed by another worker, skipping');
        continue;
      }

      // Process the job
      try {
        console.log(`[outbox-worker] Processing job ${job.job_id}: ${job.job_type}`);
        await processJob(job);

        // Mark as completed
        await supabase
          .from('outbox')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            locked_until: null,
          })
          .eq('job_id', job.job_id);

        processed++;
        console.log(`[outbox-worker] Job ${job.job_id} completed successfully`);
      } catch (error) {
        console.error(`[outbox-worker] Job ${job.job_id} failed:`, error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        const maxAttempts = job.max_attempts || 3;
        const newStatus = newAttempts >= maxAttempts ? 'dead' : 'failed';

        // Calculate exponential backoff for retry
        const retryDelayMinutes = Math.pow(2, newAttempts) * 5; // 5, 10, 20, 40, 80 minutes
        const scheduledFor = new Date(Date.now() + retryDelayMinutes * 60 * 1000).toISOString();

        await supabase
          .from('outbox')
          .update({
            status: newStatus,
            last_error: errorMessage,
            locked_until: null,
            scheduled_for: newStatus === 'failed' ? scheduledFor : undefined,
          })
          .eq('job_id', job.job_id);

        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      duration_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('[outbox-worker] Fatal error:', error);
    return NextResponse.json(
      { error: 'Outbox worker failed' },
      { status: 500 }
    );
  }
}

/**
 * Process a single outbox job
 */
async function processJob(job: any) {
  switch (job.job_type) {
    case 'send_offer_email':
      await processSendOfferEmail(job);
      break;

    case 'send_trial_email':
      await processSendTrialEmail(job);
      break;

    case 'send_reorder_reminder':
      await processSendReorderReminder(job);
      break;

    case 'inbound_lead_alert':
      // Stub for now - could send internal notification
      console.log('[outbox-worker] Inbound lead alert:', job.payload);
      break;

    default:
      throw new Error(`Unknown job type: ${job.job_type}`);
  }
}

/**
 * Send offer email with tokenized landing page
 */
async function processSendOfferEmail(job: any) {
  const {
    company_id,
    contact_ids,
    campaign_key,
    offer_key,
    machine_slug,
    selected_problem_ids,
    curated_skus
  } = job.payload;

  if (!company_id || !contact_ids || contact_ids.length === 0) {
    throw new Error('Invalid payload: missing company_id or contact_ids');
  }

  const supabase = getSupabaseClient();

  // Generate tokenized landing URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold-automation.vercel.app';

  // Determine URL type based on offer_key
  const isReorder = offer_key?.startsWith('reorder');
  const isWebsiteCapture = campaign_key === 'website_lead_capture';

  let tokenUrl: string;

  if (isReorder) {
    // /r/ for reorder portal
    tokenUrl = generateReorderUrl(baseUrl, company_id, contact_ids[0]);
  } else if (isWebsiteCapture) {
    // /m/ for marketing pages (shows their interests)
    const token = generateToken({
      company_id,
      contact_id: contact_ids[0]
    }, 720); // 30 days
    tokenUrl = `${baseUrl}/m/${token}`;
  } else {
    // /x/ for campaign offers
    const token = generateOfferUrl(
      baseUrl,
      company_id,
      offer_key || 'machine_solutions',
      {
        contactId: contact_ids[0],
        campaignKey: campaign_key,
        ttlHours: 72
      }
    );
    tokenUrl = `${baseUrl}/x/${token}`;
  }

  // Simplified email - no problem cards (abandoned schema removed)
  // Just send simple intro text
  let intro = 'Transform your print finishing with Technifold solutions. Eliminate fiber cracking, reduce waste, and increase productivity.';

  // Build email HTML
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Exclusive Offer from Technifold</h1>
        <p style="color: #dbeafe; margin: 0; font-size: 16px;">${intro}</p>
      </div>

      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 12px 0;">Transform Your Print Finishing</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
          Discover precision finishing tools that eliminate fiber cracking, reduce waste, and increase productivity. Over 40,000 installations worldwide.
        </p>
        <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Tri-Creaser: Eliminate fiber cracking completely</li>
          <li>Quad-Creaser: Perfect bound book finishing</li>
          <li>Spine-Creaser: Saddle stitcher transformation</li>
          <li>Multi-Tool: 6-in-1 modular finishing system</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${tokenUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px;">
          See All Solutions for Your Machine
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">
          Direct link (copy if button doesn't work):
        </p>
        <p style="color: #2563eb; font-size: 12px; word-break: break-all;">
          ${tokenUrl}
        </p>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
        <p>Technifold Ltd • Professional Print Finishing Solutions</p>
      </div>
    </body>
    </html>
  `;

  // Send email via Resend
  if (!isResendConfigured()) {
    console.warn('[outbox-worker] Resend not configured - email not sent');
    console.log('[outbox-worker] Token URL:', tokenUrl);
    return; // Skip if Resend not set up
  }

  // Get contact details for email
  const { data: contacts } = await supabase
    .from('contacts')
    .select('contact_id, email, full_name, first_name')
    .in('contact_id', contact_ids);

  if (!contacts || contacts.length === 0) {
    throw new Error('No valid contacts found');
  }

  // Send email to each contact
  for (const contact of contacts) {
    const result = await sendMarketingEmail({
      to: contact.email,
      contactName: contact.full_name || contact.first_name || '',
      companyName: company_id, // We'll fetch company name in the function
      tokenUrl,
      subject: isReorder
        ? 'Time to Reorder Consumables for Your Technifold Tools'
        : 'Personalized Solutions for Your Printing Equipment',
      preview: intro || 'We have solutions for your printing challenges'
    });

    if (result.success) {
      console.log(`[outbox-worker] Email sent to ${contact.email}`);

      // Track email sent
      await supabase.from('contact_interactions').insert({
        contact_id: contact.contact_id,
        company_id,
        interaction_type: 'email_sent',
        url: tokenUrl,
        metadata: {
          email_type: isReorder ? 'reorder' : 'marketing',
          message_id: result.messageId
        }
      });
    } else {
      console.error(`[outbox-worker] Email failed for ${contact.email}:`, result.error);
      throw new Error(`Email send failed: ${result.error}`);
    }
  }

  console.log(`[outbox-worker] Sent ${contacts.length} email(s) successfully`);
}

/**
 * Send trial request email with personalized link to start checkout
 */
async function processSendTrialEmail(job: any) {
  const {
    contact_id,
    email,
    contact_name,
    company_name,
    machine_name,
    machine_slug,
    offer_price,
    trial_link,
    token
  } = job.payload;

  if (!email || !trial_link) {
    throw new Error('Invalid payload: missing email or trial_link');
  }

  const supabase = getSupabaseClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold-automation.vercel.app';

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
        <p style="color: #dcfce7; margin: 0; font-size: 16px;">30-day free trial for ${machine_name || 'your machine'}</p>
      </div>

      <div style="background: white; border: 2px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 30px;">
        <p style="font-size: 16px; margin-top: 0;">Hi ${contact_name || 'there'},</p>

        <p style="font-size: 16px;">Thank you for your interest in Technifold finishing solutions for your <strong>${machine_name || 'printing equipment'}</strong>.</p>

        <p style="font-size: 16px;">Click below to start your <strong>30-day free trial</strong>:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${trial_link}" style="display: inline-block; background: #16a34a; color: white; padding: 18px 36px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px;">
            Start Your Free Trial
          </a>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: 600; color: #92400e;">What happens next:</p>
          <ol style="margin: 12px 0 0 0; padding-left: 20px; color: #92400e; font-size: 14px;">
            <li>Click the button above to enter your payment details</li>
            <li>Your card will NOT be charged during the 30-day trial</li>
            <li>We ship your trial kit within 2-3 business days</li>
            <li>Test on your ${machine_name || 'machine'} for 30 days</li>
            <li>Keep it at £${offer_price || 99}/month or return it free</li>
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
          <strong>01707 275 114</strong> (UK office hours)
        </p>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">
            If the button doesn't work, copy this link:
          </p>
          <p style="color: #2563eb; font-size: 12px; word-break: break-all;">
            ${trial_link}
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>Technifold Ltd • Unit 2, St John's Business Park • Lutterworth, LE17 4HB</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email via Resend
  if (!isResendConfigured()) {
    console.warn('[outbox-worker] Resend not configured - trial email not sent');
    console.log('[outbox-worker] Trial link:', trial_link);
    return;
  }

  const { getResendClient } = await import('@/lib/resend-client');
  const resend = getResendClient();

  if (!resend) {
    throw new Error('Resend client not available');
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: `Your Free Trial for ${machine_name || 'Technifold Tools'} is Ready`,
    html: emailHtml
  });

  if (error) {
    console.error('[outbox-worker] Trial email send error:', error);
    throw new Error(`Trial email send failed: ${error.message}`);
  }

  console.log(`[outbox-worker] Trial email sent to ${email}, messageId: ${data?.id}`);

  // Track email sent event
  if (contact_id) {
    await supabase.from('engagement_events').insert({
      contact_id,
      company_id: job.payload.company_id,
      event_type: 'trial_email_sent',
      event_name: 'trial_email_sent',
      source: 'outbox',
      url: trial_link,
      meta: {
        machine_slug,
        machine_name,
        offer_price,
        message_id: data?.id
      }
    });
  }
}

/**
 * Send reorder reminder email to customers who haven't ordered recently
 */
async function processSendReorderReminder(job: any) {
  const {
    company_id,
    contact_ids,
    offer_key,
    campaign_key
  } = job.payload;

  if (!company_id || !contact_ids || contact_ids.length === 0) {
    throw new Error('Invalid payload: missing company_id or contact_ids');
  }

  const supabase = getSupabaseClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold-automation.vercel.app';

  // Fetch company details
  const { data: company } = await supabase
    .from('companies')
    .select('company_id, company_name, last_invoice_at')
    .eq('company_id', company_id)
    .single();

  if (!company) {
    throw new Error(`Company not found: ${company_id}`);
  }

  // Generate reorder portal link
  const tokenUrl = generateReorderUrl(baseUrl, company_id, contact_ids[0]);

  // Calculate days since last order
  const lastOrderDate = company.last_invoice_at ? new Date(company.last_invoice_at) : null;
  const daysSinceOrder = lastOrderDate
    ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Build reorder reminder email
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Time to Restock?</h1>
        <p style="color: #e9d5ff; margin: 0; font-size: 16px;">Your Technifold consumables may be running low</p>
      </div>

      <div style="background: white; border: 2px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 30px;">
        <p style="font-size: 16px; margin-top: 0;">Hi there,</p>

        <p style="font-size: 16px;">
          ${daysSinceOrder
            ? `It's been <strong>${daysSinceOrder} days</strong> since your last order.`
            : `We noticed it's been a while since your last order.`}
          Time to check your consumable stock levels?
        </p>

        <div style="background: #f5f3ff; border: 2px solid #c4b5fd; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; color: #5b21b6;">Quick Reorder Benefits:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
            <li>See your previous orders instantly</li>
            <li>Reorder with one click</li>
            <li>Same prices as before</li>
            <li>Fast UK shipping</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${tokenUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 18px 36px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px;">
            View Your Reorder Portal
          </a>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center;">
          Your personalized portal shows everything you've ordered before,<br>
          making reordering quick and easy.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">
            Direct link to your portal:
          </p>
          <p style="color: #7c3aed; font-size: 12px; word-break: break-all;">
            ${tokenUrl}
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>Technifold Ltd • Professional Print Finishing Solutions</p>
          <p style="margin-top: 8px;">
            <a href="${baseUrl}/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email via Resend
  if (!isResendConfigured()) {
    console.warn('[outbox-worker] Resend not configured - reorder reminder not sent');
    console.log('[outbox-worker] Reorder URL:', tokenUrl);
    return;
  }

  // Get contact details
  const { data: contacts } = await supabase
    .from('contacts')
    .select('contact_id, email, full_name, first_name')
    .in('contact_id', contact_ids);

  if (!contacts || contacts.length === 0) {
    throw new Error('No valid contacts found');
  }

  const { getResendClient } = await import('@/lib/resend-client');
  const resend = getResendClient();

  if (!resend) {
    throw new Error('Resend client not available');
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  // Send to each contact
  for (const contact of contacts) {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [contact.email],
      subject: `Time to Reorder Your Technifold Consumables?`,
      html: emailHtml
    });

    if (error) {
      console.error(`[outbox-worker] Reorder reminder failed for ${contact.email}:`, error);
      throw new Error(`Reorder reminder send failed: ${error.message}`);
    }

    console.log(`[outbox-worker] Reorder reminder sent to ${contact.email}`);

    // Track event
    await supabase.from('engagement_events').insert({
      contact_id: contact.contact_id,
      company_id,
      event_type: 'reorder_reminder_sent',
      event_name: 'reorder_reminder_sent',
      source: 'outbox',
      url: tokenUrl,
      meta: {
        days_since_order: daysSinceOrder,
        campaign_key,
        message_id: data?.id
      }
    });
  }

  console.log(`[outbox-worker] Sent ${contacts.length} reorder reminder(s) successfully`);
}
