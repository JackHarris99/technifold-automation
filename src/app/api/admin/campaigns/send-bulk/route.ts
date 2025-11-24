/**
 * POST /api/admin/campaigns/send-bulk
 * Send marketing campaign to multiple contacts at once
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { generateToken } from '@/lib/tokens';
import { sendMarketingEmail, isResendConfigured } from '@/lib/resend-client';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. Add RESEND_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      contact_ids,
      campaign_key,
      subject,
      machine_slug,
      problem_ids,
    } = body;

    if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      return NextResponse.json({ error: 'contact_ids array is required' }, { status: 400 });
    }

    if (!campaign_key || !subject) {
      return NextResponse.json({ error: 'campaign_key and subject are required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get contacts with company info
    const { data: contacts } = await supabase
      .from('contacts')
      .select(`
        contact_id,
        email,
        full_name,
        first_name,
        last_name,
        company_id,
        marketing_consent,
        companies (
          company_id,
          company_name,
          account_owner
        )
      `)
      .in('contact_id', contact_ids);

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found' }, { status: 404 });
    }

    // Check territory permissions (sales reps can only send to their territory)
    const { canActOnCompany } = await import('@/lib/auth');
    const allowedContacts = [];
    for (const contact of contacts) {
      const permission = await canActOnCompany(contact.company_id);
      if (permission.allowed && contact.marketing_consent) {
        allowedContacts.push(contact);
      }
    }

    if (allowedContacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts with permission and consent found' },
        { status: 403 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
    const results = [];

    // Send email to each contact
    for (const contact of allowedContacts) {
      try {
        // Generate tokenized link for this contact
        // The campaign_key tells /m/[token] which campaign config to load
        const token = generateToken({
          company_id: contact.company_id,
          contact_id: contact.contact_id,
          campaign_key,
          offer_key: campaign_key, // Use campaign key as offer key
        }, 720); // 30 days for marketing campaigns

        const tokenUrl = `${baseUrl}/m/${token}`;

        // Personalize subject
        let personalizedSubject = subject;
        personalizedSubject = personalizedSubject.replace('{{contact.first_name}}', contact.first_name || '');
        personalizedSubject = personalizedSubject.replace('{{contact.name}}', contact.full_name || contact.first_name || '');

        // Send email
        const result = await sendMarketingEmail({
          to: contact.email,
          contactName: contact.full_name || contact.first_name || '',
          companyName: (contact.companies as any)?.company_name,
          tokenUrl,
          subject: personalizedSubject,
          preview: `Personalized solutions for ${(contact.companies as any)?.company_name}`,
        });

        results.push({
          contact_id: contact.contact_id,
          email: contact.email,
          success: result.success,
          message_id: result.messageId,
          error: result.error,
        });

        // Track engagement event
        if (result.success) {
          await supabase.from('engagement_events').insert({
            company_id: contact.company_id,
            contact_id: contact.contact_id,
            source: 'vercel',
            event_name: 'marketing_email_sent',
            campaign_key,
            offer_key: campaign_key,
            url: tokenUrl,
            meta: {
              subject: personalizedSubject,
              message_id: result.messageId,
              machine_slug,
              sent_by_user_id: user.user_id,
              sent_by_email: user.email,
            },
          });
        }

        // Small delay to avoid rate limits (Resend free tier: 100/day, 2/second)
        // Adjust based on your Resend plan
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms = 2 per second

      } catch (err) {
        console.error(`[campaigns/send-bulk] Error sending to ${contact.email}:`, err);
        results.push({
          contact_id: contact.contact_id,
          email: contact.email,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} email(s), ${failureCount} failed`,
      total: results.length,
      successful: successCount,
      failed: failureCount,
      results,
    });

  } catch (err) {
    console.error('[campaigns/send-bulk] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
