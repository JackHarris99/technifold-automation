/**
 * Auto-Generate Reorder Reminder Jobs
 * POST /api/cron/generate-reorder-reminders
 *
 * Runs daily to find companies needing reorder reminders and creates outbox jobs
 * Triggered by Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const CRON_SECRET = process.env.CRON_SECRET;
const REMINDER_THRESHOLD_DAYS = 90; // Remind after 90 days of no orders

export async function POST(request: NextRequest) {
  // Verify cron secret
  const secret = request.headers.get('x-cron-secret');
  if (!secret || secret !== CRON_SECRET) {
    console.error('[reorder-cron] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  const startTime = Date.now();
  let jobsCreated = 0;
  let companiesProcessed = 0;
  let errors: string[] = [];

  try {
    console.log('[reorder-cron] Starting reorder reminder generation...');

    // Calculate threshold date
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - REMINDER_THRESHOLD_DAYS);
    const thresholdISO = thresholdDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Find companies who haven't ordered recently
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('company_id, company_name, last_invoice_at, category')
      .lt('last_invoice_at', thresholdISO)
      .eq('category', 'customer')  // Only existing customers
      .not('last_invoice_at', 'is', null)  // Must have ordered before
      .limit(200);  // Process up to 200 per day

    if (companiesError) {
      console.error('[reorder-cron] Error fetching companies:', companiesError);
      throw companiesError;
    }

    console.log(`[reorder-cron] Found ${companies?.length || 0} companies needing reminders`);

    // Process each company
    for (const company of companies || []) {
      companiesProcessed++;

      try {
        // Get subscribed contacts
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('contact_id, email, full_name')
          .eq('company_id', company.company_id)
          .eq('marketing_status', 'subscribed');

        if (contactsError) {
          console.error(`[reorder-cron] Error fetching contacts for ${company.company_name}:`, contactsError);
          errors.push(`${company.company_name}: Failed to fetch contacts`);
          continue;
        }

        if (!contacts || contacts.length === 0) {
          console.log(`[reorder-cron] No subscribed contacts for ${company.company_name}, skipping`);
          continue;
        }

        // Check if we already sent a reminder recently (avoid duplicates)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentReminders } = await supabase
          .from('engagement_events')
          .select('event_id')
          .eq('company_id', company.company_id)
          .eq('event_type', 'reorder_reminder_sent')
          .gte('occurred_at', sevenDaysAgo.toISOString())
          .limit(1);

        if (recentReminders && recentReminders.length > 0) {
          console.log(`[reorder-cron] Already sent reminder to ${company.company_name} in last 7 days, skipping`);
          continue;
        }

        // Create outbox job
        const campaignKey = `auto_reorder_${new Date().toISOString().split('T')[0]}`;

        const { error: jobError } = await supabase
          .from('outbox')
          .insert({
            job_type: 'send_offer_email',
            status: 'pending',
            attempts: 0,
            max_attempts: 3,
            payload: {
              company_id: company.company_id,
              contact_ids: contacts.map(c => c.contact_id),
              offer_key: 'reorder_90_day',
              campaign_key: campaignKey
            }
          });

        if (jobError) {
          console.error(`[reorder-cron] Failed to create job for ${company.company_name}:`, jobError);
          errors.push(`${company.company_name}: Job creation failed - ${jobError.message}`);
        } else {
          jobsCreated++;
          console.log(`[reorder-cron] ✓ Created reminder job for ${company.company_name} (${contacts.length} contact${contacts.length > 1 ? 's' : ''})`);
        }
      } catch (companyError) {
        console.error(`[reorder-cron] Error processing ${company.company_name}:`, companyError);
        errors.push(`${company.company_name}: ${companyError instanceof Error ? companyError.message : String(companyError)}`);
      }
    }

    const duration = Date.now() - startTime;
    const result = {
      success: true,
      jobs_created: jobsCreated,
      companies_processed: companiesProcessed,
      companies_found: companies?.length || 0,
      duration_ms: duration,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log(`[reorder-cron] Complete: ${jobsCreated} jobs created, ${companiesProcessed} companies processed in ${duration}ms`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[reorder-cron] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      jobs_created: jobsCreated,
      companies_processed: companiesProcessed,
      duration_ms: Date.now() - startTime
    }, { status: 500 });
  }
}
