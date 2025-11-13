/**
 * Company Console - Unified workspace for company management
 * /admin/company/[company_id]
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CompanyConsole from '@/components/admin/CompanyConsole';
import { getCompanyPermissions } from '@/lib/permissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCurrentUser } from '@/lib/auth';

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

  // Fetch orders with items from order_items table
  const { data: ordersRaw } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        product_code,
        description,
        qty,
        unit_price,
        line_total
      )
    `)
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Transform orders to include items array
  const orders = (ordersRaw || []).map(order => ({
    ...order,
    items: (order.order_items || []).map((item: any) => ({
      product_code: item.product_code,
      quantity: item.qty,
      price: item.unit_price,
      description: item.description
    }))
  }));

  // Get permissions for this company
  const permissions = await getCompanyPermissions(company);

  // Get current user for layout
  const user = await getCurrentUser();
  const userRole = user?.role === 'director' ? 'director' : 'sales_rep';

  return (
    <AdminLayout userRole={userRole}>
      <CompanyConsole
        company={company}
        salesRep={salesRep}
        machines={machines || []}
        contacts={contacts || []}
        recentEngagement={recentEngagement || []}
        orders={orders || []}
        permissions={permissions}
      />
    </AdminLayout>
  );
}
