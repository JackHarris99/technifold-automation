/**
 * Task Auto-Generation System
 * Automatically creates follow-up tasks based on quote and customer activity
 */

import { getSupabaseClient } from './supabase';

interface GenerateTaskParams {
  user_id: string;
  task_type: 'quote_follow_up' | 'trial_ending' | 'payment_chase' | 'reorder' | 'custom';
  title: string;
  description?: string;
  priority?: number;
  company_id?: string;
  contact_id?: string;
  quote_id?: string;
  invoice_id?: string;
  subscription_id?: string;
  due_date?: Date | string;
}

/**
 * Create a task in the database
 */
export async function createTask(params: GenerateTaskParams): Promise<{ success: boolean; task_id?: string; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: params.user_id,
        task_type: params.task_type,
        priority: params.priority || 50,
        status: 'pending',
        title: params.title,
        description: params.description || null,
        company_id: params.company_id || null,
        contact_id: params.contact_id || null,
        quote_id: params.quote_id || null,
        invoice_id: params.invoice_id || null,
        subscription_id: params.subscription_id || null,
        due_date: params.due_date ? new Date(params.due_date).toISOString() : null,
        auto_generated: true,
      })
      .select('task_id')
      .single();

    if (error) {
      console.error('[taskGenerator] Create error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, task_id: data?.task_id };
  } catch (err: any) {
    console.error('[taskGenerator] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Scan for quotes that need follow-up and create tasks
 * Run this daily via cron job
 */
export async function generateQuoteFollowUpTasks(): Promise<{ created: number; errors: number }> {
  const supabase = getSupabaseClient();
  let created = 0;
  let errors = 0;

  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    // Find quotes that need follow-up:
    // 1. Sent but not viewed after 3 days
    // 2. Viewed but not accepted after 5 days
    const { data: quotesNeedingFollowUp } = await supabase
      .from('quotes')
      .select(`
        quote_id,
        company_id,
        created_by,
        sent_at,
        viewed_at,
        accepted_at,
        total_amount,
        companies(company_name)
      `)
      .is('accepted_at', null)
      .not('sent_at', 'is', null);

    if (!quotesNeedingFollowUp) return { created, errors };

    for (const quote of quotesNeedingFollowUp) {
      // Check if task already exists for this quote
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('task_id')
        .eq('quote_id', quote.quote_id)
        .eq('task_type', 'quote_follow_up')
        .eq('status', 'pending')
        .single();

      if (existingTask) continue; // Task already exists

      // Determine if follow-up is needed
      let needsFollowUp = false;
      let priority = 50;
      let reason = '';

      if (!quote.viewed_at && quote.sent_at) {
        const daysSinceSent = (now.getTime() - new Date(quote.sent_at).getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceSent >= 3) {
          needsFollowUp = true;
          priority = daysSinceSent >= 7 ? 80 : 60;
          reason = 'sent but not viewed';
        }
      } else if (quote.viewed_at && !quote.accepted_at) {
        const daysSinceViewed = (now.getTime() - new Date(quote.viewed_at).getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceViewed >= 5) {
          needsFollowUp = true;
          priority = daysSinceViewed >= 10 ? 90 : 70;
          reason = 'viewed but no response';
        }
      }

      if (needsFollowUp) {
        const companyName = (quote.companies as any)?.company_name || 'Unknown Company';
        const result = await createTask({
          user_id: quote.created_by,
          task_type: 'quote_follow_up',
          title: `Follow up: ${companyName} quote (£${quote.total_amount?.toLocaleString() || '0'})`,
          description: `Quote ${reason}. Consider calling or sending a follow-up email to check their interest.`,
          priority,
          company_id: quote.company_id,
          quote_id: quote.quote_id,
          due_date: now,
        });

        if (result.success) {
          created++;
        } else {
          errors++;
        }
      }
    }

    return { created, errors };
  } catch (err) {
    console.error('[taskGenerator] Quote follow-up error:', err);
    return { created, errors: errors + 1 };
  }
}

/**
 * Scan for trials ending soon and create tasks
 * Run this daily via cron job
 */
export async function generateTrialEndingTasks(): Promise<{ created: number; errors: number }> {
  const supabase = getSupabaseClient();
  let created = 0;
  let errors = 0;

  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find trials ending within 7 days
    const { data: endingTrials } = await supabase
      .from('subscriptions')
      .select(`
        subscription_id,
        company_id,
        account_owner,
        status,
        trial_end,
        price_per_month,
        companies(company_name)
      `)
      .eq('status', 'trialing')
      .lte('trial_end', sevenDaysFromNow.toISOString())
      .gte('trial_end', now.toISOString());

    if (!endingTrials) return { created, errors };

    for (const trial of endingTrials) {
      // Check if task already exists
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('task_id')
        .eq('subscription_id', trial.subscription_id)
        .eq('task_type', 'trial_ending')
        .eq('status', 'pending')
        .single();

      if (existingTask) continue;

      const trialEnd = new Date(trial.trial_end);
      const daysUntilEnd = Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      const priority = daysUntilEnd <= 3 ? 90 : 70;
      const companyName = (trial.companies as any)?.company_name || 'Unknown Company';

      const result = await createTask({
        user_id: trial.account_owner,
        task_type: 'trial_ending',
        title: `Trial ending in ${daysUntilEnd} days: ${companyName}`,
        description: `Check in with customer to ensure they're happy. Trial converts to £${trial.price_per_month}/month on ${trialEnd.toLocaleDateString()}.`,
        priority,
        company_id: trial.company_id,
        subscription_id: trial.subscription_id,
        due_date: trialEnd,
      });

      if (result.success) {
        created++;
      } else {
        errors++;
      }
    }

    return { created, errors };
  } catch (err) {
    console.error('[taskGenerator] Trial ending error:', err);
    return { created, errors: errors + 1 };
  }
}

/**
 * Scan for unpaid invoices and create payment chase tasks
 * Run this daily via cron job
 */
export async function generatePaymentChaseTasks(): Promise<{ created: number; errors: number }> {
  const supabase = getSupabaseClient();
  let created = 0;
  let errors = 0;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find unpaid invoices older than 7 days
    const { data: unpaidInvoices } = await supabase
      .from('invoices')
      .select(`
        invoice_id,
        company_id,
        account_owner,
        status,
        amount_due,
        created_at,
        companies(company_name)
      `)
      .eq('status', 'open')
      .lte('created_at', sevenDaysAgo.toISOString());

    if (!unpaidInvoices) return { created, errors };

    for (const invoice of unpaidInvoices) {
      // Check if task already exists
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('task_id')
        .eq('invoice_id', invoice.invoice_id)
        .eq('task_type', 'payment_chase')
        .eq('status', 'pending')
        .single();

      if (existingTask) continue;

      const invoiceAge = Math.floor((now.getTime() - new Date(invoice.created_at).getTime()) / (24 * 60 * 60 * 1000));
      const priority = invoiceAge >= 14 ? 95 : 75;
      const companyName = (invoice.companies as any)?.company_name || 'Unknown Company';

      const result = await createTask({
        user_id: invoice.account_owner,
        task_type: 'payment_chase',
        title: `Unpaid invoice: ${companyName} (${invoiceAge} days overdue)`,
        description: `Invoice £${invoice.amount_due?.toLocaleString() || '0'} is ${invoiceAge} days old. Consider sending a payment reminder.`,
        priority,
        company_id: invoice.company_id,
        invoice_id: invoice.invoice_id,
        due_date: now,
      });

      if (result.success) {
        created++;
      } else {
        errors++;
      }
    }

    return { created, errors };
  } catch (err) {
    console.error('[taskGenerator] Payment chase error:', err);
    return { created, errors: errors + 1 };
  }
}

/**
 * Master task generation function
 * Runs all task generators and returns summary
 */
export async function runAllTaskGenerators(): Promise<{
  total_created: number;
  total_errors: number;
  details: {
    quote_followup: { created: number; errors: number };
    trial_ending: { created: number; errors: number };
    payment_chase: { created: number; errors: number };
  };
}> {
  console.log('[taskGenerator] Running all task generators...');

  const [quoteResults, trialResults, paymentResults] = await Promise.all([
    generateQuoteFollowUpTasks(),
    generateTrialEndingTasks(),
    generatePaymentChaseTasks(),
  ]);

  const total_created = quoteResults.created + trialResults.created + paymentResults.created;
  const total_errors = quoteResults.errors + trialResults.errors + paymentResults.errors;

  console.log(`[taskGenerator] Complete: ${total_created} tasks created, ${total_errors} errors`);

  return {
    total_created,
    total_errors,
    details: {
      quote_followup: quoteResults,
      trial_ending: trialResults,
      payment_chase: paymentResults,
    },
  };
}
