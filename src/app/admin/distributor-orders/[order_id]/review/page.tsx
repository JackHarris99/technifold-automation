/**
 * Distributor Order Review
 * Admin reviews stock availability, addresses, and shipping before creating invoice
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import DistributorOrderReview from '@/components/admin/DistributorOrderReview';

interface Props {
  params: Promise<{ order_id: string }>;
}

export default async function DistributorOrderReviewPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { order_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch order with company details
  const { data: order, error: orderError } = await supabase
    .from('distributor_orders')
    .select(`
      *,
      companies (
        company_name,
        vat_number,
        stripe_customer_id
      )
    `)
    .eq('order_id', order_id)
    .single();

  if (orderError || !order) {
    console.error('[Order Review] Error fetching order:', orderError);
    notFound();
  }

  // Fetch order items
  const { data: items, error: itemsError } = await supabase
    .from('distributor_order_items')
    .select('*')
    .eq('order_id', order_id)
    .order('created_at', { ascending: true });

  if (itemsError) {
    console.error('[Order Review] Error fetching items:', itemsError);
  }

  const orderItems = items || [];

  // Fetch product images for items
  const productCodes = orderItems.map((item) => item.product_code);
  const { data: products } = await supabase
    .from('products')
    .select('product_code, image_url')
    .in('product_code', productCodes);

  const productImageMap = new Map(
    (products || []).map((p) => [p.product_code, p.image_url])
  );

  // Attach images to items
  const itemsWithImages = orderItems.map((item) => ({
    ...item,
    image_url: productImageMap.get(item.product_code) || null,
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto">
        <DistributorOrderReview
          order={order}
          items={itemsWithImages}
          currentUser={user}
        />
      </div>
    </div>
  );
}
