import * as fs from 'fs';
import * as path from 'path';

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

function escapeCSVField(field: any): string {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function main() {
  console.log('Reading updated stock_list_enriched_v9.csv...');
  const v9Path = path.join(process.cwd(), 'stock_list_enriched_v9.csv');
  const v9Content = fs.readFileSync(v9Path, 'utf-8');
  const v9Lines = v9Content.trim().split('\n');

  // Parse V9 header
  const v9Headers = parseCSVLine(v9Lines[0]);
  const v9ColIndices: any = {};
  v9Headers.forEach((header, index) => {
    v9ColIndices[header] = index;
  });

  console.log('Reading original Stock List 2 for old sales prices...');
  const stockPath = path.join(process.cwd(), 'Stock List 2.csv');
  const stockContent = fs.readFileSync(stockPath, 'utf-8');
  const stockLines = stockContent.trim().split('\n');

  // Build map of original sales prices
  const originalSalesPrices = new Map<string, number>();
  for (let i = 1; i < stockLines.length; i++) {
    const line = stockLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length >= 3) {
      const productCode = parts[0];
      const salesPrice = parseFloat(parts[2]) || 0;
      originalSalesPrices.set(productCode, salesPrice);
    }
  }

  console.log('Reading Gina pricing for old distributor prices...');
  const ginaPath = path.join(process.cwd(), 'distributor price - Gina.csv');
  const ginaContent = fs.readFileSync(ginaPath, 'utf-8');
  const ginaLines = ginaContent.trim().split('\n');

  const oldDistributorPrices = new Map<string, number>();
  for (let i = 2; i < ginaLines.length; i++) {
    const line = ginaLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length >= 2) {
      const productCode = parts[0];
      const price = parseFloat(parts[1]) || 0;
      if (productCode && price > 0) {
        oldDistributorPrices.set(productCode, price);
      }
    }
  }

  console.log('Reading last order dates from V9...');
  // We'll need to get last order dates - let me read from V5 since V9 might not have it
  const v5Path = path.join(process.cwd(), 'stock_list_enriched_v5.csv');
  const v5Content = fs.readFileSync(v5Path, 'utf-8');
  const v5Lines = v5Content.trim().split('\n');
  const v5Headers = parseCSVLine(v5Lines[0]);
  const v5ColIndices: any = {};
  v5Headers.forEach((header, index) => {
    v5ColIndices[header] = index;
  });

  const lastOrderDates = new Map<string, string>();
  for (let i = 1; i < v5Lines.length; i++) {
    const line = v5Lines[i].trim();
    if (!line) continue;
    const parts = parseCSVLine(line);
    const productCode = parts[v5ColIndices['Product Code']] || '';
    const lastOrderDate = parts[v5ColIndices['Last Order Date']] || '';
    if (productCode) {
      lastOrderDates.set(productCode, lastOrderDate);
    }
  }

  const output = [];

  // Process each row from V9
  for (let i = 1; i < v9Lines.length; i++) {
    const line = v9Lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    const productCode = parts[v9ColIndices['Product Code']] || '';
    const description = parts[v9ColIndices['Description']] || '';
    const type = parts[v9ColIndices['Type']] || '';
    const category = parts[v9ColIndices['Category']] || '';
    const newSalesPrice = parseFloat(parts[v9ColIndices['New Sales Price']]) || 0;

    // Get old sales price from Stock List 2
    const oldSalesPrice = originalSalesPrices.get(productCode) || 0;

    // Calculate sales price difference
    const salesPriceDiff = newSalesPrice > 0 && oldSalesPrice > 0
      ? (newSalesPrice - oldSalesPrice).toFixed(2)
      : '';

    // Get old distributor price (Gina)
    const oldDistributorPrice = oldDistributorPrices.get(productCode) || 0;

    // Calculate NEW distributor price as 60% of NEW sales price
    const newDistributorPrice = newSalesPrice > 0
      ? (newSalesPrice * 0.60).toFixed(2)
      : '';

    // Calculate distributor price difference
    const distPriceDiff = newDistributorPrice && oldDistributorPrice > 0
      ? (parseFloat(newDistributorPrice) - oldDistributorPrice).toFixed(2)
      : '';

    // Get last order date
    const lastOrderDate = lastOrderDates.get(productCode) || '';

    output.push({
      'Product Code': productCode,
      'Description': description,
      'Type': type,
      'Category': category,
      'Last Order Date': lastOrderDate,
      'Old Sales Price': oldSalesPrice || '',
      'New Sales Price': newSalesPrice || '',
      'Difference': salesPriceDiff,
      '': '', // Gap 1
      ' ': '', // Gap 2
      'Old Distributor Price': oldDistributorPrice || '',
      'New Distributor Price': newDistributorPrice,
      'Difference ': distPriceDiff
    });
  }

  console.log(`Processed ${output.length} products`);

  // Create CSV
  const headers = [
    'Product Code',
    'Description',
    'Type',
    'Category',
    'Last Order Date',
    'Old Sales Price',
    'New Sales Price',
    'Difference',
    '',
    ' ',
    'Old Distributor Price',
    'New Distributor Price',
    'Difference '
  ];

  let csvOutput = headers.join(',') + '\n';
  for (const row of output) {
    csvOutput += headers.map(h => escapeCSVField(row[h])).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v10.csv');
  fs.writeFileSync(outputPath, csvOutput);

  const withOldSales = output.filter(p => p['Old Sales Price'] !== '');
  const withNewDist = output.filter(p => p['New Distributor Price'] !== '');
  const withOldDist = output.filter(p => p['Old Distributor Price'] !== '');

  console.log(`\n✓ Created stock_list_enriched_v10.csv with ${output.length} products`);
  console.log(`- Products with old sales price: ${withOldSales.length}`);
  console.log(`- Products with new distributor price (60% of new sales): ${withNewDist.length}`);
  console.log(`- Products with old distributor price: ${withOldDist.length}`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
