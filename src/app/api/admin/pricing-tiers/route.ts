/**
 * GET /api/admin/pricing-tiers
 * Returns standard and premium pricing tiers for consumables, and tool volume discounts
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const supabase = getSupabaseClient();

  // Load standard pricing ladder (consumables)
  const { data: standardData, error: standardError } = await supabase
    .from('standard_pricing_ladder')
    .select('min_qty, max_qty, unit_price')
    .eq('active', true)
    .order('min_qty', { ascending: true });

  if (standardError) {
    console.error('[pricing-tiers] Failed to load standard ladder:', standardError);
  }

  // Load premium pricing ladder (consumables)
  const { data: premiumData, error: premiumError } = await supabase
    .from('premium_pricing_ladder')
    .select('min_qty, max_qty, discount_pct')
    .eq('active', true)
    .order('min_qty', { ascending: true });

  if (premiumError) {
    console.error('[pricing-tiers] Failed to load premium ladder:', premiumError);
  }

  // Load tool pricing ladder
  const { data: toolData, error: toolError } = await supabase
    .from('tool_pricing_ladder')
    .select('min_qty, max_qty, discount_pct')
    .eq('active', true)
    .order('min_qty', { ascending: true });

  if (toolError) {
    console.error('[pricing-tiers] Failed to load tool ladder:', toolError);
  }

  // Transform to frontend format
  const standard = (standardData || []).map(tier => ({
    tier_name: `${tier.min_qty}-${tier.max_qty === 999 ? tier.min_qty + '+' : tier.max_qty} units`,
    min_quantity: tier.min_qty,
    max_quantity: tier.max_qty,
    unit_price: tier.unit_price,
  }));

  const premium = (premiumData || []).map(tier => ({
    tier_name: `${tier.min_qty}-${tier.max_qty === 999 ? tier.min_qty + '+' : tier.max_qty} units`,
    min_quantity: tier.min_qty,
    max_quantity: tier.max_qty,
    discount_percent: tier.discount_pct,
  }));

  const tool = (toolData || []).map(tier => ({
    tier_name: `${tier.min_qty}${tier.max_qty === 999 ? '+' : `-${tier.max_qty}`} tool${tier.min_qty > 1 ? 's' : ''}`,
    min_quantity: tier.min_qty,
    max_quantity: tier.max_qty,
    discount_percent: tier.discount_pct,
  }));

  return NextResponse.json({
    standard,
    premium,
    tool,
  });
}
