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
  console.log('Loading product pricing data...');

  // Read Stock List 2 for sales prices
  const stockCsvPath = path.join(process.cwd(), 'Stock List 2.csv');
  const stockCsvContent = fs.readFileSync(stockCsvPath, 'utf-8');
  const stockCsvLines = stockCsvContent.trim().split('\n');

  const salesPrices = new Map<string, number>();
  for (let i = 1; i < stockCsvLines.length; i++) {
    const line = stockCsvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length >= 3) {
      const productCode = parts[0];
      const salesPrice = parseFloat(parts[2]) || 0;
      if (productCode) {
        salesPrices.set(productCode, salesPrice);
      }
    }
  }
  console.log(`Loaded ${salesPrices.size} sales prices`);

  // Read Gina distributor pricing
  const ginaCsvPath = path.join(process.cwd(), 'distributor price - Gina.csv');
  const ginaCsvContent = fs.readFileSync(ginaCsvPath, 'utf-8');
  const ginaCsvLines = ginaCsvContent.trim().split('\n');

  const ginaPrices = new Map<string, number>();
  for (let i = 2; i < ginaCsvLines.length; i++) {
    const line = ginaCsvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length >= 2) {
      const productCode = parts[0];
      const price = parseFloat(parts[1]) || 0;
      if (productCode && price > 0) {
        ginaPrices.set(productCode, price);
      }
    }
  }
  console.log(`Loaded ${ginaPrices.size} Gina prices`);

  console.log('\nFetching company product history from 01/07/2024 to 30/06/2025...');

  // Fetch all company_product_history in the date range with company info
  let allHistory: any[] = [];
  let hasMore = true;
  let offset = 0;
  const batchSize = 1000;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('company_product_history')
      .select('product_code, total_quantity, company_id, last_purchased_at, companies!inner(company_name, type)')
      .gte('last_purchased_at', '2024-07-01')
      .lte('last_purchased_at', '2025-06-30')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Error fetching company product history:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allHistory = allHistory.concat(batch);
      offset += batchSize;
      console.log(`  Fetched ${allHistory.length} product history records so far...`);

      if (batch.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`✓ Found ${allHistory.length} product history records in date range`);

  // Calculate revenue
  console.log('\nCalculating revenue...');

  let totalRevenue = 0;
  let distributorRevenue = 0;
  let customerRevenue = 0;
  let skippedDistributorItems = 0;
  let processedItems = 0;

  for (const record of allHistory) {
    const isDistributor = (record.companies as any)?.type === 'distributor';
    const productCode = record.product_code;
    const quantity = record.total_quantity || 0;

    let price = 0;

    if (isDistributor) {
      // Use Gina pricing for distributors
      const ginaPrice = ginaPrices.get(productCode);
      if (ginaPrice) {
        price = ginaPrice;
        distributorRevenue += price * quantity;
      } else {
        // Skip if no Gina price available
        skippedDistributorItems++;
        continue;
      }
    } else {
      // Use sales price for customers
      const salesPrice = salesPrices.get(productCode);
      if (salesPrice) {
        price = salesPrice;
        customerRevenue += price * quantity;
      } else {
        // Still count even if no price (would be 0)
        customerRevenue += 0;
      }
    }

    totalRevenue += price * quantity;
    processedItems++;
  }

  console.log('\n=== REVENUE SUMMARY ===');
  console.log(`Period: 01/07/2024 - 30/06/2025`);
  console.log(`Total Product History Records: ${allHistory.length}`);
  console.log(`Processed Records: ${processedItems}`);
  console.log(`Skipped Distributor Records (no Gina price): ${skippedDistributorItems}`);
  console.log('');
  console.log(`Distributor Revenue (Gina pricing): £${distributorRevenue.toFixed(2)}`);
  console.log(`Customer Revenue (Sales pricing): £${customerRevenue.toFixed(2)}`);
  console.log(`TOTAL REVENUE: £${totalRevenue.toFixed(2)}`);

  // Create summary CSV
  const outputPath = path.join(process.cwd(), 'revenue_summary_2024-2025.csv');
  const csvOutput = `Period,Start Date,End Date,Total Records,Processed Records,Skipped Distributor Records,Distributor Revenue,Customer Revenue,Total Revenue
FY 2024-2025,2024-07-01,2025-06-30,${allHistory.length},${processedItems},${skippedDistributorItems},${distributorRevenue.toFixed(2)},${customerRevenue.toFixed(2)},${totalRevenue.toFixed(2)}
`;

  fs.writeFileSync(outputPath, csvOutput);
  console.log(`\n✓ Summary saved to: ${outputPath}`);
}

main().catch(console.error);
