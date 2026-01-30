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
        .select('full_name, email')
        .eq('contact_id', quote.contact_id)
        .single();
      contact = contactData;
    }

    // Fetch creator details (only if created_by is a valid UUID)
    let creator = null;
    if (quote.created_by && quote.created_by !== 'system') {
      const { data: creatorData } = await supabase
        .from('users')
        .select('full_name')
        .eq('user_id', quote.created_by)
        .single();
      creator = creatorData;
    }

    // Fetch line items
    const { data: lineItems, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quote_id)
      .order('line_number', { ascending: true });

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
      .select('event_id, contact_id, event_type, event_name, occurred_at, meta')
      .contains('meta', { quote_id: quote_id })
      .order('occurred_at', { ascending: false });

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
      const isInternalView = event.meta?.internal_view === true;
      const internalUser = event.meta?.internal_user || null;

      return {
        ...event,
        contact_name: eventContact?.full_name || 'Unknown',
        contact_email: eventContact?.email || null,
        internal_view: isInternalView,
        internal_user: internalUser,
      };
    });

    // Filter to only show customer views (exclude internal views)
    const customerEngagementEvents = enrichedEngagementEvents.filter(e => !e.internal_view);

    // Build enriched quote response (only show customer engagement, not internal views)
    const enrichedQuote = {
      ...quote,
      company_name: company?.company_name || 'Unknown Company',
      contact_name: contact?.full_name || null,
      contact_email: contact?.email || null,
      created_by_name: creator?.full_name || quote.created_by,
      line_items: lineItems || [],
      notes: notes || [],
      engagement_events: customerEngagementEvents,
      internal_views_count: enrichedEngagementEvents.length - customerEngagementEvents.length,
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

/**
 * PATCH /api/admin/quotes/[quote_id]
 * Update quote details including line items, prices, and free_shipping flag
 */
export async function PATCH(
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
    const body = await request.json();
    const { line_items, free_shipping, ...otherFields } = body;

    const supabase = getSupabaseClient();

    // Fetch existing quote to verify it exists
    const { data: existingQuote } = await supabase
      .from('quotes')
      .select('quote_id, company_id')
      .eq('quote_id', quote_id)
      .single();

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check territory permission
    const { canActOnCompany } = await import('@/lib/auth');
    const permission = await canActOnCompany(existingQuote.company_id);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    // If line_items provided, update them and recalculate totals
    if (line_items && Array.isArray(line_items) && line_items.length > 0) {
      // Calculate new totals
      const subtotal = line_items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const discountAmount = line_items.reduce((sum, item) =>
        sum + ((item.unit_price * item.quantity * (item.discount_percent || 0)) / 100), 0
      );
      const total = subtotal - discountAmount;

      // Delete existing line items
      await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', quote_id);

      // Insert new line items
      const quoteItems = line_items.map((item, index) => ({
        quote_id: quote_id,
        product_code: item.product_code,
        line_number: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        line_total: (item.unit_price * item.quantity) - ((item.unit_price * item.quantity * (item.discount_percent || 0)) / 100),
        product_type: item.product_type,
        category: item.category,
        image_url: item.image_url,
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) {
        console.error('[quotes/[quote_id]] Line items update error:', itemsError);
        return NextResponse.json(
          { error: 'Failed to update quote line items' },
          { status: 500 }
        );
      }

      // Update quote with new totals
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          subtotal,
          discount_amount: discountAmount,
          total_amount: total,
          free_shipping: free_shipping !== undefined ? free_shipping : undefined,
          ...otherFields,
          updated_at: new Date().toISOString(),
        })
        .eq('quote_id', quote_id);

      if (updateError) {
        console.error('[quotes/[quote_id]] Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update quote' },
          { status: 500 }
        );
      }
    } else {
      // Just update quote fields (no line items changes)
      const updateData: any = {
        ...otherFields,
        updated_at: new Date().toISOString(),
      };

      if (free_shipping !== undefined) {
        updateData.free_shipping = free_shipping;
      }

      const { error: updateError } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('quote_id', quote_id);

      if (updateError) {
        console.error('[quotes/[quote_id]] Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update quote' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Quote updated successfully',
    });
  } catch (error) {
    console.error('[quotes/[quote_id]] PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/quotes/[quote_id]
 * Delete a quote and its related records
 */
export async function DELETE(
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

    const supabase = getSupabaseClient();

    // Fetch existing quote
    const { data: existingQuote } = await supabase
      .from('quotes')
      .select('quote_id, company_id, company:companies(company_name)')
      .eq('quote_id', quote_id)
      .single();

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check territory permission
    const { canActOnCompany } = await import('@/lib/auth');
    const permission = await canActOnCompany(existingQuote.company_id);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    // Delete quote (CASCADE will delete quote_items and quote_notes)
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('quote_id', quote_id);

    if (deleteError) {
      console.error('[quotes/[quote_id]] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete quote' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.user_id,
      user_email: user.email,
      user_name: user.full_name,
      action_type: 'quote_deleted',
      entity_type: 'quote',
      entity_id: quote_id,
      description: `Deleted quote ${quote_id} for ${(existingQuote.company as any)?.company_name || existingQuote.company_id}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully',
    });
  } catch (error) {
    console.error('[quotes/[quote_id]] DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
