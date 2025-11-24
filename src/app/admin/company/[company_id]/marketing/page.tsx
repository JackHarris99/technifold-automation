/**
 * Marketing Page - Send machine-specific marketing to company contacts
 * /admin/company/[company_id]/marketing
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import MarketingTab from '@/components/admin/console-tabs/MarketingTab';
import { canActOnCompany } from '@/lib/auth';

interface MarketingPageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function MarketingPage({ params }: MarketingPageProps) {
  const { company_id } = await params;
  const supabase = getSupabaseClient();

  // Check permissions
  const permission = await canActOnCompany(company_id);
  if (!permission.allowed) {
    redirect('/admin/company');
  }

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
    .order('confidence_score', { ascending: false })
    .limit(100);

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', company_id)
    .limit(500);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href={`/admin/company/${company_id}`}
            className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold"
          >
            ← Back to {company.company_name}
          </Link>
        </div>

        {/* Marketing Tab Component */}
        <MarketingTab
          companyId={company_id}
          companyName={company.company_name}
          machines={machines || []}
          contacts={contacts || []}
        />
      </div>
    </div>
  );
}
