/**
 * Reorder Page - Send reorder portal links to company contacts
 * /admin/company/[company_id]/reorder
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import ReorderTab from '@/components/admin/console-tabs/ReorderTab';
import { canActOnCompany } from '@/lib/auth';

interface ReorderPageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function ReorderPage({ params }: ReorderPageProps) {
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

        {/* Reorder Tab Component */}
        <ReorderTab
          companyId={company_id}
          companyName={company.company_name}
          contacts={contacts || []}
        />
      </div>
    </div>
  );
}
