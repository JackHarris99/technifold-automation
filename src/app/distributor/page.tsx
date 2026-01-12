/**
 * Distributor Dashboard
 * Place orders and view invoice history
 */

import { getCurrentDistributor } from '@/lib/distributorAuth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import DistributorDashboard from '@/components/distributor/DistributorDashboard';

export default async function DistributorDashboardPage() {
  const distributor = await getCurrentDistributor();

  if (!distributor) {
    redirect('/distributor/login');
  }

  const supabase = getSupabaseClient();

  // Fetch distributor's own invoices
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('invoice_id, invoice_number, invoice_date, total_amount, status')
    .eq('company_id', distributor.company_id)
    .order('invoice_date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Distributor Dashboard] Error fetching invoices:', error);
  }

  // Fetch all products with static pricing
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, price, pricing_tier, category, type, currency')
    .eq('active', true)
    .order('description', { ascending: true });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                {distributor.company_name}
              </h1>
              <p className="text-[15px] text-[#475569] font-[500] mt-2">
                Distributor Portal
              </p>
            </div>
            <form action="/api/distributor/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-[13px] font-[600] text-[#475569] hover:text-[#1e40af] transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <DistributorDashboard
          distributor={distributor}
          invoices={invoices || []}
          products={products || []}
        />
      </div>
    </div>
  );
}
