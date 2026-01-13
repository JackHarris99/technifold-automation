/**
 * POST /api/admin/reorder/send
 * Send reorder reminder emails directly via Resend (instant delivery)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { generateReorderUrl, generateUnsubscribeUrl } from '@/lib/tokens';
import { getResendClient } from '@/lib/resend-client';

/**
 * Build reorder reminder email HTML - matches preview design
 */
function buildReorderEmailHtml(
  tokenUrl: string,
  contactName: string | undefined,
  companyName: string,
  daysSinceOrder: number | null,
  unsubscribeUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Logo Header -->
        <div style="padding: 30px 40px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb;">
          <img
            src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
            alt="Technifold"
            style="height: 48px; display: block;"
          />
        </div>

        <!-- Email Content -->
        <div style="padding: 40px;">
          <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 24px 0;">
            Hi ${contactName || 'there'},
          </h2>

          <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0; line-height: 24px;">
            We hope your Technifold tools are working great for you! Based on your previous orders, it might be time to restock your supplies.
          </p>

          <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0; line-height: 24px;">
            We've put together a personalized reorder link just for you, making it quick and easy to get the products you need:
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${tokenUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              View Your Personalized Catalog
            </a>
          </div>

          <p style="font-size: 16px; color: #374151; margin: 24px 0 12px 0;">
            This link is personalized for ${companyName} and includes:
          </p>

          <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #374151; font-size: 16px; line-height: 28px;">
            <li>Your complete order history</li>
            <li>Quick reorder with saved preferences</li>
            <li>Current pricing and availability</li>
            <li>Fast checkout process</li>
          </ul>

          <p style="font-size: 16px; color: #374151; margin: 24px 0 16px 0; line-height: 24px;">
            If you have any questions or need assistance, please don't hesitate to reach out.
          </p>

          <p style="font-size: 16px; color: #374151; margin: 0;">
            Best regards,<br/>
            <strong>The Technifold Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
            This is a personalized email sent to ${companyName}
          </p>
        </div>
      </div>

      <!-- Unsubscribe -->
      <div style="text-align: center; margin-top: 24px;">
        <p style="font-size: 11px; color: #9ca3af; margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe from marketing emails</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { company_id, contact_ids, offer_key, campaign_key } = body;

    console.log('[reorder/send] Request:', { company_id, contact_ids, offer_key, campaign_key });

    if (!company_id || !contact_ids || contact_ids.length === 0) {
      return NextResponse.json(
        { error: 'company_id and contact_ids are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, last_invoice_at')
      .eq('company_id', company_id)
      .single();

    if (companyError || !company) {
      console.error('[admin/reorder/send] Company error:', companyError);
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get contact details
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('contact_id, email, first_name, full_name')
      .in('contact_id', contact_ids);

    if (contactsError || !contacts || contacts.length === 0) {
      console.error('[admin/reorder/send] Contacts error:', contactsError);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    // Get Resend client
    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'sales@technifold.com';
    const sentEmails: string[] = [];
    const failedEmails: { email: string; error: string }[] = [];

    // Calculate days since last order for email content
    const lastOrderDate = company.last_invoice_at ? new Date(company.last_invoice_at) : null;
    const daysSinceOrder = lastOrderDate
      ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Send email to each contact
    for (const contact of contacts) {
      try {
        // Generate personalized reorder portal URL
        const tokenUrl = generateReorderUrl(baseUrl, company_id, contact.contact_id);

        // Generate unsubscribe URL
        const unsubscribeUrl = generateUnsubscribeUrl(
          baseUrl,
          contact.contact_id,
          contact.email,
          company_id
        );

        const contactName = contact.first_name || contact.full_name?.split(' ')[0];

        // Build reorder email HTML
        const emailHtml = buildReorderEmailHtml(tokenUrl, contactName, company.company_name, daysSinceOrder, unsubscribeUrl);

        // Send via Resend
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: [contact.email],
          subject: 'Time to Reorder Your Technifold Consumables?',
          html: emailHtml
        });

        if (error) {
          console.error(`[admin/reorder/send] Failed for ${contact.email}:`, error);
          failedEmails.push({ email: contact.email, error: error.message || 'Unknown error' });
          continue;
        }

        console.log(`[admin/reorder/send] Sent to ${contact.email}, messageId: ${data?.id}`);
        sentEmails.push(contact.email);

        // Track engagement event for this email
        await supabase.from('engagement_events').insert({
          contact_id: contact.contact_id,
          company_id,
          event_type: 'reorder_reminder_sent',
          event_name: 'reorder_reminder_sent',
          source: 'admin',
          url: tokenUrl,
          meta: {
            days_since_order: daysSinceOrder,
            campaign_key: campaign_key || null,
            message_id: data?.id
          }
        });

      } catch (err: any) {
        console.error(`[admin/reorder/send] Error sending to ${contact.email}:`, err);
        failedEmails.push({ email: contact.email, error: err.message || 'Unknown error' });
      }
    }

    // Return results
    if (sentEmails.length === 0) {
      return NextResponse.json(
        {
          error: 'All emails failed to send',
          failed: failedEmails
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sent_count: sentEmails.length,
      failed_count: failedEmails.length,
      sent_to: sentEmails,
      failed: failedEmails.length > 0 ? failedEmails : undefined
    });
  } catch (err: any) {
    console.error('[admin/reorder/send] Unexpected error:', err);
    console.error('[admin/reorder/send] Error stack:', err?.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
