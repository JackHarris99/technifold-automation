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
  console.log('Reading stock_list_enriched_v7.csv...');
  const csvPath = path.join(process.cwd(), 'stock_list_enriched_v7.csv');
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

  // Process each row
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    const productCode = parts[colIndices['Product Code']] || '';
    const description = parts[colIndices['Description']] || '';
    const originalSalesPrice = parseFloat(parts[colIndices['Original Sales Price']]) || 0;
    const newSalesPrice = parseFloat(parts[colIndices['New Sales Price']]) || 0;
    const costPrice = parts[colIndices['Cost Price']] || '';
    const type = parts[colIndices['Type']] || '';
    const category = parts[colIndices['Category']] || '';
    const marginPercent = parts[colIndices['Margin %']] || '';
    const ginaPricing = parts[colIndices['Gina Pricing']] || '';
    const ginaPercent = parts[colIndices['Gina %']] || '';
    const uwePricing = parts[colIndices['Uwe Pricing']] || '';
    const uwePercent = parts[colIndices['Uwe %']] || '';
    const newDistributorPrice = parts[colIndices['New Distributor Price']] || '';
    const newDistributorPercent = parts[colIndices['New Distributor Price %']] || '';
    const lastOrderDate = parts[colIndices['Last Order Date']] || '';

    // Calculate difference
    let difference: any = '';
    if (newSalesPrice > 0 && originalSalesPrice > 0) {
      difference = (newSalesPrice - originalSalesPrice).toFixed(2);
    }

    output.push({
      'Product Code': productCode,
      'Description': description,
      'Original Sales Price': originalSalesPrice,
      'New Sales Price': newSalesPrice,
      'Difference': difference,
      'Cost Price': costPrice,
      'Type': type,
      'Category': category,
      'Margin %': marginPercent,
      'Gina Pricing': ginaPricing,
      'Gina %': ginaPercent,
      'Uwe Pricing': uwePricing,
      'Uwe %': uwePercent,
      'New Distributor Price': newDistributorPrice,
      'New Distributor Price %': newDistributorPercent,
      'Last Order Date': lastOrderDate
    });
  }

  console.log(`Processed ${output.length} products`);

  // Create CSV
  const headers = [
    'Product Code',
    'Description',
    'Original Sales Price',
    'New Sales Price',
    'Difference',
    'Cost Price',
    'Type',
    'Category',
    'Margin %',
    'Gina Pricing',
    'Gina %',
    'Uwe Pricing',
    'Uwe %',
    'New Distributor Price',
    'New Distributor Price %',
    'Last Order Date'
  ];

  let csvOutput = headers.join(',') + '\n';
  for (const row of output) {
    csvOutput += headers.map(h => escapeCSVField(row[h])).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v8.csv');
  fs.writeFileSync(outputPath, csvOutput);

  console.log(`\n✓ Created stock_list_enriched_v8.csv with ${output.length} products`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
