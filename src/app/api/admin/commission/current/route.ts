/**
 * Get current month commission and activity metrics for logged-in rep
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Get sales_rep_id from query params (Directors can view any rep)
    const { searchParams } = new URL(request.url);
    const querySalesRepId = searchParams.get('sales_rep_id');

    // Determine which rep to show data for
    let repId = currentUser.sales_rep_id;
    if (querySalesRepId && currentUser.role === 'director') {
      repId = querySalesRepId;
    }

    // Get current month boundaries
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthStart = firstDayOfMonth.toISOString().split('T')[0];
    const monthEnd = firstDayOfNextMonth.toISOString().split('T')[0];

    // Get all paid invoices this month with items and product types
    const { data: invoiceItems, error: invoiceItemsError } = await supabase
      .from('invoice_items')
      .select(`
        invoice_id,
        product_code,
        quantity,
        unit_price,
        invoices!inner (
          invoice_id,
          company_id,
          payment_status,
          invoice_date,
          companies!inner (
            account_owner
          )
        ),
        products!inner (
          description,
          type
        )
      `)
      .eq('invoices.payment_status', 'paid')
      .gte('invoices.invoice_date', monthStart)
      .lt('invoices.invoice_date', monthEnd);

    // Filter invoice items to only this rep's customers (non-distributors)
    const repInvoiceItems = (invoiceItems || []).filter((item: any) => {
      const accountOwner = item.invoices.companies.account_owner;
      const companyType = item.invoices.companies.type;
      return accountOwner === repId && companyType !== 'distributor';
    });

    // Calculate commission by product type
    let toolRevenue = 0;
    let toolCommission = 0;
    let consumableRevenue = 0;
    let consumableCommission = 0;
    const topProductsMap = new Map<string, { name: string; units: number; revenue: number }>();

    repInvoiceItems.forEach((item: any) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const productType = item.products.type;

      // Track top products
      if (!topProductsMap.has(item.product_code)) {
        topProductsMap.set(item.product_code, {
          name: item.products.description || item.product_code,
          units: 0,
          revenue: 0,
        });
      }
      const productEntry = topProductsMap.get(item.product_code)!;
      productEntry.units += item.quantity;
      productEntry.revenue += itemSubtotal;

      // Calculate commission
      if (productType === 'tool') {
        toolRevenue += itemSubtotal;
        toolCommission += itemSubtotal * 0.10;
      } else if (productType === 'consumable') {
        consumableRevenue += itemSubtotal;
        consumableCommission += itemSubtotal * 0.01;
      }
    });

    // Get top 5 products by revenue
    const topProducts = Array.from(topProductsMap.entries())
      .map(([code, data]) => ({ product_code: code, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Count invoices closed (unique invoices for this rep only)
    const uniqueInvoices = new Set(repInvoiceItems.map((item: any) => item.invoice_id));
    const invoicesClosedCount = uniqueInvoices.size;

    // Get activity metrics (filtered by rep's companies)
    const { data: calls } = await supabase
      .from('engagement_events')
      .select('event_id, companies!inner(account_owner)', { count: 'exact', head: true })
      .ilike('event_name', 'manual_contact_call%')
      .eq('companies.account_owner', repId)
      .gte('occurred_at', firstDayOfMonth.toISOString())
      .lt('occurred_at', firstDayOfNextMonth.toISOString());

    const { data: visits } = await supabase
      .from('engagement_events')
      .select('event_id, companies!inner(account_owner)', { count: 'exact', head: true })
      .ilike('event_name', 'manual_contact_visit%')
      .eq('companies.account_owner', repId)
      .gte('occurred_at', firstDayOfMonth.toISOString())
      .lt('occurred_at', firstDayOfNextMonth.toISOString());

    const { data: emails } = await supabase
      .from('engagement_events')
      .select('event_id, companies!inner(account_owner)', { count: 'exact', head: true })
      .ilike('event_name', 'manual_contact_email%')
      .eq('companies.account_owner', repId)
      .gte('occurred_at', firstDayOfMonth.toISOString())
      .lt('occurred_at', firstDayOfNextMonth.toISOString());

    const { data: followups } = await supabase
      .from('engagement_events')
      .select('event_id, companies!inner(account_owner)', { count: 'exact', head: true })
      .ilike('event_name', 'manual_contact_followup%')
      .eq('companies.account_owner', repId)
      .gte('occurred_at', firstDayOfMonth.toISOString())
      .lt('occurred_at', firstDayOfNextMonth.toISOString());

    const { data: meetings } = await supabase
      .from('engagement_events')
      .select('event_id, companies!inner(account_owner)', { count: 'exact', head: true })
      .ilike('event_name', 'manual_contact_meeting%')
      .eq('companies.account_owner', repId)
      .gte('occurred_at', firstDayOfMonth.toISOString())
      .lt('occurred_at', firstDayOfNextMonth.toISOString());

    // Get quotes sent this month
    const { data: quotes } = await supabase
      .from('quotes')
      .select('quote_id', { count: 'exact', head: true })
      .eq('created_by', repId)
      .not('sent_at', 'is', null)
      .gte('sent_at', firstDayOfMonth.toISOString())
      .lt('sent_at', firstDayOfNextMonth.toISOString());

    return NextResponse.json({
      month: monthStart.substring(0, 7), // "2026-01"
      commission_breakdown: {
        tools: {
          revenue: toolRevenue,
          commission: toolCommission,
          rate: 0.10,
        },
        consumables: {
          revenue: consumableRevenue,
          commission: consumableCommission,
          rate: 0.01,
          note: 'Only from assigned customers',
        },
        subscriptions: {
          revenue: 0,
          commission: 0,
          rate: 0.10,
          note: 'Coming soon',
        },
      },
      total_commission: toolCommission + consumableCommission,
      invoices_closed: invoicesClosedCount,
      activities: {
        calls: calls?.length || 0,
        visits: visits?.length || 0,
        quotes_sent: quotes?.length || 0,
        emails: emails?.length || 0,
        followups: followups?.length || 0,
        meetings: meetings?.length || 0,
      },
      top_products: topProducts,
    });
  } catch (error) {
    console.error('Error fetching commission data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commission data' },
      { status: 500 }
    );
  }
}
