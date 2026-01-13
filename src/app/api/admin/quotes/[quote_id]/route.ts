/**
 * GET /api/admin/quotes/[quote_id]
 * Fetch individual quote with full details, line items, and notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quote_id: string }> }
) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quote_id } = await params;

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('current_user');

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse user to get info
    let session;
    try {
      session = JSON.parse(userCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Fetch quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_id', quote_id)
      .single();

    if (quoteError || !quote) {
      console.error('[quotes/[quote_id]] Error fetching quote:', quoteError);
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Fetch company details
    const { data: company } = await supabase
      .from('companies')
      .select('company_name, account_owner')
      .eq('company_id', quote.company_id)
      .single();

    // Fetch contact details (if contact_id exists on quote)
    let contact = null;
    if (quote.contact_id) {
      const { data: contactData } = await supabase
        .from('contacts')
        .select('contact_name, email')
        .eq('contact_id', quote.contact_id)
        .single();
      contact = contactData;
    }

    // Fetch creator details
    const { data: creator } = await supabase
      .from('users')
      .select('full_name')
      .eq('user_id', quote.created_by)
      .single();

    // Fetch line items
    const { data: lineItems, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quote_id)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('[quotes/[quote_id]] Error fetching line items:', itemsError);
    }

    // Fetch notes
    const { data: notes, error: notesError } = await supabase
      .from('quote_notes')
      .select('*')
      .eq('quote_id', quote_id)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('[quotes/[quote_id]] Error fetching notes:', notesError);
    }

    // Fetch engagement events for this quote
    const { data: engagementEvents, error: engagementError } = await supabase
      .from('engagement_events')
      .select('event_id, contact_id, event_type, event_name, created_at, meta')
      .contains('meta', { quote_id: quote_id })
      .order('created_at', { ascending: false });

    if (engagementError) {
      console.error('[quotes/[quote_id]] Error fetching engagement events:', engagementError);
    }

    // Enrich engagement events with contact names
    const engagementContactIds = [...new Set((engagementEvents || []).map(e => e.contact_id).filter(Boolean))];
    let engagementContacts: any[] = [];
    if (engagementContactIds.length > 0) {
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('contact_id, full_name, email')
        .in('contact_id', engagementContactIds);
      engagementContacts = contactsData || [];
    }

    const enrichedEngagementEvents = (engagementEvents || []).map(event => {
      const eventContact = engagementContacts.find(c => c.contact_id === event.contact_id);
      return {
        ...event,
        contact_name: eventContact?.full_name || 'Unknown',
        contact_email: eventContact?.email || null,
      };
    });

    // Build enriched quote response
    const enrichedQuote = {
      ...quote,
      company_name: company?.company_name || 'Unknown Company',
      contact_name: contact?.contact_name || null,
      contact_email: contact?.email || null,
      created_by_name: creator?.full_name || quote.created_by,
      line_items: lineItems || [],
      notes: notes || [],
      engagement_events: enrichedEngagementEvents,
    };

    return NextResponse.json({
      success: true,
      quote: enrichedQuote,
    });
  } catch (error) {
    console.error('[quotes/[quote_id]] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
