/**
 * Auto-Calculate RFM Scores for All Companies
 * POST /api/cron/update-rfm-scores
 *
 * Calculates Recency, Frequency, Monetary scores and auto-categorizes companies
 * Runs daily to keep segmentation fresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const CRON_SECRET = process.env.CRON_SECRET;

interface RFMScore {
  recency_score: number;    // 1-5 (5 = recent, 1 = ancient)
  frequency_score: number;  // 1-5 (5 = frequent, 1 = rare)
  monetary_score: number;   // 1-5 (5 = high value, 1 = low value)
  rfm_segment: string;      // "Hot VIP", "Regular", "At Risk", etc.
}

export async function POST(request: NextRequest) {
  // Verify cron secret
  const secret = request.headers.get('x-cron-secret');
  if (!secret || secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  const startTime = Date.now();
  let companiesUpdated = 0;

  try {
    console.log('[rfm-cron] Starting RFM score calculation...');

    // Get all companies with order history
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('company_id, company_name, first_invoice_at, last_invoice_at')
      .not('last_invoice_at', 'is', null);

    if (companiesError) throw companiesError;

    console.log(`[rfm-cron] Processing ${companies?.length || 0} companies...`);

    // Get order aggregates for all companies
    const { data: orderStats, error: statsError } = await supabase
      .rpc('calculate_company_order_stats')
      .catch(() => null); // Fallback if RPC doesn't exist

    // If RPC doesn't exist, calculate manually
    const stats = orderStats || await calculateOrderStatsManually(supabase);

    // Calculate RFM scores
    const rfmScores = calculateRFMScores(companies || [], stats);

    // Update companies
    for (const [companyId, score] of Object.entries(rfmScores)) {
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          category: score.rfm_segment,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);

      if (!updateError) {
        companiesUpdated++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[rfm-cron] Complete: ${companiesUpdated} companies updated in ${duration}ms`);

    return NextResponse.json({
      success: true,
      companies_updated: companiesUpdated,
      companies_processed: companies?.length || 0,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[rfm-cron] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      companies_updated: companiesUpdated
    }, { status: 500 });
  }
}

/**
 * Calculate order stats manually if RPC doesn't exist
 */
async function calculateOrderStatsManually(supabase: any) {
  const { data: orders } = await supabase
    .from('orders')
    .select('company_id, created_at, total_amount');

  const stats: Record<string, any> = {};

  for (const order of orders || []) {
    if (!stats[order.company_id]) {
      stats[order.company_id] = {
        total_orders: 0,
        total_revenue: 0,
        last_order_date: order.created_at
      };
    }

    stats[order.company_id].total_orders++;
    stats[order.company_id].total_revenue += order.total_amount || 0;

    if (new Date(order.created_at) > new Date(stats[order.company_id].last_order_date)) {
      stats[order.company_id].last_order_date = order.created_at;
    }
  }

  return Object.entries(stats).map(([company_id, s]) => ({
    company_id,
    ...s
  }));
}

/**
 * Calculate RFM scores and assign segments
 */
function calculateRFMScores(companies: any[], orderStats: any[]): Record<string, RFMScore> {
  const now = new Date();
  const statsMap = new Map(orderStats.map(s => [s.company_id, s]));

  // Calculate thresholds
  const revenues = orderStats.map(s => s.total_revenue || 0).sort((a, b) => b - a);
  const frequencies = orderStats.map(s => s.total_orders || 0).sort((a, b) => b - a);

  const monetaryP80 = revenues[Math.floor(revenues.length * 0.2)] || 1000;
  const monetaryP60 = revenues[Math.floor(revenues.length * 0.4)] || 500;
  const monetaryP40 = revenues[Math.floor(revenues.length * 0.6)] || 200;
  const monetaryP20 = revenues[Math.floor(revenues.length * 0.8)] || 50;

  const frequencyP80 = frequencies[Math.floor(frequencies.length * 0.2)] || 20;
  const frequencyP60 = frequencies[Math.floor(frequencies.length * 0.4)] || 10;
  const frequencyP40 = frequencies[Math.floor(frequencies.length * 0.6)] || 5;
  const frequencyP20 = frequencies[Math.floor(frequencies.length * 0.8)] || 2;

  const scores: Record<string, RFMScore> = {};

  for (const company of companies) {
    const stats = statsMap.get(company.company_id);
    if (!stats) continue;

    const lastOrderDate = new Date(stats.last_order_date || company.last_invoice_at);
    const daysSinceOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

    // Recency score (1-5, 5 = most recent)
    let R = 1;
    if (daysSinceOrder <= 30) R = 5;
    else if (daysSinceOrder <= 60) R = 4;
    else if (daysSinceOrder <= 90) R = 3;
    else if (daysSinceOrder <= 180) R = 2;

    // Frequency score (1-5, 5 = most frequent)
    const totalOrders = stats.total_orders || 0;
    let F = 1;
    if (totalOrders >= frequencyP80) F = 5;
    else if (totalOrders >= frequencyP60) F = 4;
    else if (totalOrders >= frequencyP40) F = 3;
    else if (totalOrders >= frequencyP20) F = 2;

    // Monetary score (1-5, 5 = highest value)
    const totalRevenue = stats.total_revenue || 0;
    let M = 1;
    if (totalRevenue >= monetaryP80) M = 5;
    else if (totalRevenue >= monetaryP60) M = 4;
    else if (totalRevenue >= monetaryP40) M = 3;
    else if (totalRevenue >= monetaryP20) M = 2;

    // Determine segment
    let segment = 'Inactive';
    const rfmTotal = R + F + M;

    if (R >= 4 && F >= 4 && M >= 4) segment = 'Hot VIP';
    else if (R >= 4 && M >= 3) segment = 'Hot';
    else if (R >= 3 && F >= 3) segment = 'Regular';
    else if (R <= 2 && F >= 3 && M >= 3) segment = 'At Risk';
    else if (R <= 2 && M >= 4) segment = 'Hibernating VIP';
    else if (R <= 2) segment = 'Cold';
    else if (F <= 2 && M <= 2) segment = 'New/Small';
    else segment = 'Warm';

    scores[company.company_id] = {
      recency_score: R,
      frequency_score: F,
      monetary_score: M,
      rfm_segment: segment
    };
  }

  return scores;
}
