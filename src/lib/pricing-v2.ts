/**
 * Pricing Engine V2 - Database-Driven
 * Pricing DATA (tiers, discounts) stored in Supabase
 * Pricing LOGIC (how to apply them) in this code
 */

import { getSupabaseClient } from './supabase';

export interface CartItem {
  product_code: string;
  quantity: number;
  category: string;
  base_price: number;
  type?: string;
  pricing_tier?: string;
}

export interface PricedCartItem extends CartItem {
  unit_price: number;
  line_total: number;
  discount_applied?: string;
}

interface StandardPricingTier {
  min_qty: number;
  max_qty: number;
  unit_price: number;
}

interface PremiumPricingTier {
  min_qty: number;
  max_qty: number;
  discount_pct: number;
}

// Cache for pricing ladders (refreshed every 5 minutes)
let standardLadderCache: { data: StandardPricingTier[]; expires: number } | null = null;
let premiumLadderCache: { data: PremiumPricingTier[]; expires: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get standard pricing ladder from database (with caching)
 */
async function getStandardPricingLadder(): Promise<StandardPricingTier[]> {
  const now = Date.now();

  if (standardLadderCache && standardLadderCache.expires > now) {
    return standardLadderCache.data;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('standard_pricing_ladder')
    .select('min_qty, max_qty, unit_price')
    .eq('active', true)
    .order('min_qty', { ascending: true });

  if (error || !data || data.length === 0) {
    console.error('[pricing] CRITICAL: Failed to load standard_pricing_ladder from database:', error);
    throw new Error('Pricing system failure: Could not load standard consumable pricing tiers');
  }

  standardLadderCache = {
    data: data || [],
    expires: now + CACHE_TTL,
  };

  return data || [];
}

/**
 * Get premium pricing ladder from database (with caching)
 */
async function getPremiumPricingLadder(): Promise<PremiumPricingTier[]> {
  const now = Date.now();

  if (premiumLadderCache && premiumLadderCache.expires > now) {
    return premiumLadderCache.data;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('premium_pricing_ladder')
    .select('min_qty, max_qty, discount_pct')
    .eq('active', true)
    .order('min_qty', { ascending: true });

  if (error || !data || data.length === 0) {
    console.error('[pricing] CRITICAL: Failed to load premium_pricing_ladder from database:', error);
    throw new Error('Pricing system failure: Could not load premium consumable pricing tiers');
  }

  premiumLadderCache = {
    data: data || [],
    expires: now + CACHE_TTL,
  };

  return data || [];
}

/**
 * Get unit price for a quantity from standard ladder
 */
function getStandardTierPrice(quantity: number, ladder: StandardPricingTier[]): number {
  for (const tier of ladder) {
    if (quantity >= tier.min_qty && quantity <= tier.max_qty) {
      return tier.unit_price;
    }
  }
  // Default to highest tier if quantity exceeds ladder
  const highestTierPrice = ladder[ladder.length - 1]?.unit_price;
  if (!highestTierPrice) {
    throw new Error('Pricing system failure: No pricing tiers found in standard ladder');
  }
  return highestTierPrice;
}

/**
 * Get discount percentage for a quantity from premium ladder
 */
function getPremiumDiscount(quantity: number, ladder: PremiumPricingTier[]): number {
  for (const tier of ladder) {
    if (quantity >= tier.min_qty && quantity <= tier.max_qty) {
      return tier.discount_pct / 100; // Convert to decimal
    }
  }
  // Default to highest discount if quantity exceeds ladder
  return (ladder[ladder.length - 1]?.discount_pct || 0) / 100;
}

/**
 * Calculate prices for all items in cart
 */
export async function calculateCartPricing(items: CartItem[]): Promise<{
  items: PricedCartItem[];
  subtotal: number;
  validation_errors: string[];
}> {
  const validation_errors: string[] = [];
  const pricedItems: PricedCartItem[] = [];

  // Load pricing ladders from database
  const [standardLadder, premiumLadder] = await Promise.all([
    getStandardPricingLadder(),
    getPremiumPricingLadder(),
  ]);

  // Separate items by pricing tier
  const standardItems = items.filter(item => item.pricing_tier === 'standard');
  const premiumItems = items.filter(item => item.pricing_tier === 'premium');
  const otherItems = items.filter(item => !item.pricing_tier || (item.pricing_tier !== 'standard' && item.pricing_tier !== 'premium'));

  // Load max quantity rules from database
  const supabase = getSupabaseClient();
  const { data: maxQtyRules, error: rulesError } = await supabase
    .from('pricing_rules')
    .select('pricing_tier, value')
    .eq('rule_type', 'max_qty_per_sku')
    .eq('active', true);

  if (rulesError || !maxQtyRules) {
    console.error('[pricing] Failed to load max quantity rules:', rulesError);
    throw new Error('Pricing system failure: Could not load max quantity rules');
  }

  // Extract max quantities by tier (parse to number since DB returns numeric as string)
  const maxQtyStandard = parseFloat(maxQtyRules.find(r => r.pricing_tier === 'standard')?.value || '15');
  const maxQtyPremium = parseFloat(maxQtyRules.find(r => r.pricing_tier === 'premium')?.value || '10');

  // Validate max quantities per SKU (forces product diversification)
  standardItems.forEach(item => {
    if (item.quantity > maxQtyStandard) {
      validation_errors.push(
        `${item.product_code}: Maximum ${maxQtyStandard} units per SKU (you have ${item.quantity})`
      );
    }
  });

  premiumItems.forEach(item => {
    if (item.quantity > maxQtyPremium) {
      validation_errors.push(
        `${item.product_code}: Maximum ${maxQtyPremium} units per SKU (you have ${item.quantity})`
      );
    }
  });

  // Calculate STANDARD tier pricing (based on TOTAL quantity across all standard products)
  const standardTotalQty = standardItems.reduce((sum, item) => sum + item.quantity, 0);
  const standardUnitPrice = getStandardTierPrice(standardTotalQty, standardLadder);

  standardItems.forEach(item => {
    const unit_price = standardUnitPrice;
    const line_total = unit_price * item.quantity;
    pricedItems.push({
      ...item,
      unit_price,
      line_total,
      discount_applied: `Tier pricing: ${standardTotalQty} total units @ £${standardUnitPrice.toFixed(2)}`,
    });
  });

  // Calculate PREMIUM tier pricing (percentage discount per SKU)
  premiumItems.forEach(item => {
    const discount = getPremiumDiscount(item.quantity, premiumLadder);
    const unit_price = item.base_price * (1 - discount);
    const line_total = unit_price * item.quantity;
    pricedItems.push({
      ...item,
      unit_price,
      line_total,
      discount_applied: discount > 0 ? `${(discount * 100).toFixed(0)}% volume discount` : undefined,
    });
  });

  // Calculate OTHER products (no special pricing)
  otherItems.forEach(item => {
    const unit_price = item.base_price;
    const line_total = unit_price * item.quantity;
    pricedItems.push({
      ...item,
      unit_price,
      line_total,
    });
  });

  const subtotal = pricedItems.reduce((sum, item) => sum + item.line_total, 0);

  return {
    items: pricedItems,
    subtotal,
    validation_errors,
  };
}

/**
 * Check if a category uses tiered pricing
 */
export function isTieredPricing(pricingTier: string | null): boolean {
  return pricingTier === 'standard' || pricingTier === 'premium';
}

/**
 * Get max quantity allowed for a product based on its pricing tier
 */
export function getMaxQuantity(pricingTier: string | null): number | null {
  if (pricingTier === 'standard') return 20;
  if (pricingTier === 'premium') return 10;
  return null; // No limit
}
