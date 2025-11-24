/**
 * GET /api/admin/campaigns/contacts
 * Get contacts with filters for campaign targeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser, getUserRepFilter } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;

    // Get filters from query params
    const category = searchParams.get('category');
    const hasMachine = searchParams.get('has_machine');
    const lastOrderDays = searchParams.get('last_order_days');
    const consentOnly = searchParams.get('consent_only') === 'true';

    // Territory filter (sales reps see only their companies)
    const repFilter = await getUserRepFilter();

    // Build query
    let query = supabase
      .from('contacts')
      .select(`
        contact_id,
        email,
        full_name,
        first_name,
        last_name,
        company_id,
        marketing_consent,
        companies!inner (
          company_id,
          company_name,
          category,
          account_owner
        )
      `)
      .not('email', 'is', null);

    // Apply territory filter
    if (repFilter) {
      query = query.eq('companies.account_owner', repFilter);
    }

    // Apply consent filter
    if (consentOnly) {
      query = query.eq('marketing_consent', true);
    }

    // Apply category filter
    if (category) {
      query = query.eq('companies.category', category);
    }

    // Fetch contacts
    const { data: contactsData, error } = await query;

    if (error) {
      console.error('[campaigns/contacts] Error:', error);
      return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 });
    }

    // Now filter by machine and last order (need separate queries)
    let contacts = contactsData || [];

    // Filter by machine status
    if (hasMachine === 'true' || hasMachine === 'false') {
      const companyIds = contacts.map(c => c.company_id);
      const { data: companiesWithMachines } = await supabase
        .from('company_machine')
        .select('company_id')
        .in('company_id', companyIds);

      const companiesWithMachineSet = new Set(
        companiesWithMachines?.map(cm => cm.company_id) || []
      );

      contacts = contacts.filter(c => {
        const hasMachineValue = companiesWithMachineSet.has(c.company_id);
        return hasMachine === 'true' ? hasMachineValue : !hasMachineValue;
      });
    }

    // Filter by last order date
    if (lastOrderDays) {
      const daysAgo = parseInt(lastOrderDays);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      const companyIds = contacts.map(c => c.company_id);
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('company_id')
        .in('company_id', companyIds)
        .gte('created_at', cutoffDate.toISOString());

      const companiesWithRecentOrders = new Set(
        recentOrders?.map(o => o.company_id) || []
      );

      contacts = contacts.filter(c => companiesWithRecentOrders.has(c.company_id));
    }

    // Format contacts
    const formattedContacts = contacts.map(c => ({
      contact_id: c.contact_id,
      email: c.email,
      full_name: c.full_name || c.first_name || c.last_name || 'Unknown',
      company_id: c.company_id,
      company_name: (c.companies as any)?.company_name,
      company_category: (c.companies as any)?.category,
      has_machine: false, // Will be set by machine filter above
      marketing_consent: c.marketing_consent || false,
    }));

    return NextResponse.json({
      contacts: formattedContacts,
      count: formattedContacts.length,
    });

  } catch (err) {
    console.error('[campaigns/contacts] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
