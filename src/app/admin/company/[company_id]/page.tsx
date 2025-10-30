/**
 * Company Console - Unified workspace for company management
 * /admin/company/[company_id]
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CompanyConsole from '@/components/admin/CompanyConsole';

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
    .order('confidence_score', { ascending: false });

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', company_id);

  // Fetch recent engagement
  const { data: recentEngagement } = await supabase
    .from('engagement_events')
    .select('*')
    .eq('company_id', company_id)
    .order('occurred_at', { ascending: false })
    .limit(50);

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <CompanyConsole
      company={company}
      machines={machines || []}
      contacts={contacts || []}
      recentEngagement={recentEngagement || []}
      orders={orders || []}
    />
  );
}
