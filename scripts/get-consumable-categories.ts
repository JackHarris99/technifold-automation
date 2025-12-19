/**
 * Get all unique categories for consumables
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getConsumableCategories() {
  // Fetch all consumables with their categories
  let allConsumables: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('category')
      .eq('type', 'consumable')
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }

    if (batch && batch.length > 0) {
      allConsumables = allConsumables.concat(batch);
      start += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  // Get unique categories and count products in each
  const categoryCounts = new Map<string, number>();

  allConsumables.forEach(product => {
    const category = product.category || 'Uncategorized';
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  });

  // Sort by category name
  const sorted = Array.from(categoryCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  console.log('\n=== Consumable Categories ===\n');
  console.log('Total consumables:', allConsumables.length);
  console.log('Unique categories:', sorted.length);
  console.log('');

  sorted.forEach(([category, count]) => {
    console.log(`${category.padEnd(40)} (${count} products)`);
  });
}

getConsumableCategories().catch(console.error);
