/**
 * Company Detail Page - Admin Control Plane
 * Shows comprehensive company view with tabs
 */

import { getSupabaseClient } from '@/lib/supabase';
import CompanyHeader from '@/components/admin/CompanyHeader';
import CompanyDetailTabs from '@/components/admin/CompanyDetailTabs';
import { notFound } from 'next/navigation';

interface CompanyDetailPageProps {
  params: Promise<{
    companyId: string;
  }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { companyId } = await params;
  const supabase = getSupabaseClient();

  // Fetch company details
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (companyError || !company) {
    notFound();
  }

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', companyId)
    .order('full_name', { ascending: true });

  // Fetch orders (recent 50)
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch machines
  const { data: machines } = await supabase
    .from('company_machines')
    .select('*')
    .eq('company_id', companyId)
    .order('confirmed', { ascending: false, nullsFirst: false });

  // Fetch engagement metrics (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: engagementEvents } = await supabase
    .from('engagement_events')
    .select('event_type, occurred_at')
    .eq('company_id', companyId)
    .gte('occurred_at', ninetyDaysAgo)
    .order('occurred_at', { ascending: false });

  // Calculate key metrics
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount_total || 0), 0) || 0;
  const engagementScore = engagementEvents?.length || 0;
  const lastOrderDate = orders?.[0]?.created_at || null;

  const metrics = {
    totalOrders,
    totalRevenue,
    engagementScore,
    lastOrderDate,
  };

  // Get compatible products from view
  const { data: compatibleProducts } = await supabase
    .from('vw_company_consumable_payload_v2')
    .select('*')
    .eq('company_id', companyId)
    .single();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <CompanyHeader company={company} />

      <div className="mt-6">
        <CompanyDetailTabs
          company={company}
          contacts={contacts || []}
          orders={orders || []}
          machines={machines || []}
          metrics={metrics}
          compatibleProducts={compatibleProducts}
        />
      </div>
    </div>
  );
}
