/**
 * Sales Center - Streamlined Company View
 * Shows: Tools, Subscriptions, Consumables (NO full order history)
 */

import { getSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StreamlinedCompanyView from '@/components/admin/StreamlinedCompanyView';

interface PageProps {
  params: Promise<{ company_id: string }>;
}

export default async function SalesCompanyDetailPage({ params }: PageProps) {
  const { company_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch company details
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('company_id', company_id)
    .single();

  if (companyError || !company) {
    redirect('/admin/sales/companies');
  }

  // Fetch tools
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('company_id', company_id)
    .order('install_date', { ascending: false });

  // Fetch subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('company_id', company_id)
    .in('status', ['active', 'trial'])
    .order('created_at', { ascending: false });

  // Fetch last consumable orders (not full history, just recent)
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('order_id, created_at, items, total_amount')
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })
    .limit(3); // Only last 3 orders

  // Extract consumables from orders
  const consumables: any[] = [];
  recentOrders?.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        if (item.product_code?.startsWith('CONS')) {
          consumables.push({
            ...item,
            order_date: order.created_at,
          });
        }
      });
    }
  });

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', company_id)
    .order('is_primary', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/sales/companies"
                className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
              >
                ← Back to My Territory
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {company.company_name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {company.country || 'UK'} • {company.company_id}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/admin/quote-builder?company_id=${company_id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                + Create Quote
              </Link>
              <Link
                href={`/admin/test-invoice?company_id=${company_id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                + Send Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>

      <StreamlinedCompanyView
        company={company}
        tools={tools || []}
        subscriptions={subscriptions || []}
        consumables={consumables}
        contacts={contacts || []}
      />
    </div>
  );
}
