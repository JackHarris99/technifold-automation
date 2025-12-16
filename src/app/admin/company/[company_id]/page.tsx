/**
 * Company Console - Unified workspace for company management
 * /admin/company/[company_id]
 * Comprehensive view with fact tables + all company data
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CompanyDetailUnified from '@/components/admin/CompanyDetailUnified';
import { getCompanyPermissions } from '@/lib/permissions';

interface CompanyConsolePageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function CompanyConsolePage({ params }: CompanyConsolePageProps) {
  const { company_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch company details first (need this to validate company exists)
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('company_id', company_id)
    .single();

  if (error || !company) {
    notFound();
  }

  // Sales rep info comes from account_owner column directly
  const salesRep = company.account_owner ? {
    rep_name: company.account_owner,
    email: null // Email not stored in simplified structure
  } : null;

  // Fetch all related data in parallel for faster page load
  const [
    machinesResult,
    contactsResult,
    engagementResult,
    toolsResult,
    consumablesResult,
    subscriptionsResult,
    invoicesResult,
  ] = await Promise.all([
    // Fetch company machines
    supabase
      .from('company_machine')
      .select(`
        *,
        machines:machine_id(
          machine_id,
          brand,
          model,
          display_name,
          slug
        )
      `)
      .eq('company_id', company_id)
      .order('confidence_score', { ascending: false })
      .limit(100),

    // Fetch contacts
    supabase
      .from('contacts')
      .select('*')
      .eq('company_id', company_id)
      .limit(500),

    // Fetch recent engagement
    supabase
      .from('engagement_events')
      .select('*')
      .eq('company_id', company_id)
      .order('occurred_at', { ascending: false })
      .limit(50),

    // Fetch tools owned (FACT TABLE)
    supabase
      .from('company_tools')
      .select(`
        tool_code,
        first_seen_at,
        last_seen_at,
        total_units,
        products:tool_code (description, category, price, image_url)
      `)
      .eq('company_id', company_id)
      .order('last_seen_at', { ascending: false }),

    // Fetch consumables history (FACT TABLE)
    supabase
      .from('company_consumables')
      .select(`
        consumable_code,
        first_ordered_at,
        last_ordered_at,
        total_orders,
        total_quantity,
        last_order_amount,
        products:consumable_code (description, category, price)
      `)
      .eq('company_id', company_id)
      .order('last_ordered_at', { ascending: false }),

    // Fetch active subscriptions
    supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_tools (
          tool_code,
          added_at,
          products:tool_code (description)
        ),
        contacts:contact_id (full_name, email)
      `)
      .eq('company_id', company_id)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false }),

    // Fetch Stripe invoices
    supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const machines = machinesResult.data;
  const contacts = contactsResult.data;
  const recentEngagement = engagementResult.data;
  const tools = toolsResult.data;
  const consumables = consumablesResult.data;
  const subscriptions = subscriptionsResult.data;
  const invoices = invoicesResult.data;

  // Get permissions for this company
  const permissions = await getCompanyPermissions(company);

  return (
      <CompanyDetailUnified
        company={company}
        salesRep={salesRep}
        machines={machines || []}
        contacts={contacts || []}
        recentEngagement={recentEngagement || []}
        tools={tools || []}
        consumables={consumables || []}
        subscriptions={subscriptions || []}
        invoices={invoices || []}
        permissions={permissions}
      />
  );
}
