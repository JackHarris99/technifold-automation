/**
 * Sales History - Historical view of all completed deals
 * Tabs: Tool Sales, Consumable Sales, Subscriptions (Rentals), Lost Deals
 * Replaces: /admin/orders and /admin/rentals
 * ⚠️ WARNING - Uses deprecated orders table
 */

import { getCurrentUser, isDirector } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import SalesHistoryTabs from '@/components/admin/SalesHistoryTabs';
import DeprecationBanner from '@/components/admin/DeprecationBanner';

export const metadata = {
  title: 'Sales History | Technifold Admin',
  description: 'Historical view of all completed deals',
};

async function getSalesHistoryData(salesRepId: string | null) {
  const supabase = getSupabaseClient();

  // ========================================
  // 1. TOOL SALES (all time, paid)
  // ========================================
  const { data: toolOrdersRaw } = await supabase
    .from('orders')
    .select(`
      order_id,
      total_amount,
      created_at,
      status,
      company_id,
      companies(company_name, account_owner),
      order_items(product_code, description, qty, unit_price, products(type))
    `)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  // Filter by territory and product type = 'tool'
  const toolOrders = (toolOrdersRaw || [])
    .filter(order => {
      if (salesRepId && (order.companies as any)?.account_owner !== salesRepId) return false;
      // Check if any item is a tool
      return (order.order_items || []).some((item: any) => item.products?.type === 'tool');
    });

  // ========================================
  // 2. CONSUMABLE SALES (all time, paid)
  // ========================================
  const { data: consumableOrdersRaw } = await supabase
    .from('orders')
    .select(`
      order_id,
      total_amount,
      created_at,
      status,
      company_id,
      companies(company_name, account_owner),
      order_items(product_code, description, qty, unit_price, products(type))
    `)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  // Filter by territory and product type = 'consumable'
  const consumableOrders = (consumableOrdersRaw || [])
    .filter(order => {
      if (salesRepId && (order.companies as any)?.account_owner !== salesRepId) return false;
      // Check if all items are consumables
      return (order.order_items || []).every((item: any) => item.products?.type === 'consumable');
    });

  // ========================================
  // 3. RENTAL SUBSCRIPTIONS (all, including ended)
  // ========================================
  const { data: allRentals } = await supabase
    .from('rental_agreements')
    .select(`
      rental_id,
      monthly_price,
      status,
      start_date,
      end_date,
      tool_code,
      company_id,
      companies(company_name, account_owner)
    `)
    .order('start_date', { ascending: false });

  // Filter by territory
  const rentals = salesRepId
    ? (allRentals || []).filter(r => (r.companies as any)?.account_owner === salesRepId)
    : (allRentals || []);

  // ========================================
  // 4. LOST DEALS (all lost statuses)
  // ========================================
  const { data: allLostDeals } = await supabase
    .from('quote_requests')
    .select(`
      quote_request_id,
      created_at,
      updated_at,
      status,
      estimated_value,
      company_id,
      companies(company_id, company_name, account_owner),
      contacts(contact_id, full_name, email)
    `)
    .in('status', ['lost', 'too_soon', 'not_ready', 'too_expensive'])
    .order('updated_at', { ascending: false });

  // Filter by territory
  const lostDeals = salesRepId
    ? (allLostDeals || []).filter(qr => (qr.companies as any)?.account_owner === salesRepId)
    : (allLostDeals || []);

  return {
    toolOrders,
    consumableOrders,
    rentals,
    lostDeals,
  };
}

export default async function SalesHistoryPage() {
  const user = await getCurrentUser();
  const director = await isDirector();

  if (!user) {
    redirect('/admin/login');
  }

  const salesRepId = director ? null : user.sales_rep_id;
  const data = await getSalesHistoryData(salesRepId);

  return (
      <DeprecationBanner
        message="This page uses historic Sage order data which is messy and inconsistent. For company sales history, use the new company detail pages."
        replacementUrl="/admin/sales/companies"
        replacementLabel="View Companies"
        reason="Orders table contains historic Sage data with incorrect prices. Use company_tools, company_consumables, and company_product_history fact tables for accurate data."
      />
      <SalesHistoryTabs {...data} />
  );
}
