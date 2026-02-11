/**
 * Sales Team Email Notifications
 * Sends instant notifications to sales reps with tokenized action links
 */

import { getResendClient } from './resend-client';
import { createActionToken, getActionUrl } from './actionTokens';
import { getSupabaseClient } from './supabase';

// Use separate email for internal notifications vs customer-facing emails
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL_NOTIFICATIONS || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Email wrapper for sales notifications
 */
function salesEmailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 24px; color: #ffffff; }
    .content { padding: 32px 24px; }
    .footer { padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 8px 4px; }
    .button-secondary { background-color: #6b7280; }
    .button-success { background-color: #10b981; }
    .info-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; }
    @media only screen and (max-width: 600px) {
      .content { padding: 24px 16px; }
      .button { display: block; margin: 8px 0; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;
}

/**
 * Send instant notification when a quote is viewed by customer
 */
export async function notifyQuoteViewed({
  user_id,
  user_email,
  user_name,
  quote_id,
  company_id,
  company_name,
  contact_name,
  total_amount,
}: {
  user_id: string;
  user_email: string;
  user_name: string;
  quote_id: string;
  company_id: string;
  company_name: string;
  contact_name?: string;
  total_amount: number;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Resend not configured' };

  try {
    // Create action tokens (stateless, no DB storage)
    const logCallToken = createActionToken({
      user_id,
      action_type: 'log_call',
      quote_id,
      company_id,
      metadata: { company_name, contact_name },
      expires_in_hours: 72,
    });

    const addNoteToken = createActionToken({
      user_id,
      action_type: 'add_note',
      quote_id,
      company_id,
      metadata: { company_name },
      expires_in_hours: 72,
    });

    const logCallUrl = getActionUrl(logCallToken.token, 'log_call');
    const addNoteUrl = getActionUrl(addNoteToken.token, 'add_note');
    const quoteUrl = `${BASE_URL}/admin/quotes/${quote_id}`;

    const html = salesEmailWrapper(`
      <div class="header">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">👁️ Quote Viewed</h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${company_name} just opened their quote</p>
      </div>

      <div class="content">
        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 16px 0;">
          Hi ${user_name},
        </p>

        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 24px 0;">
          <strong>${company_name}</strong> just viewed their quote${contact_name ? ` (${contact_name})` : ''}. This is a great time to follow up!
        </p>

        <div class="info-box">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color: #1e40af; font-size: 14px; padding-bottom: 4px;">Quote Value</td>
              <td align="right" style="color: #1e40af; font-size: 18px; font-weight: 700;">£${total_amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 12px; padding-top: 8px;">Quote ID</td>
              <td align="right" style="color: #64748b; font-size: 12px; font-family: monospace;">${quote_id.slice(0, 8)}</td>
            </tr>
          </table>
        </div>

        <h3 style="margin: 24px 0 12px 0; font-size: 16px; color: #333333;">Quick Actions:</h3>

        <div style="margin: 16px 0;">
          <a href="${logCallUrl}" class="button">📞 Log a Call</a>
          <a href="${addNoteUrl}" class="button button-secondary">📝 Add Note</a>
          <a href="${quoteUrl}" class="button button-secondary">View Full Quote</a>
        </div>

        <p style="font-size: 14px; color: #666666; margin: 24px 0 0 0; line-height: 20px;">
          <strong>Pro tip:</strong> Customers who view quotes within the first hour are 3x more likely to convert. Strike while the iron's hot!
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0; font-size: 12px; color: #666666; line-height: 18px;">
          This is an automated notification from Technifold Admin. You can manage your notification preferences in Settings.
        </p>
      </div>
    `);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user_email],
      subject: `🟢 ${company_name} viewed their quote (£${total_amount.toLocaleString()})`,
      html,
    });

    if (error) {
      console.error('[salesNotifications] Quote viewed error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[salesNotifications] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send instant notification when a quote is accepted by customer
 */
export async function notifyQuoteAccepted({
  user_id,
  user_email,
  user_name,
  quote_id,
  company_id,
  company_name,
  contact_name,
  total_amount,
}: {
  user_id: string;
  user_email: string;
  user_name: string;
  quote_id: string;
  company_id: string;
  company_name: string;
  contact_name?: string;
  total_amount: number;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Resend not configured' };

  try {
    const quoteUrl = `${BASE_URL}/admin/quotes/${quote_id}`;
    const companyUrl = `${BASE_URL}/admin/company/${company_id}`;

    const html = salesEmailWrapper(`
      <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">🎉 Quote Accepted!</h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Congratulations on the win!</p>
      </div>

      <div class="content">
        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 16px 0;">
          Hi ${user_name},
        </p>

        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 24px 0;">
          Great news! <strong>${company_name}</strong> has accepted their quote and requested an invoice.${contact_name ? ` Contact: ${contact_name}` : ''}
        </p>

        <div class="info-box" style="background-color: #f0fdf4; border-left-color: #10b981;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color: #166534; font-size: 14px; padding-bottom: 4px;">Deal Value</td>
              <td align="right" style="color: #166534; font-size: 24px; font-weight: 700;">£${total_amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="2" style="color: #166534; font-size: 12px; padding-top: 8px; font-style: italic;">
                Invoice will be created automatically via Stripe
              </td>
            </tr>
          </table>
        </div>

        <h3 style="margin: 24px 0 12px 0; font-size: 16px; color: #333333;">Next Steps:</h3>

        <div style="margin: 16px 0;">
          <a href="${quoteUrl}" class="button button-success">View Quote Details</a>
          <a href="${companyUrl}" class="button button-secondary">View Company Profile</a>
        </div>

        <p style="font-size: 14px; color: #666666; margin: 24px 0 0 0; line-height: 20px;">
          The invoice will be sent automatically. Monitor payment status in the Invoices section.
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0; font-size: 12px; color: #666666; line-height: 18px;">
          This is an automated notification from Technifold Admin. You can manage your notification preferences in Settings.
        </p>
      </div>
    `);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user_email],
      subject: `✅ ${company_name} accepted quote - £${total_amount.toLocaleString()} deal closed!`,
      html,
    });

    if (error) {
      console.error('[salesNotifications] Quote accepted error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[salesNotifications] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send instant notification when an invoice is paid
 */
export async function notifyInvoicePaid({
  user_id,
  user_email,
  user_name,
  invoice_id,
  company_id,
  company_name,
  amount_paid,
}: {
  user_id: string;
  user_email: string;
  user_name: string;
  invoice_id: string;
  company_id: string;
  company_name: string;
  amount_paid: number;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Resend not configured' };

  try {
    const companyUrl = `${BASE_URL}/admin/company/${company_id}`;
    const invoicesUrl = `${BASE_URL}/admin/invoices`;

    const html = salesEmailWrapper(`
      <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">💰 Payment Received!</h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Invoice paid in full</p>
      </div>

      <div class="content">
        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 16px 0;">
          Hi ${user_name},
        </p>

        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 24px 0;">
          <strong>${company_name}</strong> has paid their invoice. The payment has been confirmed by Stripe.
        </p>

        <div class="info-box" style="background-color: #f0fdf4; border-left-color: #10b981;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color: #166534; font-size: 14px; padding-bottom: 4px;">Amount Paid</td>
              <td align="right" style="color: #166534; font-size: 24px; font-weight: 700;">£${amount_paid.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 12px; padding-top: 8px;">Invoice ID</td>
              <td align="right" style="color: #64748b; font-size: 12px; font-family: monospace;">${invoice_id.slice(0, 12)}</td>
            </tr>
          </table>
        </div>

        <h3 style="margin: 24px 0 12px 0; font-size: 16px; color: #333333;">Quick Actions:</h3>

        <div style="margin: 16px 0;">
          <a href="${companyUrl}" class="button">View Company</a>
          <a href="${invoicesUrl}" class="button button-secondary">All Invoices</a>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0; font-size: 12px; color: #666666; line-height: 18px;">
          This is an automated notification from Technifold Admin.
        </p>
      </div>
    `);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user_email],
      subject: `💰 Payment received from ${company_name} - £${amount_paid.toLocaleString()}`,
      html,
    });

    if (error) {
      console.error('[salesNotifications] Invoice paid error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[salesNotifications] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send instant notification when a customer or distributor places an order
 */
export async function notifyOrderSubmitted({
  user_id,
  user_email,
  user_name,
  order_id,
  company_id,
  company_name,
  order_type,
  total_amount,
  items_count,
}: {
  user_id: string;
  user_email: string;
  user_name: string;
  order_id: string;
  company_id: string;
  company_name: string;
  order_type: 'customer' | 'distributor';
  total_amount: number;
  items_count: number;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Resend not configured' };

  try {
    const companyUrl = `${BASE_URL}/admin/company/${company_id}`;
    const ordersUrl = `${BASE_URL}/admin/orders`;
    const orderTypeLabel = order_type === 'customer' ? 'Customer' : 'Distributor';

    const html = salesEmailWrapper(`
      <div class="header">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">🛒 New Order Submitted</h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${orderTypeLabel} order pending review</p>
      </div>

      <div class="content">
        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 16px 0;">
          Hi ${user_name},
        </p>

        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 24px 0;">
          <strong>${company_name}</strong> has submitted a new ${order_type} order for review.
        </p>

        <div class="info-box">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color: #1e40af; font-size: 14px; padding-bottom: 4px;">Order Total</td>
              <td align="right" style="color: #1e40af; font-size: 24px; font-weight: 700;">£${total_amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 12px; padding-top: 8px;">Items</td>
              <td align="right" style="color: #64748b; font-size: 12px;">${items_count} product${items_count !== 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 12px; padding-top: 4px;">Order ID</td>
              <td align="right" style="color: #64748b; font-size: 12px; font-family: monospace;">${order_id.slice(0, 12)}</td>
            </tr>
          </table>
        </div>

        <h3 style="margin: 24px 0 12px 0; font-size: 16px; color: #333333;">Next Steps:</h3>
        <p style="font-size: 14px; color: #666666; margin: 0 0 16px 0; line-height: 20px;">
          Review the order and create an invoice to proceed with fulfillment.
        </p>

        <div style="margin: 16px 0;">
          <a href="${ordersUrl}" class="button">Review Order</a>
          <a href="${companyUrl}" class="button button-secondary">View Company</a>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0; font-size: 12px; color: #666666; line-height: 18px;">
          This is an automated notification from Technifold Admin.
        </p>
      </div>
    `);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user_email],
      subject: `🛒 New ${orderTypeLabel} order from ${company_name} - £${total_amount.toLocaleString()}`,
      html,
    });

    if (error) {
      console.error('[salesNotifications] Order submitted error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[salesNotifications] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send daily digest email to sales rep
 * Summarizes all activity for their customers
 */
export async function sendDailyDigest({
  user_id,
  user_email,
  user_name,
}: {
  user_id: string;
  user_email: string;
  user_name: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Resend not configured' };

  try {
    const supabase = getSupabaseClient();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Fetch today's tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, companies(company_name)')
      .eq('user_id', user_id)
      .eq('status', 'pending')
      .lte('due_date', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(10);

    // Fetch recent quote activity (quotes viewed/accepted in last 24h)
    const { data: recentActivity } = await supabase
      .from('quotes')
      .select('*, companies(company_name)')
      .eq('created_by', user_id)
      .or(`viewed_at.gte.${yesterday.toISOString()},accepted_at.gte.${yesterday.toISOString()}`)
      .order('viewed_at', { ascending: false })
      .limit(5);

    // Skip if no activity
    if ((!tasks || tasks.length === 0) && (!recentActivity || recentActivity.length === 0)) {
      return { success: true }; // No digest needed
    }

    let tasksHtml = '';
    if (tasks && tasks.length > 0) {
      tasksHtml = tasks.map((task: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #333333;">${task.title}</strong><br>
            <span style="font-size: 12px; color: #666666;">${task.companies?.company_name || 'No company'}</span>
          </td>
          <td align="right" style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="background-color: ${task.priority > 70 ? '#fef3c7' : '#f3f4f6'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: ${task.priority > 70 ? '#92400e' : '#666666'};">
              ${task.priority > 70 ? 'Urgent' : 'Normal'}
            </span>
          </td>
        </tr>
      `).join('');
    }

    let activityHtml = '';
    if (recentActivity && recentActivity.length > 0) {
      activityHtml = recentActivity.map((quote: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #333333;">${quote.companies?.company_name || 'Unknown'}</strong><br>
            <span style="font-size: 12px; color: #666666;">£${quote.total_amount?.toLocaleString() || '0'}</span>
          </td>
          <td align="right" style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="background-color: ${quote.accepted_at ? '#dcfce7' : '#dbeafe'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: ${quote.accepted_at ? '#166534' : '#1e40af'};">
              ${quote.accepted_at ? 'Accepted' : 'Viewed'}
            </span>
          </td>
        </tr>
      `).join('');
    }

    const html = salesEmailWrapper(`
      <div class="header">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">📊 Daily Sales Digest</h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div class="content">
        <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 24px 0;">
          Good morning ${user_name}! Here's your daily summary:
        </p>

        ${tasks && tasks.length > 0 ? `
        <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #333333;">⏰ Today's Tasks (${tasks.length})</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 6px;">
          ${tasksHtml}
        </table>
        ` : ''}

        ${recentActivity && recentActivity.length > 0 ? `
        <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #333333;">📈 Recent Activity</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 6px;">
          ${activityHtml}
        </table>
        ` : ''}

        <div style="margin: 24px 0;">
          <a href="${BASE_URL}/admin/sales" class="button">Go to Sales Center</a>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0; font-size: 12px; color: #666666; line-height: 18px;">
          Sent daily at 9:00 AM. Manage notification preferences in Settings.
        </p>
      </div>
    `);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user_email],
      subject: `📊 Your daily sales digest - ${tasks?.length || 0} tasks today`,
      html,
    });

    if (error) {
      console.error('[salesNotifications] Daily digest error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[salesNotifications] Error:', err);
    return { success: false, error: err.message };
  }
}
