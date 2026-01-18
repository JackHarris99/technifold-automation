/**
 * GET /api/admin/quotes/list
 * Fetch all quotes with filtering options
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('current_user');

    if (!userCookie) {
      console.error('[quotes/list] No current_user cookie found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse user to get info
    let session;
    try {
      session = JSON.parse(userCookie.value);
      console.log('[quotes/list] User authenticated:', session.sales_rep_id);
    } catch (e) {
      console.error('[quotes/list] Failed to parse current_user cookie:', e);
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode'); // 'my_customers' or null (all)
    const statusFilter = searchParams.get('status'); // 'sent', 'viewed', 'accepted', 'expired', 'need_followup'

    const supabase = getSupabaseClient();

    // Build query - fetch quotes without nested company select to avoid issues
    let query = supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter
    if (statusFilter) {
      const now = new Date().toISOString();

      switch (statusFilter) {
        case 'sent':
          query = query.not('sent_at', 'is', null).is('viewed_at', null);
          break;
        case 'viewed':
          query = query.not('viewed_at', 'is', null).is('accepted_at', null);
          break;
        case 'accepted':
          query = query.not('accepted_at', 'is', null);
          break;
        case 'expired':
          query = query.lt('expires_at', now).is('accepted_at', null);
          break;
      }
    }

    const { data: quotes, error: quotesError } = await query;

    if (quotesError) {
      console.error('[quotes/list] Error fetching quotes:', quotesError);
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      );
    }

    console.log('[quotes/list] Fetched quotes count:', quotes?.length || 0);

    // Early return if no quotes
    if (!quotes || quotes.length === 0) {
      console.log('[quotes/list] No quotes found in database');
      return NextResponse.json({
        success: true,
        quotes: [],
      });
    }

    // Fetch ALL company data first
    const allCompanyIds = [...new Set(quotes.map(q => q.company_id))];
    console.log('[quotes/list] Company IDs to fetch:', allCompanyIds.length);

    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner')
      .in('company_id', allCompanyIds);

    if (companiesError) {
      console.error('[quotes/list] Error fetching companies:', companiesError);
    }

    console.log('[quotes/list] Fetched companies count:', companies?.length || 0);

    // Filter by company account_owner if in "my_customers" mode
    let ownerFilteredQuotes = quotes;
    if (viewMode === 'my_customers') {
      ownerFilteredQuotes = quotes.filter((quote: any) => {
        const company = companies?.find(c => c.company_id === quote.company_id);
        return company?.account_owner === session.sales_rep_id;
      });
      console.log('[quotes/list] After owner filter:', ownerFilteredQuotes.length);
    }

    // Early return if no quotes after filtering
    if (!ownerFilteredQuotes || ownerFilteredQuotes.length === 0) {
      console.log('[quotes/list] No quotes after filtering');
      return NextResponse.json({
        success: true,
        quotes: [],
      });
    }

    // Companies already fetched above, no need to fetch again

    // Fetch contact names for quotes that have contact_id
    const contactIds = [...new Set(ownerFilteredQuotes.map(q => q.contact_id).filter(Boolean))];
    let contacts: any[] = [];
    if (contactIds.length > 0) {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('contact_id, full_name, email')
        .in('contact_id', contactIds);

      if (contactsError) {
        console.error('[quotes/list] Error fetching contacts:', contactsError);
      } else {
        contacts = contactsData || [];
      }
    }

    // Fetch engagement events to count unique contacts per quote
    const quoteIds = ownerFilteredQuotes.map(q => q.quote_id);
    const { data: engagementEvents } = await supabase
      .from('engagement_events')
      .select('contact_id, meta')
      .in('contact_id', contactIds.length > 0 ? contactIds : ['']);

    // Count unique contacts per quote from engagement events
    const quoteContactCounts: { [key: string]: Set<string> } = {};
    if (engagementEvents) {
      engagementEvents.forEach(event => {
        const quoteId = event.meta?.quote_id;
        if (quoteId && event.contact_id) {
          if (!quoteContactCounts[quoteId]) {
            quoteContactCounts[quoteId] = new Set();
          }
          quoteContactCounts[quoteId].add(event.contact_id);
        }
      });
    }

    // Get user names for created_by (filter out non-UUID values like "system")
    const userIds = [...new Set(ownerFilteredQuotes.map(q => q.created_by).filter(id => id && id !== 'system'))];
    let users: any[] = [];
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (usersError) {
        console.error('[quotes/list] Error fetching users:', usersError);
      } else {
        users = usersData || [];
      }
    }

    // Merge data
    const enrichedQuotes = ownerFilteredQuotes.map(quote => {
      const company = companies?.find(c => c.company_id === quote.company_id);
      const creator = users?.find(u => u.user_id === quote.created_by);
      const contact = contacts?.find(c => c.contact_id === quote.contact_id);
      const uniqueContactCount = quoteContactCounts[quote.quote_id]?.size || 0;

      // Determine contact display
      let contactName = null;
      let contactEmail = null;

      if (uniqueContactCount > 1) {
        contactName = 'Multiple contacts';
      } else if (contact) {
        contactName = contact.full_name;
        contactEmail = contact.email;
      }

      return {
        ...quote,
        company_name: company?.company_name || 'Unknown Company',
        account_owner: company?.account_owner === session.sales_rep_id ? 'current_user' : company?.account_owner,
        created_by_name: creator?.full_name || quote.created_by,
        contact_name: contactName,
        contact_email: contactEmail,
      };
    });

    // Apply "need_followup" filter post-fetch (requires date calculations)
    let finalQuotes = enrichedQuotes;
    if (statusFilter === 'need_followup') {
      const now = new Date();
      finalQuotes = enrichedQuotes.filter(q => {
        if (!q.sent_at || q.accepted_at) return false;

        const daysSinceSent = Math.floor((now.getTime() - new Date(q.sent_at).getTime()) / 86400000);
        if (!q.viewed_at) return daysSinceSent >= 3;

        const daysSinceViewed = Math.floor((now.getTime() - new Date(q.viewed_at).getTime()) / 86400000);
        return daysSinceViewed >= 5;
      });
    }

    return NextResponse.json({
      success: true,
      quotes: finalQuotes,
    });
  } catch (error) {
    console.error('[quotes/list] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
