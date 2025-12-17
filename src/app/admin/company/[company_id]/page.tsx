/**
 * Company Detail Page - Comprehensive View
 * Shows: Company info, contacts, products (4 types), invoices, engagement
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CompanyDetailView from '@/components/admin/CompanyDetailView';

interface CompanyPageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { company_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch all data in parallel
  const [
    companyResult,
    contactsResult,
    toolsResult,
    consumablesResult,
    partsResult,
    subscriptionToolsResult,
    invoicesResult,
    engagementResult,
    subscriptionsResult,
    shippingAddressesResult,
  ] = await Promise.all([
    // Company
    supabase
      .from('companies')
      .select('*')
      .eq('company_id', company_id)
      .single(),

    // Contacts
    supabase
      .from('contacts')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false }),

    // Purchased Tools
    supabase
      .from('company_product_history')
      .select(`
        product_code,
        first_purchased_at,
        last_purchased_at,
        total_purchases,
        total_quantity,
        source,
        products:product_code (description, category, price, image_url)
      `)
      .eq('company_id', company_id)
      .eq('product_type', 'tool')
      .order('last_purchased_at', { ascending: false }),

    // Purchased Consumables
    supabase
      .from('company_product_history')
      .select(`
        product_code,
        first_purchased_at,
        last_purchased_at,
        total_purchases,
        total_quantity,
        source,
        products:product_code (description, category, price)
      `)
      .eq('company_id', company_id)
      .eq('product_type', 'consumable')
      .order('last_purchased_at', { ascending: false }),

    // Purchased Parts/Other
    supabase
      .from('company_product_history')
      .select(`
        product_code,
        first_purchased_at,
        last_purchased_at,
        total_purchases,
        total_quantity,
        source,
        products:product_code (description, price)
      `)
      .eq('company_id', company_id)
      .eq('product_type', 'part')
      .order('last_purchased_at', { ascending: false }),

    // Tools on Subscription
    supabase
      .from('subscription_tools')
      .select(`
        tool_code,
        added_at,
        added_by,
        removed_at,
        subscriptions:subscription_id (
          subscription_id,
          status,
          monthly_price
        ),
        products:tool_code (description, rental_price_monthly)
      `)
      .eq('subscriptions.company_id', company_id)
      .is('removed_at', null)
      .order('added_at', { ascending: false }),

    // Recent Invoices (Stripe - going forward only)
    supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company_id)
      .order('invoice_date', { ascending: false })
      .limit(20),

    // Recent Engagement
    supabase
      .from('engagement_events')
      .select('*')
      .eq('company_id', company_id)
      .order('occurred_at', { ascending: false })
      .limit(50),

    // Active Subscriptions
    supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', company_id)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false }),

    // Shipping Addresses
    supabase
      .from('shipping_addresses')
      .select('*')
      .eq('company_id', company_id)
      .order('is_default', { ascending: false }),
  ]);

  if (companyResult.error || !companyResult.data) {
    console.error('[Company] Not found:', company_id);
    notFound();
  }

  return (
    <CompanyDetailView
      company={companyResult.data}
      contacts={contactsResult.data || []}
      purchasedTools={toolsResult.data || []}
      purchasedConsumables={consumablesResult.data || []}
      purchasedParts={partsResult.data || []}
      subscriptionTools={subscriptionToolsResult.data || []}
      invoices={invoicesResult.data || []}
      engagement={engagementResult.data || []}
      subscriptions={subscriptionsResult.data || []}
      shippingAddresses={shippingAddressesResult.data || []}
    />
  );
}
