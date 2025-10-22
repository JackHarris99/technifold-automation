/**
 * POST /api/admin/outbox/retry
 * Resets a failed job to pending status for retry
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Check if job exists and is failed
    const { data: job, error: fetchError } = await supabase
      .from('outbox')
      .select('job_id, status, attempts')
      .eq('job_id', job_id)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'failed') {
      return NextResponse.json(
        { error: 'Only failed jobs can be retried' },
        { status: 400 }
      );
    }

    if (job.attempts >= 5) {
      return NextResponse.json(
        { error: 'Job has reached maximum retry attempts' },
        { status: 400 }
      );
    }

    // Reset job to pending
    const { error: updateError } = await supabase
      .from('outbox')
      .update({
        status: 'pending',
        locked_until: null,
        scheduled_for: new Date().toISOString(),
        last_error: null,
      })
      .eq('job_id', job_id);

    if (updateError) {
      console.error('[outbox-retry] Error updating job:', updateError);
      return NextResponse.json({ error: 'Failed to retry job' }, { status: 500 });
    }

    return NextResponse.json({ success: true, job_id });
  } catch (err) {
    console.error('[outbox-retry] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
