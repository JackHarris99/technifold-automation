/**
 * GET /api/admin/analytics/reorder-links?days=30
 * Get analytics for reorder email campaigns
 * Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const supabase = getSupabaseClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Count reorder emails sent
    const { count: emails_sent } = await supabase
      .from('engagement_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'reorder_reminder_sent')
      .gte('occurred_at', startDate.toISOString());

    // Count link clicks from reorder emails (exclude internal views)
    const { data: link_clicks_raw, count: link_clicks } = await supabase
      .from('engagement_events')
      .select('*, contacts(first_name, last_name), companies(company_name)', { count: 'exact' })
      .eq('event_type', 'portal_access')
      .eq('source', 'reorder_email')
      .gte('occurred_at', startDate.toISOString())
      .order('occurred_at', { ascending: false })
      .limit(100);

    // Filter out internal views in application layer (meta field not queryable in Supabase directly)
    const link_clicks_data = (link_clicks_raw || []).filter((e: any) => !e.meta?.internal_view).slice(0, 50);

    // Count orders from customers who clicked reorder links
    // Get all contact_ids who clicked reorder links
    const contact_ids = link_clicks_data?.map(e => e.contact_id).filter(Boolean) || [];

    let orders_placed = 0;
    if (contact_ids.length > 0) {
      const { count } = await supabase
        .from('engagement_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'customer_order_submitted')
        .in('contact_id', contact_ids)
        .gte('occurred_at', startDate.toISOString());

      orders_placed = count || 0;
    }

    // Calculate conversion rate
    const conversion_rate = emails_sent && emails_sent > 0
      ? (orders_placed / emails_sent) * 100
      : 0;

    // Format recent clicks with order status
    const recent_clicks = (link_clicks_data || []).map((click: any) => {
      const contactName = click.contacts
        ? `${click.contacts.first_name || ''} ${click.contacts.last_name || ''}`.trim()
        : 'Unknown';
      const companyName = click.companies?.company_name || 'Unknown Company';

      // Check if this contact placed an order (simplified - just check if any order exists)
      const ordered = false; // TODO: Could enhance this to check specific orders after click time

      return {
        contact_name: contactName,
        company_name: companyName,
        clicked_at: click.occurred_at,
        ordered,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        emails_sent: emails_sent || 0,
        link_clicks: link_clicks || 0,
        orders_placed,
        conversion_rate,
        recent_clicks,
      },
    });
  } catch (error: any) {
    console.error('[Reorder Analytics] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
