/**
 * GET /api/admin/quotes/list
 * Fetch quotes with JOIN queries for performance
 * Server-side filtering, pagination, and next action calculation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateToken } from '@/lib/tokens';
import { getSalesRepFromViewMode, ViewMode } from '@/lib/viewMode';

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
    const viewModeParam = searchParams.get('viewMode');
    const statusFilter = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Determine which sales rep to filter by
    const viewMode = (viewModeParam as ViewMode) || 'all';
    const filterBySalesRep = getSalesRepFromViewMode(viewMode, session.sales_rep_id);

    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    // Build single JOIN query for performance
    let query = supabase
      .from('quotes')
      .select(`
        *,
        companies!inner(company_id, company_name, account_owner),
        contacts(contact_id, full_name, email),
        invoices(invoice_id, invoice_number, total_amount, payment_status, paid_at, due_date, status, invoice_pdf_url),
        users!quotes_created_by_fkey(user_id, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by sales rep territory
    if (filterBySalesRep) {
      query = query.eq('companies.account_owner', filterBySalesRep);
    }

    // Apply status filters server-side
    if (statusFilter) {
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
        case 'need_followup':
          // Server-side followup logic
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
          const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
          query = query
            .not('sent_at', 'is', null)
            .is('accepted_at', null)
            .or(`viewed_at.is.null.and.sent_at.lt.${threeDaysAgo},viewed_at.lt.${fiveDaysAgo}`);
          break;
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: quotes, error: quotesError, count } = await query;

    if (quotesError) {
      console.error('[quotes/list] Error fetching quotes:', quotesError);
      return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }

    console.log('[quotes/list] Fetched quotes:', quotes?.length || 0, 'Total count:', count);

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({
        success: true,
        quotes: [],
        pagination: { page, limit, total: count || 0, hasMore: false }
      });
    }

    // Calculate server-side next action and priority for each quote
    const enrichedQuotes = quotes.map((quote: any) => {
      const company = quote.companies;
      const contact = quote.contacts;
      const invoice = quote.invoices;
      const creator = quote.users;

      // Generate preview token
      const previewToken = generateToken({
        quote_id: quote.quote_id,
        company_id: quote.company_id,
        contact_id: quote.contact_id,
        object_type: 'quote',
        is_test: false,
      }, 720);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';
      const preview_url = `${baseUrl}/q/${previewToken}`;

      // Server-side next action calculation
      const nextAction = calculateNextAction(quote, invoice);

      return {
        quote_id: quote.quote_id,
        company_id: quote.company_id,
        company_name: company?.company_name || 'Unknown Company',
        account_owner: company?.account_owner === session.sales_rep_id ? 'current_user' : company?.account_owner,
        contact_name: contact?.full_name || null,
        contact_email: contact?.email || null,
        created_by: quote.created_by,
        created_by_name: creator?.full_name || quote.created_by,
        quote_type: quote.quote_type,
        status: quote.status,
        total_amount: quote.total_amount,
        created_at: quote.created_at,
        sent_at: quote.sent_at,
        viewed_at: quote.viewed_at,
        accepted_at: quote.accepted_at,
        expires_at: quote.expires_at,
        last_activity: quote.last_activity,
        free_shipping: quote.free_shipping,
        invoice_id: quote.invoice_id,
        invoice: invoice || null,
        preview_url,
        won_at: quote.won_at,
        lost_at: quote.lost_at,
        lost_reason: quote.lost_reason,
        next_action: nextAction.action,
        next_action_priority: nextAction.priority,
      };
    });

    return NextResponse.json({
      success: true,
      quotes: enrichedQuotes,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error) {
    console.error('[quotes/list] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Server-side next action calculation
function calculateNextAction(quote: any, invoice: any): { action: string; priority: 'low' | 'medium' | 'high' | 'none' } {
  const now = new Date();

  // If paid, no action needed
  if (invoice?.paid_at) {
    return { action: 'Quote completed - invoice paid', priority: 'none' };
  }

  // If invoice exists but not paid, check if overdue
  if (invoice && !invoice.paid_at) {
    if (invoice.due_date && new Date(invoice.due_date) < now) {
      const daysOverdue = Math.floor((now.getTime() - new Date(invoice.due_date).getTime()) / 86400000);
      return { action: `Invoice overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} - chase payment`, priority: 'high' };
    }
    return { action: 'Awaiting invoice payment', priority: 'medium' };
  }

  // If expired
  if (quote.expires_at && new Date(quote.expires_at) < now) {
    return { action: 'Quote expired - create new quote if customer interested', priority: 'low' };
  }

  // If viewed but no action
  if (quote.viewed_at) {
    const daysSinceViewed = Math.floor((now.getTime() - new Date(quote.viewed_at).getTime()) / 86400000);
    if (daysSinceViewed >= 5) {
      return { action: `Follow up - customer viewed ${daysSinceViewed} days ago`, priority: 'high' };
    } else if (daysSinceViewed >= 3) {
      return { action: `Consider follow up - viewed ${daysSinceViewed} days ago`, priority: 'medium' };
    }
    return { action: 'Wait for customer response', priority: 'low' };
  }

  // If sent but not viewed
  if (quote.sent_at) {
    const daysSinceSent = Math.floor((now.getTime() - new Date(quote.sent_at).getTime()) / 86400000);
    if (daysSinceSent >= 7) {
      return { action: `Not opened in ${daysSinceSent} days - send reminder`, priority: 'high' };
    } else if (daysSinceSent >= 3) {
      return { action: `Not opened yet (${daysSinceSent} days) - consider reminder`, priority: 'medium' };
    }
    return { action: 'Wait for customer to open quote', priority: 'low' };
  }

  // Draft
  return { action: 'Draft - complete and send to customer', priority: 'medium' };
}
