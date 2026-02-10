/**
 * GET /api/track/click
 * Track email clicks and apply auto-tags
 *
 * URL Format:
 * /api/track/click?token=<token>&target=<url>&action=<action>&value=<value>
 *
 * Token payload contains: {contact_id, company_id, campaign_id, template_id}
 * Action/value trigger auto-tagging
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import {
  parseClickAction,
  generateTagsFromClick,
  applyTagsToContact,
} from '@/lib/marketing/auto-tagger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const targetUrl = searchParams.get('target');

  // Default redirect (if something fails)
  const defaultRedirect = targetUrl || 'https://technifold.com';

  try {
    // Verify token
    if (!token) {
      console.error('[Click Track] No token provided');
      return NextResponse.redirect(defaultRedirect);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.contact_id) {
      console.error('[Click Track] Invalid token or missing contact_id');
      return NextResponse.redirect(defaultRedirect);
    }

    const supabase = getSupabaseClient();

    // Extract click metadata
    const contactId = payload.contact_id;
    const companyId = payload.company_id;
    const campaignId = (payload as any).campaign_id;
    const templateId = (payload as any).template_id;

    // Parse click action (for auto-tagging)
    const clickAction = parseClickAction(searchParams);

    // Record click in email_clicks table
    try {
      await supabase.from('email_clicks').insert({
        contact_id: contactId,
        company_id: companyId,
        campaign_id: campaignId,
        clicked_at: new Date().toISOString(),
        click_url: targetUrl || 'unknown',
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });
    } catch (clickError) {
      console.error('[Click Track] Failed to record click:', clickError);
      // Don't fail the redirect if click recording fails
    }

    // Apply auto-tags if action provided
    if (clickAction) {
      try {
        const tags = generateTagsFromClick(clickAction);

        if (tags.length > 0) {
          const result = await applyTagsToContact(contactId, tags, {
            campaign_id: campaignId,
            template_id: templateId,
            click_url: targetUrl || undefined,
          });

          console.log(
            `[Click Track] Applied ${result.tags_applied} tags to contact ${contactId}`,
            tags.map((t) => `${t.category}:${t.value}`)
          );
        }
      } catch (tagError) {
        console.error('[Click Track] Failed to apply auto-tags:', tagError);
        // Don't fail the redirect if tagging fails
      }
    }

    // Update campaign click count (if campaign_id present)
    if (campaignId) {
      try {
        await supabase.rpc('increment_campaign_clicks', {
          p_campaign_id: campaignId,
        });
      } catch (statsError) {
        console.error('[Click Track] Failed to update campaign stats:', statsError);
        // Ignore if stats update fails
      }
    }

    // Update template click count (if template_id present)
    if (templateId) {
      try {
        await supabase
          .from('email_templates')
          .update({ clicks_count: supabase.raw('clicks_count + 1') })
          .eq('template_id', templateId);
      } catch (statsError) {
        console.error('[Click Track] Failed to update template stats:', statsError);
        // Ignore if stats update fails
      }
    }

    // Redirect to target URL
    return NextResponse.redirect(targetUrl || 'https://technifold.com');
  } catch (error) {
    console.error('[Click Track] Error:', error);
    // Always redirect even if tracking fails
    return NextResponse.redirect(defaultRedirect);
  }
}
