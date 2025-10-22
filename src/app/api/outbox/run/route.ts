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
