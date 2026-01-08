/**
 * GET /api/admin/quotes/[quote_id]
 * Fetch individual quote with full details, line items, and notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quote_id: string }> }
) {
  try {
    const { quote_id } = await params;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse session to get user info
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
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

    // Build enriched quote response
    const enrichedQuote = {
      ...quote,
      company_name: company?.company_name || 'Unknown Company',
      contact_name: contact?.contact_name || null,
      contact_email: contact?.email || null,
      created_by_name: creator?.full_name || quote.created_by,
      line_items: lineItems || [],
      notes: notes || [],
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
