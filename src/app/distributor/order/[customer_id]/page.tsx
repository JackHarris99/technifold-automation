/**
 * Distributor Order Placement Page
 * Place orders on behalf of customers
 */

import { getCurrentDistributor } from '@/lib/distributorAuth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import OrderPlacementInterface from '@/components/distributor/OrderPlacementInterface';

export default async function OrderPlacementPage({
  params,
}: {
  params: Promise<{ customer_id: string }>;
}) {
  const distributor = await getCurrentDistributor();

  if (!distributor) {
    redirect('/distributor/login');
  }

  const { customer_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch customer details
  const { data: customer, error: customerError } = await supabase
    .from('companies')
    .select('company_id, company_name, type, country')
    .eq('company_id', customer_id)
    .eq('account_owner', distributor.account_owner)
    .single();

  if (customerError || !customer) {
    redirect('/distributor');
  }

  // Fetch all consumable products
  const { data: products } = await supabase
    .from('consumables')
    .select('consumable_code, name, unit_price, pricing_tier, category, min_order_qty')
    .eq('active', true)
    .order('name', { ascending: true });

  return (
    <OrderPlacementInterface
      distributor={distributor}
      customer={customer}
      products={products || []}
    />
  );
}
