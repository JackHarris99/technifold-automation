/**
 * GET /api/track/open
 * Track email opens via 1x1 tracking pixel
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignToken = searchParams.get('ct');

    if (!campaignToken) {
      // Return transparent 1x1 pixel
      return new NextResponse(
        Buffer.from(
          'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          'base64'
        ),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    const supabase = getSupabaseClient();

    // Lookup campaign send by token
    const { data: send } = await supabase
      .from('campaign_sends')
      .select('send_id, opened_at, campaign_id, prospect_contact_id, prospect_company_id')
      .eq('token', campaignToken)
      .single();

    if (send) {
      // Check if this is first open
      if (!send.opened_at) {
        // First open
        await supabase
          .from('campaign_sends')
          .update({
            opened_at: new Date().toISOString(),
            last_opened_at: new Date().toISOString(),
            total_opens: 1,
          })
          .eq('send_id', send.send_id);

        // Update campaign stats
        await supabase
          .from('marketing_campaigns')
          .update({
            total_opens: supabase.raw('total_opens + 1'),
          })
          .eq('campaign_id', send.campaign_id);
      } else {
        // Subsequent open
        await supabase
          .from('campaign_sends')
          .update({
            last_opened_at: new Date().toISOString(),
            total_opens: supabase.raw('total_opens + 1'),
          })
          .eq('send_id', send.send_id);
      }

      // Log engagement event
      await supabase
        .from('engagement_events')
        .insert({
          prospect_contact_id: send.prospect_contact_id,
          prospect_company_id: send.prospect_company_id,
          campaign_send_id: send.send_id,
          event_type: 'email_open',
          event_name: 'campaign_email_opened',
          source: 'marketing_campaign',
        });

      // Update prospect last_engaged_at
      await supabase
        .from('prospect_contacts')
        .update({ last_engaged_at: new Date().toISOString() })
        .eq('prospect_contact_id', send.prospect_contact_id);

      await supabase
        .from('prospect_companies')
        .update({ last_engaged_at: new Date().toISOString() })
        .eq('prospect_company_id', send.prospect_company_id);
    }

    // Return transparent 1x1 pixel
    return new NextResponse(
      Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      ),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error: any) {
    console.error('[TrackOpen] Error:', error);

    // Always return pixel even on error
    return new NextResponse(
      Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      ),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }
}
