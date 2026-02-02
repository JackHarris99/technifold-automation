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
  console.log('Reading stock_list_enriched_v8.csv...');
  const csvPath = path.join(process.cwd(), 'stock_list_enriched_v8.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  // Parse header
  const headerParts = parseCSVLine(csvLines[0]);

  // Find column indices
  const colIndices: any = {};
  headerParts.forEach((header, index) => {
    colIndices[header] = index;
  });

  const output = [];
  let needsManualCount = 0;

  // Process each data row
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    const productCode = parts[colIndices['Product Code']] || '';
    const description = parts[colIndices['Description']] || '';
    const newSalesPrice = parseFloat(parts[colIndices['New Sales Price']]) || 0;
    const costPrice = parseFloat(parts[colIndices['Cost Price']]) || 0;
    const type = parts[colIndices['Type']] || '';
    const category = parts[colIndices['Category']] || '';
    const newDistributorPrice = parseFloat(parts[colIndices['New Distributor Price']]) || 0;
    const newDistributorPercent = parts[colIndices['New Distributor Price %']] || '';

    // Calculate Full Price Margin % = (Sales - Cost) / Sales × 100
    let fullPriceMargin = '';
    if (newSalesPrice > 0 && costPrice > 0) {
      fullPriceMargin = (((newSalesPrice - costPrice) / newSalesPrice) * 100).toFixed(1);
    }

    // Calculate Distributor Margin % = (Dist Price - Cost) / Dist Price × 100
    let distributorMargin = '';
    if (newDistributorPrice > 0 && costPrice > 0) {
      distributorMargin = (((newDistributorPrice - costPrice) / newDistributorPrice) * 100).toFixed(1);
    }

    // Flag for manual attention
    const needsManual = (!newDistributorPrice || newDistributorPrice === 0) ? 'NEEDS PRICING' : '';
    if (needsManual) needsManualCount++;

    output.push({
      'Action Required': needsManual,
      'Product Code': productCode,
      'Description': description,
      'New Sales Price': newSalesPrice || '',
      'Cost Price': costPrice || '',
      'Full Price Margin %': fullPriceMargin,
      '': '', // Gap column 1
      ' ': '', // Gap column 2
      'New Distributor Price': newDistributorPrice || '',
      'Cost Price ': costPrice || '', // Space to make unique key
      'Distributor Margin %': distributorMargin,
      '  ': '', // Gap column 3
      '   ': '', // Gap column 4
      'Type': type,
      'Category': category,
      '    ': '', // Gap column 5
      'Distributor %': newDistributorPercent
    });
  }

  console.log(`Processed ${output.length} products`);
  console.log(`- Products with distributor pricing: ${output.length - needsManualCount}`);
  console.log(`- Products needing manual pricing: ${needsManualCount}`);

  // Create CSV
  const headers = [
    'Action Required',
    'Product Code',
    'Description',
    'New Sales Price',
    'Cost Price',
    'Full Price Margin %',
    '',
    ' ',
    'New Distributor Price',
    'Cost Price ',
    'Distributor Margin %',
    '  ',
    '   ',
    'Type',
    'Category',
    '    ',
    'Distributor %'
  ];

  let csvOutput = headers.join(',') + '\n';
  for (const row of output) {
    csvOutput += headers.map(h => escapeCSVField(row[h])).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v9.csv');
  fs.writeFileSync(outputPath, csvOutput);

  console.log(`\n✓ Created stock_list_enriched_v9.csv with ${output.length} products`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
