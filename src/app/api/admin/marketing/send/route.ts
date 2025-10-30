/**
 * POST /api/admin/marketing/send
 * Queue marketing email from Marketing Builder
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      contact_ids,
      machine_slug,
      selected_problem_ids,
      curated_skus,
      campaign_key,
      offer_key
    } = body;

    if (!company_id || !contact_ids || !machine_slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Create outbox job
    const { data: job, error } = await supabase
      .from('outbox')
      .insert({
        job_type: 'send_offer_email',
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        payload: {
          company_id,
          contact_ids,
          campaign_key,
          offer_key,
          machine_slug,
          selected_problem_ids,
          curated_skus
        }
      })
      .select('job_id')
      .single();

    if (error || !job) {
      console.error('[admin/marketing/send] Error:', error);
      return NextResponse.json({ error: 'Failed to queue email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, job_id: job.job_id });
  } catch (err) {
    console.error('[admin/marketing/send] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
