/**
 * Update consumable cost_price and price based on category
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Pricing rules by category
const COST_PRICE_UPDATES = [
  { category: 'Cutting Boss', cost_price: 20.00 },
  { category: 'Cutting Knife', cost_price: 20.00 },
  { category: 'Female Receiver Ring', cost_price: 1.00 },
  { category: 'Micro-Perforation Blade', cost_price: 27.00 },
  { category: 'Nylon Sleeve', cost_price: 2.00 },
  { category: 'Plastic Creasing Band', cost_price: 1.00 },
  { category: 'Section Scoring Band', cost_price: 1.00 },
  { category: 'Spacer', cost_price: 1.00 },
  { category: 'Waste-Stripper', cost_price: 1.00 },
];

const SALES_PRICE_UPDATES = [
  { category: 'Blade Seal', price: 33.00 },
  { category: 'Cutting Boss', price: 99.00 },
  { category: 'Cutting Knife', price: 59.00 },
  { category: 'Female Receiver Ring', price: 33.00 },
  { category: 'Gripper Band', price: 33.00 },
  { category: 'Micro-Perforation Blade', price: 79.00 },
  { category: 'Nylon Sleeve', price: 33.00 },
  { category: 'Plastic Creasing Band', price: 33.00 },
  { category: 'Rubber Creasing Band', price: 33.00 },
  { category: 'Section Scoring Band', price: 33.00 },
  { category: 'Spacer', price: 33.00 },
  { category: 'Waste-Stripper', price: 33.00 },
];

async function updateConsumablePricing() {
  console.log('=== Updating Consumable Pricing ===\n');

  // Step 1: Change Quad-Creaser from consumable to tool
  console.log('Step 1: Changing Quad-Creaser from consumable to tool...');
  const { data: quadCreaser, error: quadError } = await supabase
    .from('products')
    .update({ type: 'tool' })
    .eq('type', 'consumable')
    .eq('category', 'Quad-Creaser')
    .select('product_code');

  if (quadError) {
    console.error('Error updating Quad-Creaser:', quadError);
  } else {
    console.log(`✓ Changed ${quadCreaser?.length || 0} Quad-Creaser products to tool type\n`);
  }

  // Step 2: Update cost prices
  console.log('Step 2: Updating cost prices...');
  let costUpdates = 0;

  for (const rule of COST_PRICE_UPDATES) {
    const { data, error } = await supabase
      .from('products')
      .update({ cost_price: rule.cost_price })
      .eq('type', 'consumable')
      .eq('category', rule.category)
      .select('product_code');

    if (error) {
      console.error(`Error updating ${rule.category}:`, error.message);
    } else {
      const count = data?.length || 0;
      costUpdates += count;
      console.log(`  ${rule.category.padEnd(30)} → £${rule.cost_price.toFixed(2)} (${count} products)`);
    }
  }
  console.log(`✓ Updated cost_price for ${costUpdates} products\n`);

  // Step 3: Update sales prices
  console.log('Step 3: Updating sales prices...');
  let priceUpdates = 0;

  for (const rule of SALES_PRICE_UPDATES) {
    const { data, error } = await supabase
      .from('products')
      .update({ price: rule.price })
      .eq('type', 'consumable')
      .eq('category', rule.category)
      .select('product_code');

    if (error) {
      console.error(`Error updating ${rule.category}:`, error.message);
    } else {
      const count = data?.length || 0;
      priceUpdates += count;
      console.log(`  ${rule.category.padEnd(30)} → £${rule.price.toFixed(2)} (${count} products)`);
    }
  }
  console.log(`✓ Updated price for ${priceUpdates} products\n`);

  // Step 4: Show summary of updated products by category
  console.log('Step 4: Verifying updates...\n');

  const { data: allConsumables } = await supabase
    .from('products')
    .select('category, cost_price, price')
    .eq('type', 'consumable')
    .order('category');

  if (allConsumables) {
    const categoryStats = new Map<string, { count: number; avgCost: number; avgPrice: number }>();

    allConsumables.forEach(p => {
      const category = p.category || 'Uncategorized';
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { count: 0, avgCost: 0, avgPrice: 0 });
      }
      const stats = categoryStats.get(category)!;
      stats.count++;
      stats.avgCost += p.cost_price || 0;
      stats.avgPrice += p.price || 0;
    });

    console.log('Category Summary:');
    console.log('Category'.padEnd(35) + 'Products'.padEnd(12) + 'Avg Cost'.padEnd(12) + 'Avg Price');
    console.log('-'.repeat(70));

    Array.from(categoryStats.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([category, stats]) => {
        const avgCost = stats.avgCost / stats.count;
        const avgPrice = stats.avgPrice / stats.count;
        console.log(
          category.padEnd(35) +
          stats.count.toString().padEnd(12) +
          `£${avgCost.toFixed(2)}`.padEnd(12) +
          `£${avgPrice.toFixed(2)}`
        );
      });
  }

  console.log('\n=== Update Complete ===');
}

updateConsumablePricing().catch(console.error);
