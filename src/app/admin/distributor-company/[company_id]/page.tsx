/**
 * Distributor Company Detail Page
 * Shows distributor-specific info: users, pricing, orders, custom catalog
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DistributorCompanyTabs from '@/components/admin/DistributorCompanyTabs';

interface PageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function DistributorCompanyPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { company_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch company details
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('company_id', company_id)
    .eq('type', 'distributor')
    .single();

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Distributor Not Found</h1>
          <Link href="/admin/distributors" className="text-blue-600 hover:text-blue-800">
            ← Back to Distributors
          </Link>
        </div>
      </div>
    );
  }

  // Fetch distributor users
  const { data: users } = await supabase
    .from('distributor_users')
    .select('*')
    .eq('company_id', company_id)
    .order('created_at');

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', company_id)
    .order('full_name');

  // Fetch recent invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('invoice_id, invoice_number, invoice_date, total_amount, status')
    .eq('company_id', company_id)
    .order('invoice_date', { ascending: false })
    .limit(20);

  // Fetch all active products
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, type, category, price, active, show_in_distributor_portal')
    .eq('active', true)
    .order('product_code');

  // Fetch catalog entries for this company
  const { data: catalogEntries } = await supabase
    .from('company_product_catalog')
    .select('product_code, visible')
    .eq('company_id', company_id);

  // Fetch standard distributor pricing
  const { data: distributorPricing } = await supabase
    .from('distributor_pricing')
    .select('product_code, standard_price');

  // Fetch company-specific pricing
  const { data: companyPricing } = await supabase
    .from('company_distributor_pricing')
    .select('product_code, custom_price')
    .eq('company_id', company_id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/admin/distributors"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Distributors
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.company_name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                  Distributor
                </span>
                {company.country && (
                  <span className="text-gray-600">📍 {company.country}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <DistributorCompanyTabs
          companyId={company_id}
          users={users || []}
          contacts={contacts || []}
          invoices={invoices || []}
          products={products || []}
          catalogEntries={catalogEntries || []}
          distributorPricing={distributorPricing || []}
          companyPricing={companyPricing || []}
        />
      </div>
    </div>
  );
}
