/**
 * NEW Consolidated Company Detail Page
 * Single source of truth for company information
 * Uses fact-based architecture (no historic orders reconstruction)
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import CompanyOverview from '@/components/admin/company-detail/CompanyOverview';
import ToolsSection from '@/components/admin/company-detail/ToolsSection';
import ConsumablesSection from '@/components/admin/company-detail/ConsumablesSection';
import SubscriptionsSection from '@/components/admin/company-detail/SubscriptionsSection';
import EngagementTimeline from '@/components/admin/company-detail/EngagementTimeline';
import InvoicesSection from '@/components/admin/company-detail/InvoicesSection';
import ActionsPanel from '@/components/admin/company-detail/ActionsPanel';

interface CompanyDetailPageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { company_id } = await params;
  const supabase = getSupabaseClient();

  // 1. Fetch company basics
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('company_id', company_id)
    .single();

  if (companyError || !company) {
    notFound();
  }

  // 2. Fetch contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', company_id)
    .order('is_primary', { ascending: false });

  // 3. Fetch tools owned (fact table)
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

  // 4. Fetch consumables history (fact table)
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
    .order('last_ordered_at', { ascending: false })
    .limit(20);

  // 5. Fetch product history (fact table - NEW)
  const { data: productHistory } = await supabase
    .from('company_product_history')
    .select(`
      product_code,
      product_type,
      first_purchased_at,
      last_purchased_at,
      total_purchases,
      total_quantity,
      last_purchase_amount,
      products:product_code (description, category)
    `)
    .eq('company_id', company_id)
    .order('last_purchased_at', { ascending: false })
    .limit(10);

  // 6. Fetch active subscriptions
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

  // 7. Fetch recent engagement events (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: engagementEvents } = await supabase
    .from('engagement_events')
    .select(`
      event_id,
      occurred_at,
      event_type,
      event_name,
      url,
      meta,
      contact_id,
      contacts:contact_id (full_name, email)
    `)
    .eq('company_id', company_id)
    .gte('occurred_at', thirtyDaysAgo.toISOString())
    .order('occurred_at', { ascending: false })
    .limit(50);

  // 8. Fetch Stripe invoices (future only, no historic)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/admin/sales/companies"
                  className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
                >
                  ← Back to Companies
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  {company.company_name}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {company.country || 'UK'} • {company.company_id}
                  {company.category && ` • ${company.category}`}
                </p>
              </div>
              <ActionsPanel companyId={company_id} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <CompanyOverview company={company} contacts={contacts || []} />
              <ToolsSection tools={tools || []} companyId={company_id} />
              <ConsumablesSection consumables={consumables || []} />
              {productHistory && productHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Other Product History</h2>
                  <div className="space-y-2">
                    {productHistory.map((item: any) => (
                      <div key={item.product_code} className="text-sm border-b border-gray-100 pb-2">
                        <div className="font-semibold">{item.products?.description || item.product_code}</div>
                        <div className="text-gray-600">
                          {item.product_type} • Last purchased: {new Date(item.last_purchased_at).toLocaleDateString('en-GB')}
                          {' '}• Total: {item.total_quantity} units
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <InvoicesSection invoices={invoices || []} />
            </div>

            {/* Sidebar (1/3) */}
            <div className="space-y-6">
              <SubscriptionsSection subscriptions={subscriptions || []} />
              <EngagementTimeline events={engagementEvents || []} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function generateMetadata({ params }: CompanyDetailPageProps) {
  const { company_id } = await params;
  const supabase = getSupabaseClient();
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('company_id', company_id)
    .single();

  return {
    title: `${company?.company_name || 'Company'} - Technifold Admin`,
    description: 'Company detail page',
  };
}
