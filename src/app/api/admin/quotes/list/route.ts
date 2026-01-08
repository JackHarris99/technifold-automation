/**
 * GET /api/admin/quotes/list
 * Fetch all quotes with filtering options
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode'); // 'my_customers' or null (all)
    const statusFilter = searchParams.get('status'); // 'sent', 'viewed', 'accepted', 'expired', 'need_followup'

    const supabase = getSupabaseClient();

    // Build query
    let query = supabase
      .from('quotes')
      .select(`
        quote_id,
        company_id,
        created_by,
        quote_type,
        status,
        total_amount,
        created_at,
        sent_at,
        viewed_at,
        accepted_at,
        expires_at,
        companies:company_id(account_owner)
      `)
      .order('created_at', { ascending: false });

    // Note: We'll filter by company account_owner after fetching

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

    // Filter by company account_owner if in "my_customers" mode
    let ownerFilteredQuotes = quotes;
    if (viewMode === 'my_customers') {
      ownerFilteredQuotes = quotes.filter((quote: any) =>
        quote.companies?.account_owner === session.sales_rep_id
      );
    }

    // Early return if no quotes after filtering
    if (!ownerFilteredQuotes || ownerFilteredQuotes.length === 0) {
      return NextResponse.json({
        success: true,
        quotes: [],
      });
    }

    // Fetch company names and account owners
    const companyIds = [...new Set(ownerFilteredQuotes.map(q => q.company_id))];
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner')
      .in('company_id', companyIds);

    if (companiesError) {
      console.error('[quotes/list] Error fetching companies:', companiesError);
    }

    // Fetch contact names
    const quoteIds = ownerFilteredQuotes.map(q => q.quote_id);
    const { data: quoteItems } = await supabase
      .from('quote_items')
      .select('quote_id')
      .in('quote_id', quoteIds)
      .limit(1);

    // Get user names for created_by
    const userIds = [...new Set(ownerFilteredQuotes.map(q => q.created_by))];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, full_name')
      .in('user_id', userIds);

    if (usersError) {
      console.error('[quotes/list] Error fetching users:', usersError);
    }

    // Merge data
    const enrichedQuotes = ownerFilteredQuotes.map(quote => {
      const company = companies?.find(c => c.company_id === quote.company_id);
      const creator = users?.find(u => u.user_id === quote.created_by);

      return {
        ...quote,
        company_name: company?.company_name || 'Unknown Company',
        account_owner: company?.account_owner === session.sales_rep_id ? 'current_user' : company?.account_owner,
        created_by_name: creator?.full_name || quote.created_by,
        contact_name: null, // TODO: Get from quote metadata or contact table
        contact_email: null,
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
