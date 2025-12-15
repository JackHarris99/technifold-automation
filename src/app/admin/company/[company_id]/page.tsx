/**
 * Company Console - Unified workspace for company management
 * /admin/company/[company_id]
 * Comprehensive view with fact tables + all company data
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CompanyDetailUnified from '@/components/admin/CompanyDetailUnified';
import { getCompanyPermissions } from '@/lib/permissions';
import AdminLayout from '@/components/admin/AdminLayout';

interface CompanyConsolePageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function CompanyConsolePage({ params }: CompanyConsolePageProps) {
  const { company_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch company details
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

  // Fetch company machines
  const { data: machines } = await supabase
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
    .limit(100);

  // Fetch contacts (all of them - companies rarely have >1000 contacts)
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', company_id)
    .limit(500);

  // Fetch recent engagement
  const { data: recentEngagement } = await supabase
    .from('engagement_events')
    .select('*')
    .eq('company_id', company_id)
    .order('occurred_at', { ascending: false })
    .limit(50);

  // Fetch tools owned (FACT TABLE)
  const { data: tools } = await supabase
    .from('company_tools')
    .select(`
      tool_code,
      first_seen_at,
      last_seen_at,
      total_units,
      products:tool_code (description, category, price, image_url)
    `)
    .eq('company_id', company_id)
    .order('last_seen_at', { ascending: false });

  // Fetch consumables history (FACT TABLE)
  const { data: consumables } = await supabase
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
    .order('last_ordered_at', { ascending: false });

  // Fetch active subscriptions
  const { data: subscriptions } = await supabase
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
    .order('created_at', { ascending: false });

  // Fetch Stripe invoices (FUTURE ONLY - no historic Sage data)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Get permissions for this company
  const permissions = await getCompanyPermissions(company);

  return (
    <AdminLayout>
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
    </AdminLayout>
  );
}
