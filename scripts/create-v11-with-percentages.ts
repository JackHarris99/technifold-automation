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
  console.log('Reading stock_list_enriched_v10.csv...');
  const v10Path = path.join(process.cwd(), 'stock_list_enriched_v10.csv');
  const v10Content = fs.readFileSync(v10Path, 'utf-8');
  const v10Lines = v10Content.trim().split('\n');

  // Parse V10 header
  const v10Headers = parseCSVLine(v10Lines[0]);
  const v10ColIndices: any = {};
  v10Headers.forEach((header, index) => {
    v10ColIndices[header] = index;
  });

  const output = [];

  // Process each row from V10
  for (let i = 1; i < v10Lines.length; i++) {
    const line = v10Lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    const productCode = parts[v10ColIndices['Product Code']] || '';
    const description = parts[v10ColIndices['Description']] || '';
    const type = parts[v10ColIndices['Type']] || '';
    const category = parts[v10ColIndices['Category']] || '';
    const oldSalesPrice = parseFloat(parts[v10ColIndices['Old Sales Price']]) || 0;
    const newSalesPrice = parseFloat(parts[v10ColIndices['New Sales Price']]) || 0;
    const oldDistributorPrice = parseFloat(parts[v10ColIndices['Old Distributor Price']]) || 0;
    const newDistributorPrice = parseFloat(parts[v10ColIndices['New Distributor Price']]) || 0;

    // Calculate sales price difference
    const salesPriceDiff = newSalesPrice > 0 && oldSalesPrice > 0
      ? (newSalesPrice - oldSalesPrice).toFixed(2)
      : '';

    // Calculate sales price percentage difference = ((New - Old) / Old) × 100
    const salesPricePercentDiff = newSalesPrice > 0 && oldSalesPrice > 0
      ? (((newSalesPrice - oldSalesPrice) / oldSalesPrice) * 100).toFixed(1)
      : '';

    // Calculate distributor price difference
    const distPriceDiff = newDistributorPrice > 0 && oldDistributorPrice > 0
      ? (newDistributorPrice - oldDistributorPrice).toFixed(2)
      : '';

    // Calculate distributor price percentage difference = ((New - Old) / Old) × 100
    const distPricePercentDiff = newDistributorPrice > 0 && oldDistributorPrice > 0
      ? (((newDistributorPrice - oldDistributorPrice) / oldDistributorPrice) * 100).toFixed(1)
      : '';

    output.push({
      'Product Code': productCode,
      'Description': description,
      'Type': type,
      'Category': category,
      '': '', // Gap 1
      'Old Sales Price': oldSalesPrice || '',
      'New Sales Price': newSalesPrice || '',
      'Difference': salesPriceDiff,
      'Percentage Difference': salesPricePercentDiff,
      ' ': '', // Gap 2
      '  ': '', // Gap 3
      'Old Distributor Price': oldDistributorPrice || '',
      'New Distributor Price': newDistributorPrice || '',
      'Difference ': distPriceDiff,
      'Percentage Difference ': distPricePercentDiff
    });
  }

  console.log(`Processed ${output.length} products`);

  // Create CSV
  const headers = [
    'Product Code',
    'Description',
    'Type',
    'Category',
    '',
    'Old Sales Price',
    'New Sales Price',
    'Difference',
    'Percentage Difference',
    ' ',
    '  ',
    'Old Distributor Price',
    'New Distributor Price',
    'Difference ',
    'Percentage Difference '
  ];

  let csvOutput = headers.join(',') + '\n';
  for (const row of output) {
    csvOutput += headers.map(h => escapeCSVField(row[h])).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v11.csv');
  fs.writeFileSync(outputPath, csvOutput);

  const withSalesChange = output.filter(p => p['Percentage Difference'] !== '');
  const withDistChange = output.filter(p => p['Percentage Difference '] !== '');

  console.log(`\n✓ Created stock_list_enriched_v11.csv with ${output.length} products`);
  console.log(`- Products with sales price changes: ${withSalesChange.length}`);
  console.log(`- Products with distributor price changes: ${withDistChange.length}`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
