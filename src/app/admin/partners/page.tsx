/**
 * Partner Network Management Page
 * List all commission-based partner distributors
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PartnerListClient from '@/components/admin/partners/PartnerListClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function PartnerNetworkPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'director') {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch all partner distributors
  const { data: partners } = await supabase
    .from('companies')
    .select('*')
    .eq('type', 'distributor')
    .eq('distributor_type', 'partner')
    .order('company_name', { ascending: true });

  // For each partner, get customer count and commission totals
  const partnersWithMetrics = await Promise.all(
    (partners || []).map(async (partner) => {
      // Get customer count
      const { count: customerCount } = await supabase
        .from('distributor_customers')
        .select('id', { count: 'exact', head: true })
        .eq('distributor_id', partner.company_id)
        .eq('status', 'active');

      // Get total pending commissions
      const { data: pendingCommissions } = await supabase
        .from('distributor_commissions')
        .select('distributor_commission_amount')
        .eq('distributor_id', partner.company_id)
        .eq('distributor_payment_status', 'pending');

      const pendingTotal = (pendingCommissions || []).reduce(
        (sum, comm) => sum + (comm.distributor_commission_amount || 0),
        0
      );

      // Get total paid commissions (all time)
      const { data: paidCommissions } = await supabase
        .from('distributor_commissions')
        .select('distributor_commission_amount')
        .eq('distributor_id', partner.company_id)
        .eq('distributor_payment_status', 'paid');

      const paidTotal = (paidCommissions || []).reduce(
        (sum, comm) => sum + (comm.distributor_commission_amount || 0),
        0
      );

      return {
        ...partner,
        customer_count: customerCount || 0,
        pending_commission: pendingTotal,
        paid_commission: paidTotal,
        total_commission: pendingTotal + paidTotal,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/admin/distributors/dashboard"
                  className="text-gray-700 hover:text-gray-900 text-sm"
                >
                  ← Distributor Dashboard
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Partner Network</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage commission-based partner distributors
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <PartnerListClient partners={partnersWithMetrics || []} />
      </div>
    </div>
  );
}
