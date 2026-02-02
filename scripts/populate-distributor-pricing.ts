import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Helper function to parse CSV lines with quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  console.log('Reading stock_list_enriched_v12.csv...');
  const csvPath = path.join(process.cwd(), 'stock_list_enriched_v12.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  // Parse header
  const headers = parseCSVLine(csvLines[0]);
  const colIndices: any = {};
  headers.forEach((header, index) => {
    colIndices[header] = index;
  });

  console.log('Building distributor pricing from CSV...');
  const distributorPrices = new Map<string, number>();

  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const productCode = parts[colIndices['Product Code']] || '';
    const newDistributorPrice = parseFloat(parts[colIndices['New Distributor Price']]) || 0;

    if (productCode && newDistributorPrice > 0) {
      distributorPrices.set(productCode, newDistributorPrice);
    }
  }

  console.log(`Found ${distributorPrices.size} products with distributor pricing`);

  // Check existing distributor pricing
  console.log('\nFetching existing distributor pricing...');
  const { data: existingPricing, error: fetchError } = await supabase
    .from('distributor_pricing')
    .select('product_code, standard_price');

  if (fetchError) {
    console.error('Error fetching existing pricing:', fetchError);
    process.exit(1);
  }

  const existingMap = new Map<string, number>();
  existingPricing?.forEach((p) => {
    existingMap.set(p.product_code, parseFloat(p.standard_price));
  });

  console.log(`Found ${existingMap.size} existing distributor prices in database`);

  // Determine what needs to be inserted vs updated
  const toInsert: any[] = [];
  const toUpdate: any[] = [];

  distributorPrices.forEach((price, productCode) => {
    if (existingMap.has(productCode)) {
      const existingPrice = existingMap.get(productCode)!;
      if (existingPrice !== price) {
        toUpdate.push({ product_code: productCode, standard_price: price });
      }
    } else {
      toInsert.push({
        product_code: productCode,
        standard_price: price,
        currency: 'GBP',
        active: true
      });
    }
  });

  console.log(`\nTo insert: ${toInsert.length} new products`);
  console.log(`To update: ${toUpdate.length} products with price changes`);

  // Insert new pricing
  if (toInsert.length > 0) {
    console.log('\nInserting new distributor pricing...');
    let insertCount = 0;
    const batchSize = 100;

    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('distributor_pricing')
        .insert(batch);

      if (error) {
        console.error(`  ✗ Error inserting batch at ${i}:`, error.message);
      } else {
        insertCount += batch.length;
        if (insertCount % 100 === 0 || insertCount === toInsert.length) {
          console.log(`  Inserted ${insertCount}/${toInsert.length} products...`);
        }
      }
    }
    console.log(`✓ Inserted ${insertCount} new distributor prices`);
  }

  // Update existing pricing
  if (toUpdate.length > 0) {
    console.log('\nUpdating existing distributor pricing...');
    let updateCount = 0;

    for (const update of toUpdate) {
      const { error } = await supabase
        .from('distributor_pricing')
        .update({ standard_price: update.standard_price, updated_at: new Date().toISOString() })
        .eq('product_code', update.product_code);

      if (error) {
        console.error(`  ✗ Error updating ${update.product_code}:`, error.message);
      } else {
        updateCount++;
        if (updateCount % 100 === 0 || updateCount === toUpdate.length) {
          console.log(`  Updated ${updateCount}/${toUpdate.length} products...`);
        }
      }
    }
    console.log(`✓ Updated ${updateCount} distributor prices`);
  }

  console.log('\n✓ Distributor pricing sync complete!');
  console.log(`  Total products with distributor pricing: ${distributorPrices.size}`);
}

main().catch(console.error);
