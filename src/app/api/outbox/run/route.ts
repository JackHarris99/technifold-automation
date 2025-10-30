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
import { getZohoBooksClient, isZohoConfigured } from '@/lib/zoho-books-client';
import { generateOfferUrl } from '@/lib/tokens';

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
    case 'zoho_sync_order':
      await processZohoSyncOrder(job);
      break;

    case 'send_offer_email':
      await processSendOfferEmail(job);
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
 * Sync order to Zoho Books (create invoice + record payment)
 */
async function processZohoSyncOrder(job: any) {
  if (!isZohoConfigured()) {
    console.log('[outbox-worker] Zoho not configured, skipping sync');
    return; // Silently skip if Zoho not configured
  }

  const { order_id, company_id, items, total, currency, payment_reference } = job.payload;

  if (!order_id || !company_id || !items) {
    throw new Error('Invalid job payload: missing required fields');
  }

  const supabase = getSupabaseClient();
  const zoho = getZohoBooksClient();

  // Create invoice in Zoho Books
  console.log(`[outbox-worker] Creating Zoho invoice for order ${order_id}`);
  const invoice = await zoho.createInvoice({
    companyId: company_id,
    orderId: order_id,
    items: items.map((item: any) => ({
      product_code: item.product_code,
      description: item.description,
      quantity: item.quantity,
      rate: item.unit_price,
    })),
    reference_number: order_id,
  });

  // Record payment
  console.log(`[outbox-worker] Recording payment for invoice ${invoice.invoice_id}`);
  const payment = await zoho.recordPayment({
    invoiceId: invoice.invoice_id,
    amount: total,
    paymentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    paymentMode: 'stripe',
    reference: payment_reference,
  });

  // Update order with Zoho IDs
  await supabase
    .from('orders')
    .update({
      zoho_invoice_id: invoice.invoice_id,
      zoho_payment_id: payment.payment_id,
      zoho_synced_at: new Date().toISOString(),
    })
    .eq('order_id', order_id);

  // Store result in outbox
  await supabase
    .from('outbox')
    .update({
      result: {
        zoho_invoice_id: invoice.invoice_id,
        zoho_invoice_number: invoice.invoice_number,
        zoho_payment_id: payment.payment_id,
      },
    })
    .eq('id', job.id);

  console.log(`[outbox-worker] Order ${order_id} synced to Zoho successfully`);
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

  const tokenUrl = `${baseUrl}/x/${token}`;

  // Fetch the selected problem cards for email preview (top 2)
  let emailCards: any[] = [];
  let intro = '';

  if (machine_slug && selected_problem_ids && selected_problem_ids.length > 0) {
    const { data: cards } = await supabase
      .from('v_machine_solution_problem_full')
      .select('*')
      .eq('machine_slug', machine_slug)
      .in('problem_id', selected_problem_ids)
      .order('machine_solution_rank')
      .order('pitch_relevance_rank')
      .limit(2);

    emailCards = cards || [];

    // Extract intro from first card
    if (emailCards.length > 0 && emailCards[0].resolved_copy) {
      intro = emailCards[0].resolved_copy.split('\n\n')[0].substring(0, 200);
    }
  }

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
        <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Solutions for Your Machine</h1>
        <p style="color: #dbeafe; margin: 0; font-size: 16px;">${intro}</p>
      </div>

      ${emailCards.map(card => `
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <div style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 12px;">
            ${card.solution_name}
          </div>
          <div style="color: #374151; font-size: 15px; line-height: 1.6;">
            ${card.resolved_copy?.substring(0, 300).replace(/\n/g, '<br>')}${card.resolved_copy?.length > 300 ? '...' : ''}
          </div>
        </div>
      `).join('')}

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

  // TODO: Send email via your email service
  // For now, just log it
  console.log('[outbox-worker] Would send email to:', contact_ids);
  console.log('[outbox-worker] Token URL:', tokenUrl);
  console.log('[outbox-worker] Cards:', emailCards.length);

  // TODO: Replace this with actual email sending
  // Examples:
  // - Zoho Mail API
  // - SendGrid/Resend
  // - AWS SES
  // await sendEmail({ to: contact_ids, subject: '...', html: emailHtml });

  // For now, mark as completed
  console.log('[outbox-worker] Email job completed (email sending not yet implemented)');
}
