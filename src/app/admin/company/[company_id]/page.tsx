/**
 * Company Detail Page - Comprehensive View
 * Shows: Company info, contacts, products (4 types), invoices, engagement
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import CompanyDetailView from '@/components/admin/CompanyDetailView';

interface CompanyPageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { company_id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch ALL products (no pagination limit)
  let allProducts: any[] = [];
  let productStart = 0;
  const productBatchSize = 1000;
  let hasMoreProducts = true;

  while (hasMoreProducts) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('product_code, description, type, category, price, active, show_in_distributor_portal')
      .eq('active', true)
      .order('product_code')
      .range(productStart, productStart + productBatchSize - 1);

    if (error || !batch || batch.length === 0) {
      hasMoreProducts = false;
    } else {
      allProducts = allProducts.concat(batch);
      hasMoreProducts = batch.length === productBatchSize;
      productStart += productBatchSize;
    }
  }

  // Fetch all other data in parallel
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
    quotesResult,
    catalogEntriesResult,
    distributorPricingResult,
    companyPricingResult,
    companyMachinesResult,
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
        products:product_code (description, category, price, image_url)
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
        products:product_code (description, price, image_url)
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

    // Quotes
    supabase
      .from('quotes')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false }),

    // Catalog entries (for distributors)
    supabase
      .from('company_product_catalog')
      .select('product_code, visible')
      .eq('company_id', company_id),

    // Standard distributor pricing
    supabase
      .from('distributor_pricing')
      .select('product_code, standard_price'),

    // Company-specific pricing (for distributors)
    supabase
      .from('company_distributor_pricing')
      .select('product_code, custom_price')
      .eq('company_id', company_id),

    // Company Machines (Plant List)
    supabase
      .from('company_machine')
      .select(`
        id,
        machine_id,
        quantity,
        location,
        verified,
        source,
        notes,
        created_at,
        machine:machine_id (
          machine_id,
          brand,
          model,
          display_name,
          type
        )
      `)
      .eq('company_id', company_id)
      .order('created_at', { ascending: false }),
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
      quotes={quotesResult.data || []}
      products={allProducts}
      catalogEntries={catalogEntriesResult.data || []}
      distributorPricing={distributorPricingResult.data || []}
      companyPricing={companyPricingResult.data || []}
      companyMachines={companyMachinesResult.data || []}
      currentUser={user}
    />
  );
}
